'use server'

import {
    type RegisterSchema,
    type UpdateProfileSchema,
    type CreateTodoSchema,
    registerSchema,
    updateProfileSchema,
    createTodoSchema,
    ToggleTodoStatusSchema,
    toggleTodoStatusSchema,
} from './schema'
import { getServerAuthSession } from '@/server/auth'
import { hash } from 'bcrypt'
import { prisma } from '@/server/db'
import { ReturnValue, ReturnValueWithData } from '@/types'
import { getErrorMessage, isMongoId } from '@/lib/utils'
import { Role, type Todo } from '@prisma/client'
import { backendClient } from '@/lib/edgestore-server'
import { z } from 'zod'

export const createNewUser = async (
    userData: RegisterSchema,
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session !== null) {
        return {
            success: false,
            error: 'You are already logged in.',
        }
    }

    try {
        const { email, name, password, role } = registerSchema.parse(userData)

        role === Role.STUDENT
            ? await prisma.user.create({
                  data: {
                      email: email.toLowerCase(),
                      name,
                      password: await hash(password, 10),
                      role,
                      students: {
                          create: {},
                      },
                  },
              })
            : await prisma.user.create({
                  data: {
                      email: email.toLowerCase(),
                      name,
                      password: await hash(password, 10),
                      role,
                      teachers: {
                          create: {},
                      },
                  },
              })

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2002: 'Email already exists.',
            }),
        }
    }
}

export const editUserProfile = async (
    data: UpdateProfileSchema,
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You are not logged in.',
        }
    }

    try {
        const { image } = updateProfileSchema.parse(data)
        if (image != null && session.user.image != null) {
            await backendClient.profileImages.deleteFile({
                url: session.user.image,
            })
            await backendClient.profileImages.confirmUpload({
                url: image,
            })
        }

        await prisma.user.update({
            where: {
                id: session.user.id,
            },
            data: {
                image,
            },
        })

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}

export const createNewTodo = async (
    data: CreateTodoSchema,
): Promise<ReturnValueWithData<Todo>> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You are not logged in.',
        }
    }

    try {
        const { title } = createTodoSchema.parse(data)

        const todo = await prisma.todo.create({
            data: {
                title,
                userId: session.user.id,
            },
        })

        return {
            success: true,
            data: todo,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}

export const toggleTodoStatus = async (
    data: ToggleTodoStatusSchema,
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You are not logged in.',
        }
    }

    try {
        const { id, completed } = toggleTodoStatusSchema.parse(data)

        await prisma.todo.update({
            where: {
                id,
            },
            data: {
                completed,
            },
        })

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}

export const deleteTodo = async (id: string): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You are not logged in.',
        }
    }

    try {
        const validId = z.string().refine(isMongoId).parse(id)

        await prisma.todo.delete({
            where: {
                id: validId,
            },
        })

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}
