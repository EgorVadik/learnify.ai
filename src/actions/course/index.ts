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
    type CreateTaskActionSchema,
    type UploadMaterialActionSchema,
    type CreateAnnouncementActionSchema,
    type UpdateStatusSchema,
    type UploadStudentTaskSchema,
    type EditMaterialSchema,
    inviteUserToCourseSchema,
    requestCourseJoinSchema,
    createCourseSchema,
    updateCourseStatusSchema,
    getUserCoursesSchema,
    removeUserFromCourseSchema,
    uploadMaterialActionSchema,
    createTaskActionSchema,
    createAnnouncementActionSchema,
    updateStatusSchema,
    uploadStudentTaskSchema,
    editMaterialSchema,
} from './schema'
import { getErrorMessage, isMongoId } from '@/lib/utils'
import { ReturnValue } from '@/types'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import { initializeCourseChat } from '@/actions/chat'
import notificationapi from 'notificationapi-node-server-sdk'
import { backendClient } from '@/lib/edgestore-server'

notificationapi.init(
    process.env.NEXT_PUBLIC_NOTIFICATION_API_CLIENT_ID!,
    process.env.NOTIFICATION_API_CLIENT_SECRET!,
)

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

        const teacher = await prisma.teacher.findUnique({
            where: {
                userId: user.id,
            },
        })

        if (teacher === null) {
            return {
                success: false,
                error: 'Teacher not found.',
            }
        }

        const course = await prisma.course.create({
            data: {
                name,
                courseAdminId: teacher.id,
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

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                userIds: true,
                isCompleted: true,
            },
        })

        if (course === null || !course.userIds.includes(user.id)) {
            return {
                success: false,
                error: 'You do not have permission to invite a user to this course.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot invite a user to a completed course.',
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

        const invitation = await prisma.courseInvite.create({
            data: {
                courseId: courseId,
                userId: userToInvite.id,
                status: InviteStatus.PENDING_INVITE,
                senderId: user.id,
            },
            include: {
                course: {
                    select: {
                        name: true,
                    },
                },
            },
        })

        notificationapi.send({
            notificationId: 'new_course_invitation',
            user: {
                id: userToInvite.id,
            },
            mergeTags: {
                title: 'New Course Invitation',
                courseName: invitation.course.name,
                sender: user.name,
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
                    isGroup: true,
                },
                data: {
                    userIds: {
                        push: user.id,
                    },
                },
            }),
        ])

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
            userIds: {
                has: session.user.id,
            },
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

    if (session.user.role !== 'TEACHER') {
        return {
            success: false,
            error: 'You must be a teacher to remove a user from a course.',
        }
    }

    try {
        const { courseId, userId } = removeUserFromCourseSchema.parse(data)

        const teacher = await prisma.teacher.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (teacher === null) {
            return {
                success: false,
                error: 'Teacher not found.',
            }
        }

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                name: true,
                userIds: true,
                users: {
                    select: {
                        id: true,
                    },
                },
                isCompleted: true,
                courseAdmin: {
                    select: {
                        userId: true,
                    },
                },
            },
        })

        if (
            course === null ||
            !course.userIds.includes(session.user.id) ||
            course.courseAdmin.userId !== teacher.id
        ) {
            return {
                success: false,
                error: 'You do not have permission to remove a user from this course.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot remove a user from a completed course.',
            }
        }

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
                    dateDropped: new Date(),
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
                P2002: 'User not found in course.',
                P2025: 'Invalid course ID or user ID.',
            }),
        }
    }
}

export const createCourseAnnouncement = async (
    data: CreateAnnouncementActionSchema,
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

        const { courseId, title, content, files } =
            createAnnouncementActionSchema.parse(data)

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                name: true,
                userIds: true,
                users: {
                    select: {
                        id: true,
                    },
                },
                isCompleted: true,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to create an announcement.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot create an announcement in a completed course.',
            }
        }

        await prisma.announcement.create({
            data: {
                courseId,
                title,
                content,
                attachments: files,
            },
        })

        for (const user of course.users) {
            if (user.id !== session.user.id) {
                notificationapi.send({
                    notificationId: 'new_announcement',
                    user: {
                        id: user.id,
                    },
                    mergeTags: {
                        courseName: course.name,
                    },
                })
            }
        }

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
                name: true,
                userIds: true,
                users: {
                    select: {
                        id: true,
                    },
                },
                isCompleted: true,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to upload course material.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot upload material in a completed course.',
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

        for (const user of course.users) {
            if (user.id !== session.user.id) {
                notificationapi.send({
                    notificationId: 'new_material',
                    user: {
                        id: user.id,
                    },
                    mergeTags: {
                        courseName: course.name,
                    },
                })
            }
        }

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

