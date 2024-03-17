'use server'

import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { InviteStatus } from '@prisma/client'
import {
    type InviteUserToCourseSchema,
    type RequestCourseJoinSchema,
    type CreateCourseSchema,
    type UpdateCourseStatusSchema,
    type RemoveUserFromCourseSchema,
    type GetUserCoursesSchema,
    type CreateAnnouncementSchema,
    inviteUserToCourseSchema,
    requestCourseJoinSchema,
    createCourseSchema,
    updateCourseStatusSchema,
    getUserCoursesSchema,
    removeUserFromCourseSchema,
    createAnnouncementSchema,
    UploadMaterialActionSchema,
    uploadMaterialActionSchema,
} from './schema'
import { getErrorMessage, isMongoId } from '@/lib/utils'
import { ReturnValue } from '@/types'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { initializeCourseChat } from '../chat'

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

        const course = await prisma.course.create({
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

        const res = await initializeCourseChat({
            courseId: course.id,
        })

        if (!res.success) {
            await prisma.course.delete({
                where: {
                    id: course.id,
                },
            })
            return res
        }

        revalidateTag('something')

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
        const { courseId, email, role } = inviteUserToCourseSchema.parse(data)

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
                role: true,
            },
        })

        if (userToInvite === null) {
            return {
                success: false,
                error: 'User not found.',
            }
        }

        if (userToInvite.role === 'TEACHER' && role !== 'TEACHER') {
            return {
                success: false,
                error: 'This email belongs to a teacher. Please select a teacher role.',
            }
        }

        if (userToInvite.role === 'STUDENT' && role !== 'STUDENT') {
            return {
                success: false,
                error: 'This email belongs to a student. Please select a student role.',
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

        const senderId = await prisma.courseInvite.findUnique({
            where: {
                courseId_userId: {
                    courseId,
                    userId: user.id,
                },
            },
            select: {
                senderId: true,
            },
        })

        if (senderId == null)
            return {
                success: false,
                error: 'Invitation not found',
            }

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
            prisma.chat.updateMany({
                where: {
                    courseId,
                },
                data: {
                    userIds: {
                        push: user.id,
                    },
                },
            }),
        ])

        // const privateChat = await prisma.chat.findFirst({
        //     where: {
        //         // courseId,
        //         userIds: {
        //             equals: [user.id, senderId.senderId],
        //         },
        //         isGroup: false,
        //     },
        // })

        // console.log(privateChat)

        // if (privateChat === null) {
        //     await prisma.chat.create({
        //         data: {
        //             isGroup: false,
        //             courseId,
        //             userIds: {
        //                 set: [user.id, senderId.senderId],
        //             },
        //         },
        //     })
        // }

        const student = await prisma.student.findUnique({
            where: {
                userId: user.id,
            },
        })

        if (student) {
            await prisma.courseStatus.upsert({
                where: {
                    courseId_studentId: {
                        courseId,
                        studentId: student.id,
                    },
                },
                create: {
                    courseId,
                    studentId: student.id,
                    status: 'ENROLLED',
                },
                update: {
                    status: 'ENROLLED',
                },
            })
        }

        revalidateTag('user-courses')

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

export const getTeacherCourses = async (data: GetUserCoursesSchema = {}) => {
    const parsedData = getUserCoursesSchema.safeParse(data)
    if (!parsedData.success) return []

    const { getAll } = parsedData.data
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
            isCompleted: getAll == null ? false : undefined,
        },
    })

    return courses
}

export const getStudentCourses = async (data: GetUserCoursesSchema = {}) => {
    const parsedData = getUserCoursesSchema.safeParse(data)
    const session = await getServerAuthSession()
    if (session === null) {
        return []
    }

    if (!parsedData.success) return []
    const { getAll } = parsedData.data

    const courses = await prisma.student.findUnique({
        where: {
            userId: session.user.id,
        },
        select: {
            courseStatuses: {
                include: {
                    course: true,
                },
                where: {
                    status: getAll == null ? 'ENROLLED' : undefined,
                },
            },
        },
    })

    if (courses == null) return []
    return courses.courseStatuses
}

export const getUserInvitations = async () => {
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
        orderBy: {
            createdAt: 'desc',
        },
    })

    return invitations
}

export const getCourseName = async (courseId: string) => {
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
}

export const removeUserFromCourse = async (
    data: RemoveUserFromCourseSchema,
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You must be logged in to remove a user from a course.',
        }
    }

    try {
        const { courseId, userId } = removeUserFromCourseSchema.parse(data)

        await prisma.$transaction([
            prisma.course.update({
                where: {
                    id: courseId,
                },
                data: {
                    users: {
                        disconnect: {
                            id: userId,
                        },
                    },
                },
            }),
            prisma.courseInvite.delete({
                where: {
                    courseId_userId: {
                        courseId,
                        userId,
                    },
                },
            }),
            // prisma.chat.deleteMany({
            //     where: {
            //         courseId,
            //         userIds: {
            //             has: userId,
            //         },
            //         isGroup: false,
            //     },
            // }),
        ])

        const chat = await prisma.chat.findFirst({
            where: {
                courseId,
                userIds: {
                    has: userId,
                },
                isGroup: true,
            },
        })

        if (chat)
            await prisma.chat.update({
                where: {
                    id: chat.id,
                },
                data: {
                    users: {
                        disconnect: {
                            id: userId,
                        },
                    },
                },
            })

        const student = await prisma.student.findUnique({
            where: {
                userId,
            },
        })

        if (student) {
            await prisma.courseStatus.update({
                where: {
                    courseId_studentId: {
                        courseId,
                        studentId: student.id,
                    },
                },
                data: {
                    status: 'DROPPED',
                },
            })
        }

        revalidateTag('user-courses')

        return {
            success: true,
        }
    } catch (error) {
        console.log(error)

        return {
            success: false,
            error: getErrorMessage(error, {
                P2002: 'User not found in course.',
                P2025: 'Invalid course ID or user ID.',
            }),
        }
    }
}

export const createCourseAnnouncement = async (
    data: CreateAnnouncementSchema,
): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to create an announcement.',
            }
        }

        if (session.user.role !== 'TEACHER') {
            return {
                success: false,
                error: 'You must be a teacher to create an announcement.',
            }
        }

        const { courseId, title, content } =
            createAnnouncementSchema.parse(data)

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                userIds: true,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to create an announcement.',
            }
        }

        await prisma.announcement.create({
            data: {
                courseId,
                title,
                content,
            },
        })

        revalidateTag('course-announcements')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2025: 'Invalid course ID.',
            }),
        }
    }
}

export const uploadCourseMaterial = async (
    data: UploadMaterialActionSchema,
): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to upload course material.',
            }
        }

        if (session.user.role !== 'TEACHER') {
            return {
                success: false,
                error: 'You must be a teacher to upload course material.',
            }
        }

        const { courseId, title, content, files } =
            uploadMaterialActionSchema.parse(data)

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                userIds: true,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to upload course material.',
            }
        }

        await prisma.material.create({
            data: {
                courseId,
                title,
                content,
                attachments: files,
            },
        })

        revalidateTag('course-material')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2025: 'Invalid course ID.',
            }),
        }
    }
}
