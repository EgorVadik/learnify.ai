'use server'

import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import {
    type InitializeCourseChatSchema,
    initializeCourseChatSchema,
} from './schema'
import { ReturnValue } from '@/types'
import { getErrorMessage, isMongoId } from '@/lib/utils'
import { z } from 'zod'

export const initializeCourseChat = async (
    data: InitializeCourseChatSchema,
): Promise<ReturnValue> => {
    try {
        const { courseId } = initializeCourseChatSchema.parse(data)

        const session = await getServerAuthSession()
        if (!session) {
            return {
                success: false,
                error: 'Not authenticated',
            }
        }

        await prisma.chat.create({
            data: {
                courseId,
                users: {
                    connect: {
                        id: session.user.id,
                    },
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
                P2002: 'Chat already exists for this course.',
            }),
        }
    }
}

export const getCourseChats = async (courseId: string) => {
    const session = await getServerAuthSession()
    if (!session) {
        return []
    }

    const parsedId = z.string().refine(isMongoId).safeParse(courseId)

    if (!parsedId.success) return []

    return prisma.chat.findMany({
        where: {
            courseId: parsedId.data,
            userIds: {
                has: session.user.id,
            },
        },
        include: {
            course: {
                select: {
                    name: true,
                },
            },
            messages: {
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            },
        },
    })
}

export const getChatMessages = async (chatId: string) => {
    const session = await getServerAuthSession()
    if (!session) {
        return null
    }

    const parsedId = z.string().refine(isMongoId).safeParse(chatId)

    if (!parsedId.success) return null
    return prisma.chat.findUnique({
        where: {
            id: parsedId.data,
        },
        include: {
            course: {
                select: {
                    name: true,
                },
            },
            users: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
            },
            messages: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 50,
            },
        },
    })
}