export const getCourseIds = async () => {
    const session = await getServerAuthSession()
    if (session == null) return []

    const courses = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            courses: {
                select: {
                    id: true,
                },
            },
        },
    })

    const courseIds = courses?.courses.map((course) => course.id) || []

    return courseIds
}

export const createCourseTask = async (
    data: CreateTaskActionSchema,
): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to create a task.',
            }
        }

        if (session.user.role !== 'TEACHER') {
            return {
                success: false,
                error: 'You must be a teacher to create a task.',
            }
        }

        const { courseId, title, content, dueDate, files } =
            createTaskActionSchema.parse(data)

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                name: true,
                userIds: true,
                users: {
                    select: {
                        id: true,
                        role: true,
                    },
                },
                isCompleted: true,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to create a task.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot create a task in a completed course.',
            }
        }

        await prisma.task.create({
            data: {
                courseId,
                title,
                dueDate,
                description: content,
                type: 'ASSIGNMENT',
                attachments: files,
            },
        })

        for (const user of course.users) {
            if (user.role === 'STUDENT') {
                notificationapi.send({
                    notificationId: 'new_task',
                    user: {
                        id: user.id,
                    },
                    mergeTags: {
                        courseName: course.name,
                        type: 'assignment',
                        date: `due: ${dueDate.toDateString()}`,
                    },
                })
            }
        }

        revalidateTag('course-tasks')

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

export const updateTaskCompletion = async (
    data: UpdateStatusSchema,
): Promise<ReturnValue> => {
    try {
        const { itemId, completed } = updateStatusSchema.parse(data)

        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to update task completion.',
            }
        }

        const task = await prisma.task.findUnique({
            where: {
                id: itemId,
            },
            select: {
                courseId: true,
                type: true,
                dueDate: true,
                exam: {
                    select: {
                        examSubmissions: {
                            select: {
                                studentId: true,
                            },
                        },
                    },
                },
            },
        })

        if (task === null) {
            return {
                success: false,
                error: 'Task not found.',
            }
        }

        if (session.user.role === 'STUDENT') {
            const student = await prisma.student.findUnique({
                where: {
                    userId: session.user.id,
                },
            })

            if (student == null) {
                return {
                    success: false,
                    error: 'Something went wrong. Please try again.',
                }
            }

            if (task.type === 'ASSIGNMENT') {
                const studentUpload = await prisma.studentTaskUpload.findUnique(
                    {
                        where: {
                            studentId_taskId: {
                                studentId: student.id,
                                taskId: itemId,
                            },
                        },
                    },
                )

                if (studentUpload == null && completed) {
                    return {
                        success: false,
                        error: 'You must upload the task before marking it as complete.',
                    }
                }

                if (studentUpload != null && !completed) {
                    return {
                        success: false,
                        error: 'You cannot mark a task as incomplete after uploading it.',
                    }
                }
            } else {
                const examSubmission = task.exam?.examSubmissions.find(
                    (submission) => submission.studentId === student.id,
                )

                if (examSubmission == null && completed) {
                    return {
                        success: false,
                        error: 'You must submit the exam before marking it as complete.',
                    }
                }

                if (examSubmission != null && !completed) {
                    return {
                        success: false,
                        error: 'You cannot mark an exam as incomplete after submitting it.',
                    }
                }
            }
        }

        const course = await prisma.course.findUnique({
            where: {
                id: task.courseId,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to update task completion.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot mark a task as complete in a completed course.',
            }
        }

        if (completed) {
            await prisma.task.update({
                where: {
                    id: itemId,
                },
                data: {
                    completed: {
                        push: {
                            userId: session.user.id,
                            completed,
                        },
                    },
                },
            })
        } else {
            await prisma.task.update({
                where: {
                    id: itemId,
                },
                data: {
                    completed: {
                        deleteMany: {
                            where: {
                                userId: session.user.id,
                            },
                        },
                    },
                },
            })
        }

        revalidateTag('course-tasks')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2025: 'Invalid task ID.',
            }),
        }
    }
}

export const updateAnnouncementCompletion = async (
    data: UpdateStatusSchema,
): Promise<ReturnValue> => {
    try {
        const { itemId, completed } = updateStatusSchema.parse(data)

        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to update announcement completion.',
            }
        }

        const announcement = await prisma.announcement.findUnique({
            where: {
                id: itemId,
            },
            select: {
                courseId: true,
            },
        })

        if (announcement === null) {
            return {
                success: false,
                error: 'Announcement not found.',
            }
        }

        const course = await prisma.course.findUnique({
            where: {
                id: announcement.courseId,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to update announcement completion.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot mark an announcement as complete in a completed course.',
            }
        }

        if (completed) {
            await prisma.announcement.update({
                where: {
                    id: itemId,
                },
                data: {
                    completed: {
                        push: {
                            userId: session.user.id,
                            completed,
                        },
                    },
                },
            })
        } else {
            await prisma.announcement.update({
                where: {
                    id: itemId,
                },
                data: {
                    completed: {
                        deleteMany: {
                            where: {
                                userId: session.user.id,
                            },
                        },
                    },
                },
            })
        }

        revalidateTag('course-announcements')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2025: 'Invalid announcement ID.',
            }),
        }
    }
}

