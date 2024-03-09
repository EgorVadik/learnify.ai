'use server'

import {
    type RegisterSchema,
    type UpdateProfileSchema,
    registerSchema,
    updateProfileSchema,
} from './schema'
import { getServerAuthSession } from '@/server/auth'
import { hash } from 'bcrypt'
import { prisma } from '@/server/db'
import { ReturnValue } from '@/types'
import { getErrorMessage } from '@/lib/utils'
import { Role } from '@prisma/client'
import { backendClient } from '@/lib/edgestore-server'

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
        const { name, image } = updateProfileSchema.parse(data)
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
                name,
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
