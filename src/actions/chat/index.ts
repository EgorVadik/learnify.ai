'use server'

import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import {
    type InitializeCourseChatSchema,
    type StartPrivateChatSchema,
    initializeCourseChatSchema,
    startPrivateChatSchema,
    messageSchema,
} from './schema'
import { ReturnValue, ReturnValueWithData } from '@/types'
import { getErrorMessage, isMongoId } from '@/lib/utils'
import { z } from 'zod'
import notificationapi from 'notificationapi-node-server-sdk'

notificationapi.init(
    process.env.NEXT_PUBLIC_NOTIFICATION_API_CLIENT_ID!,
    process.env.NOTIFICATION_API_CLIENT_SECRET!,
)

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

export const getCourseChats = async () => {
    const session = await getServerAuthSession()
    if (!session) {
        return []
    }

    return prisma.chat.findMany({
        where: {
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
            users: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                },
                take: 2,
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
    const chat = await prisma.chat.findUnique({
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
                    createdAt: 'asc',
                },
            },
        },
    })

    if (chat == null || !chat.userIds.includes(session.user.id)) return null

    return chat
}

export const updateChatReadStatus = async (chatId: string) => {
    const session = await getServerAuthSession()
    if (!session) {
        return {
            success: false,
            error: 'Not authenticated',
        }
    }

    try {
        const parsedId = z.string().refine(isMongoId).parse(chatId)

        const chat = await prisma.chat.findUnique({
            where: {
                id: parsedId,
            },
            select: {
                hasUnread: true,
            },
        })

        if (chat == null) {
            return {
                success: true,
            }
        }

        await prisma.chat.update({
            where: {
                id: parsedId,
            },
            data: {
                hasUnread: {
                    set: chat.hasUnread.map((usr) => {
                        if (usr.userId === session.user.id) {
                            return {
                                userId: usr.userId,
                                unReadCount: null,
                            }
                        }

                        return usr
                    }),
                },
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

export const createChatMessage = async (
    chatId: string,
    content: string,
    activeUsers: string[],
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (!session) {
        return {
            success: false,
            error: 'Not authenticated',
        }
    }

    const parsedId = z.string().refine(isMongoId).safeParse(chatId)

    if (!parsedId.success) {
        return {
            success: false,
            error: 'Invalid chat id',
        }
    }

    try {
        const parsedActiveUsers = z
            .array(z.string().refine(isMongoId))
            .parse(activeUsers)
        const parseContent = messageSchema.parse({ message: content })
        await prisma.message.create({
            data: {
                chatId: parsedId.data,
                content: parseContent.message,
                userId: session.user.id,
            },
        })

        const chat = await prisma.chat.findUnique({
            where: {
                id: parsedId.data,
            },
            select: {
                hasUnread: true,
                course: {
                    select: {
                        name: true,
                    },
                },
                users: {
                    where: {
                        id: {
                            not: session.user.id,
                        },
                    },
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        if (chat == null) {
            return {
                success: true,
            }
        }

        const filteredUsers = chat.users.filter(
            (user) => !parsedActiveUsers.includes(user.id),
        )

        filteredUsers.forEach((user) => {
            notificationapi.send({
                notificationId: 'new_message',
                user: {
                    id: user.id,
                },
                mergeTags: {
                    sender: session.user.name,
                    message: parseContent.message,
                },
            })
        })

        await prisma.chat.update({
            where: {
                id: parsedId.data,
            },
            data: {
                hasUnread: {
                    set: filteredUsers.map((user) => ({
                        userId: user.id,
                        unReadCount:
                            (chat.hasUnread.find(
                                (usr) => usr.userId === user.id,
                            )?.unReadCount ?? 0) + 1,
                    })),
                },
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

export const getChatMembers = async (chatId: string) => {
    const session = await getServerAuthSession()
    if (!session) {
        return null
    }

    const parsedId = z.string().refine(isMongoId).safeParse(chatId)

    if (!parsedId.success) return null
    const chat = await prisma.chat.findUnique({
        where: {
            id: parsedId.data,
        },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                    courses: {
                        where: {
                            userIds: {
                                has: session.user.id,
                            },
                        },
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    chats: {
                        where: {
                            isGroup: false,
                            userIds: {
                                has: session.user.id,
                            },
                        },
                        select: {
                            id: true,
                            userIds: true,
                        },
                    },
                },
                orderBy: {
                    name: 'asc',
                },
            },
        },
    })

    if (chat == null || !chat.userIds.includes(session.user.id)) return null

    return chat
}

export const startPrivateChat = async (
    data: StartPrivateChatSchema,
): Promise<ReturnValueWithData<{ url: string }>> => {
    const session = await getServerAuthSession()
    if (!session) {
        return {
            success: false,
            error: 'Not authenticated',
        }
    }

    try {
        const { userId, courseId } = startPrivateChatSchema.parse(data)

        const exists = await prisma.chat.findFirst({
            where: {
                AND: [
                    {
                        isGroup: false,
                    },
                    {
                        userIds: {
                            hasEvery: [session.user.id, userId],
                        },
                    },
                ],
            },
        })

        if (exists) {
            return {
                success: true,
                data: {
                    url: `/dashboard/${session.user.role.toLowerCase()}/chat/${exists.id}`,
                },
            }
        }

        const chat = await prisma.chat.create({
            data: {
                courseId,
                isGroup: false,
                users: {
                    connect: [
                        {
                            id: session.user.id,
                        },
                        {
                            id: userId,
                        },
                    ],
                },
            },
        })

        return {
            success: true,
            data: {
                url: `/dashboard/${session.user.role.toLowerCase()}/chat/${chat.id}`,
            },
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}