export const updateMaterialCompletion = async (
    data: UpdateStatusSchema,
): Promise<ReturnValue> => {
    try {
        const { itemId, completed } = updateStatusSchema.parse(data)

        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to update material completion.',
            }
        }

        const material = await prisma.material.findUnique({
            where: {
                id: itemId,
            },
            select: {
                courseId: true,
            },
        })

        if (material === null) {
            return {
                success: false,
                error: 'Material not found.',
            }
        }

        const course = await prisma.course.findUnique({
            where: {
                id: material.courseId,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to update material completion.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot mark a material as complete in a completed course.',
            }
        }

        if (completed) {
            await prisma.material.update({
                where: {
                    id: itemId,
                },
                data: {
                    completed: {
                        push: {
                            userId: session.user.id,
                            completed,
                        },
                    },
                },
            })
        } else {
            await prisma.material.update({
                where: {
                    id: itemId,
                },
                data: {
                    completed: {
                        deleteMany: {
                            where: {
                                userId: session.user.id,
                            },
                        },
                    },
                },
            })
        }

        revalidateTag('course-material')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2025: 'Invalid material ID.',
            }),
        }
    }
}

export const uploadStudentTask = async (
    data: UploadStudentTaskSchema,
): Promise<ReturnValue> => {
    try {
        const { files, taskId } = uploadStudentTaskSchema.parse(data)

        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to upload a task.',
            }
        }

        if (session.user.role !== 'STUDENT') {
            return {
                success: false,
                error: 'You must be a student to submit a task.',
            }
        }

        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
            select: {
                courseId: true,
            },
        })

        if (task === null) {
            return {
                success: false,
                error: 'Task not found.',
            }
        }

        const student = await prisma.student.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (student == null) {
            return {
                success: false,
                error: 'Student not found.',
            }
        }

        const course = await prisma.course.findUnique({
            where: {
                id: task.courseId,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to upload a task.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot submit a task in a completed course.',
            }
        }

        await prisma.$transaction([
            prisma.task.update({
                where: {
                    id: taskId,
                },
                data: {
                    completed: {
                        push: {
                            userId: session.user.id,
                            completed: true,
                        },
                    },
                },
            }),
            prisma.studentTaskUpload.create({
                data: {
                    taskId,
                    attachments: files,
                    studentId: student.id,
                },
            }),
        ])

        revalidateTag('course-tasks')
        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2002: 'Task already submitted.',
                P2025: 'Invalid task ID.',
            }),
        }
    }
}

