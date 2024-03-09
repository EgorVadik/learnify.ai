'use server'

import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { InviteStatus } from '@prisma/client'
import {
    inviteUserToCourseSchema,
    requestCourseJoinSchema,
    createCourseSchema,
    updateCourseStatusSchema,
    type InviteUserToCourseSchema,
    type RequestCourseJoinSchema,
    type CreateCourseSchema,
    type UpdateCourseStatusSchema,
} from './schema'
import { getErrorMessage, isMongoId } from '@/lib/utils'
import { ReturnValue } from '@/types'
import { unstable_cache as cache, revalidateTag } from 'next/cache'
import { z } from 'zod'

export const createCourse = async (
    data: CreateCourseSchema,
): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to create a course.',
            }
        }

        const { name } = createCourseSchema.parse(data)

        const { user } = session

        if (user.role !== 'TEACHER') {
            return {
                success: false,
                error: 'You must be a teacher to create a course.',
            }
        }

        await prisma.course.create({
            data: {
                name,
                courseAdminId: user.id,
                users: {
                    connect: {
                        id: user.id,
                    },
                },
            },
        })

        revalidateTag('user-courses')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2002: 'Course already exists.',
                P2025: 'Invalid course admin ID.',
            }),
        }
    }
}

export const inviteUserToCourse = async (
    data: InviteUserToCourseSchema,
): Promise<ReturnValue> => {
    try {
        const { courseId, email } = inviteUserToCourseSchema.parse(data)

        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to invite a user to a course.',
            }
        }

        const { user } = session

        if (user.role !== 'TEACHER') {
            return {
                success: false,
                error: 'You must be a teacher to invite a user to a course.',
            }
        }

        const userToInvite = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
            },
        })

        if (userToInvite === null) {
            return {
                success: false,
                error: 'User not found.',
            }
        }

        await prisma.courseInvite.create({
            data: {
                courseId: courseId,
                userId: userToInvite.id,
                status: InviteStatus.PENDING_INVITE,
                senderId: user.id,
            },
        })

        revalidateTag('user-invitations')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2002: 'Course invite already exists.',
                P2025: 'Invalid course ID or user ID.',
                ZodError: 'Invalid course ID or email provided.',
            }),
        }
    }
}

export const requestCourseJoin = async ({
    courseId,
}: RequestCourseJoinSchema): Promise<ReturnValue> => {
    try {
        const validData = requestCourseJoinSchema.parse({ courseId })

        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to request to join a course.',
            }
        }

        const { user } = session

        await prisma.courseInvite.create({
            data: {
                courseId: validData.courseId,
                userId: user.id,
                status: InviteStatus.PENDING_REQUEST,
                senderId: user.id,
            },
        })

        revalidateTag('user-invitations')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2002: 'You have already requested to join this course.',
                P2025: 'Invalid course ID or user ID.',
                ZodError: 'Invalid course ID provided.',
            }),
        }
    }
}

export const updateCourseStatus = async (
    data: UpdateCourseStatusSchema,
): Promise<ReturnValue> => {
    try {
        const { courseId, status } = updateCourseStatusSchema.parse(data)

        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to request to join a course.',
            }
        }

        const { user } = session

        if (status === 'REJECTED') {
            await prisma.courseInvite.update({
                where: {
                    courseId_userId: {
                        courseId,
                        userId: user.id,
                    },
                },
                data: {
                    status: InviteStatus.REJECTED,
                },
            })

            revalidateTag('user-invitations')

            return {
                success: true,
            }
        }

        await prisma.$transaction([
            prisma.courseInvite.update({
                where: {
                    courseId_userId: {
                        courseId,
                        userId: user.id,
                    },
                },
                data: {
                    status: InviteStatus.ACCEPTED,
                },
            }),
            prisma.course.update({
                where: {
                    id: courseId,
                },
                data: {
                    users: {
                        connect: {
                            id: user.id,
                        },
                    },
                },
            }),
        ])

        revalidateTag('user-courses')
        revalidateTag('user-invitations')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2002: 'You have already requested to join this course.',
                P2025: 'Invalid course ID or user ID.',
                ZodError: 'Invalid data provided.',
            }),
        }
    }
}

export const getUserCourses = cache(
    async () => {
        const session = await getServerAuthSession()
        if (session === null) {
            return []
        }

        const courses = await prisma.course.findMany({
            where: {
                OR: [
                    {
                        courseAdminId: session.user.id,
                    },
                    {
                        userIds: {
                            has: session.user.id,
                        },
                    },
                ],
            },
        })

        return courses
    },
    ['user-courses'],
    {
        tags: ['user-courses'],
    },
)

export const getUserInvitations = cache(
    async () => {
        const session = await getServerAuthSession()
        if (session === null) {
            return []
        }

        const invitations = await prisma.courseInvite.findMany({
            where: {
                userId: session.user.id,
                status: {
                    in: ['PENDING_INVITE', 'PENDING_REQUEST'],
                },
            },
            include: {
                sender: {
                    select: {
                        name: true,
                    },
                },
                course: {
                    select: {
                        name: true,
                    },
                },
            },
        })

        return invitations
    },
    ['user-invitations'],
    {
        tags: ['user-invitations'],
    },
)

export const getCourseName = cache(async (courseId: string) => {
    try {
        const id = z
            .string()
            .refine(isMongoId, {
                message: 'Invalid course ID provided.',
            })
            .parse(courseId)
        const course = await prisma.course.findUnique({
            where: {
                id,
            },
            select: {
                name: true,
            },
        })

        if (course === null) return null

        return course.name
    } catch (error) {
        return null
    }
})