export const editCourseAnnouncement = async (
    data: CreateAnnouncementActionSchema,
    announcementId: string,
    filesToDelete?: string[],
): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to edit an announcement.',
            }
        }

        if (session.user.role !== 'TEACHER') {
            return {
                success: false,
                error: 'You must be a teacher to edit an announcement.',
            }
        }

        const { courseId, title, content, files } =
            createAnnouncementActionSchema.parse(data)
        const id = z.string().refine(isMongoId).parse(announcementId)
        const parsedFilesToDelete = z
            .array(z.string())
            .optional()
            .parse(filesToDelete)

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                name: true,
                userIds: true,
                users: {
                    select: {
                        id: true,
                    },
                },
                isCompleted: true,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to edit an announcement.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot edit an announcement in a completed course.',
            }
        }

        const announcement = await prisma.announcement.findUnique({
            where: {
                id,
            },
        })

        if (announcement === null) {
            return {
                success: false,
                error: 'Announcement not found.',
            }
        }

        const filteredFiles = announcement.attachments.filter(
            (file) => !parsedFilesToDelete?.includes(file.url),
        )

        const mergedFiles = [...filteredFiles, ...(files ?? [])]

        if (mergedFiles.length > 10) {
            return {
                success: false,
                error: 'You can only upload up to 10 files.',
            }
        }

        if (parsedFilesToDelete != null && parsedFilesToDelete.length > 0) {
            await Promise.all(
                parsedFilesToDelete.map(async (url) =>
                    backendClient.documents.deleteFile({
                        url,
                    }),
                ),
            )
        }

        await prisma.announcement.update({
            where: {
                id,
            },
            data: {
                content,
                attachments: mergedFiles,
                title,
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

export const editCourseMaterial = async (
    data: EditMaterialSchema,
    materialId: string,
    filesToDelete?: string[],
): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to edit course material.',
            }
        }

        if (session.user.role !== 'TEACHER') {
            return {
                success: false,
                error: 'You must be a teacher to edit course material.',
            }
        }

        const { courseId, title, content, files } =
            editMaterialSchema.parse(data)
        const id = z.string().refine(isMongoId).parse(materialId)
        const parsedFilesToDelete = z
            .array(z.string())
            .optional()
            .parse(filesToDelete)

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                name: true,
                userIds: true,
                users: {
                    select: {
                        id: true,
                    },
                },
                isCompleted: true,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to edit course material.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot edit course material in a completed course.',
            }
        }

        const material = await prisma.material.findUnique({
            where: {
                id,
            },
        })

        if (material === null) {
            return {
                success: false,
                error: 'Material not found.',
            }
        }

        const filteredFiles = material.attachments.filter(
            (file) => !parsedFilesToDelete?.includes(file.url),
        )

        const mergedFiles = [...filteredFiles, ...(files ?? [])]

        if (mergedFiles.length === 0) {
            return {
                success: false,
                error: 'You must have at least one file attached.',
            }
        }

        if (mergedFiles.length > 10) {
            return {
                success: false,
                error: 'You can only upload up to 10 files.',
            }
        }

        if (parsedFilesToDelete != null && parsedFilesToDelete.length > 0) {
            await Promise.all(
                parsedFilesToDelete.map(async (url) =>
                    backendClient.documents.deleteFile({
                        url,
                    }),
                ),
            )
        }

        await prisma.material.update({
            where: {
                id,
            },
            data: {
                content,
                attachments: mergedFiles,
                title,
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

export const editCourseTask = async (
    data: CreateTaskActionSchema,
    taskId: string,
    filesToDelete?: string[],
): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to edit a task.',
            }
        }

        if (session.user.role !== 'TEACHER') {
            return {
                success: false,
                error: 'You must be a teacher to edit a task.',
            }
        }

        const { courseId, title, content, dueDate, files } =
            createTaskActionSchema.parse(data)
        const id = z.string().refine(isMongoId).parse(taskId)
        const parsedFilesToDelete = z
            .array(z.string())
            .optional()
            .parse(filesToDelete)

        const course = await prisma.course.findUnique({
            where: {
                id: courseId,
            },
            select: {
                name: true,
                userIds: true,
                users: {
                    select: {
                        id: true,
                    },
                },
                isCompleted: true,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to edit a task.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot edit a task in a completed course.',
            }
        }

        const task = await prisma.task.findUnique({
            where: {
                id,
            },
        })

        if (task === null) {
            return {
                success: false,
                error: 'Task not found.',
            }
        }

        const filteredFiles = task.attachments.filter(
            (file) => !parsedFilesToDelete?.includes(file.url),
        )

        const mergedFiles = [...filteredFiles, ...(files ?? [])]

        if (mergedFiles.length > 10) {
            return {
                success: false,
                error: 'You can only upload up to 10 files.',
            }
        }

        if (parsedFilesToDelete != null && parsedFilesToDelete.length > 0) {
            await Promise.all(
                parsedFilesToDelete.map(async (url) =>
                    backendClient.documents.deleteFile({
                        url,
                    }),
                ),
            )
        }

        await prisma.task.update({
            where: {
                id,
            },
            data: {
                description: content,
                attachments: mergedFiles,
                title,
                dueDate,
            },
        })

        revalidateTag('course-tasks')

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

export const endCourse = async (courseId: string): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (session === null) {
            return {
                success: false,
                error: 'You must be logged in to end a course.',
            }
        }

        if (session.user.role !== 'TEACHER') {
            return {
                success: false,
                error: 'You must be a teacher to end a course.',
            }
        }

        const id = z.string().refine(isMongoId).parse(courseId)

        const course = await prisma.course.findUnique({
            where: {
                id,
            },
            select: {
                userIds: true,
                courseAdmin: {
                    select: {
                        userId: true,
                    },
                },
                isCompleted: true,
            },
        })

        if (course === null || !course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to end the course.',
            }
        }

        if (course.courseAdmin.userId !== session.user.id) {
            return {
                success: false,
                error: 'You must be the course admin to end the course.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'The course is already completed.',
            }
        }

        await prisma.$transaction([
            prisma.course.update({
                where: {
                    id,
                },
                data: {
                    isCompleted: true,
                    dateCompleted: new Date(),
                    userIds: {
                        set: course.userIds.filter(
                            (id) => id === session.user.id,
                        ),
                    },
                },
            }),
            prisma.courseStatus.updateMany({
                where: {
                    courseId: id,
                },
                data: {
                    status: 'DONE',
                },
            }),
            prisma.chat.deleteMany({
                where: {
                    courseId: id,
                    isGroup: true,
                },
            }),
        ])

        revalidateTag('user-courses')

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
