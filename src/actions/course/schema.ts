import { z } from 'zod'
import { isMongoId } from '@/lib/utils'
import { InviteStatus } from '@prisma/client'
import { addMinutes } from 'date-fns'

export const createCourseSchema = z.object({
    name: z
        .string()
        .min(1, {
            message: 'Course name must not be empty.',
        })
        .max(255, {
            message: 'Course name must not be longer than 255 characters.',
        }),
})

export type CreateCourseSchema = z.infer<typeof createCourseSchema>

export const inviteUserToCourseSchema = z.object({
    courseId: z.string().refine(isMongoId, {
        message: 'Invalid course ID.',
    }),
    email: z.string().email(),
    role: z.enum(['TEACHER', 'STUDENT']),
})

export type InviteUserToCourseSchema = z.infer<typeof inviteUserToCourseSchema>

export const requestCourseJoinSchema = z.object({
    courseId: z.string().refine(isMongoId, {
        message: 'Invalid course ID.',
    }),
})

export type RequestCourseJoinSchema = z.infer<typeof requestCourseJoinSchema>

export const updateCourseStatusSchema = z.object({
    courseId: z.string().refine(isMongoId, {
        message: 'Invalid course ID.',
    }),
    status: z.enum([InviteStatus.ACCEPTED, InviteStatus.REJECTED]),
})

export type UpdateCourseStatusSchema = z.infer<typeof updateCourseStatusSchema>

export const getUserCoursesSchema = z.object({
    getAll: z.boolean().default(false).optional(),
})

export type GetUserCoursesSchema = z.infer<typeof getUserCoursesSchema>

export const removeUserFromCourseSchema = z.object({
    courseId: z.string().refine(isMongoId, {
        message: 'Invalid course ID.',
    }),
    userId: z.string().refine(isMongoId, {
        message: 'Invalid user ID.',
    }),
})

export type RemoveUserFromCourseSchema = z.infer<
    typeof removeUserFromCourseSchema
>

export const filesSchema = z
    .array(
        z.object({
            url: z.string(),
            name: z.string(),
        }),
    )
    .min(1, {
        message: 'You must upload at least 1 file.',
    })
    .max(10, {
        message: 'You can only upload up to 10 files.',
    })

export type FilesSchema = z.infer<typeof filesSchema>

export const optionalFileSchema = filesSchema.optional()
export type OptionalFileSchema = z.infer<typeof optionalFileSchema>

export const createAnnouncementSchema = z.object({
    courseId: z.string().refine(isMongoId, {
        message: 'Invalid course ID.',
    }),
    title: z.string().min(1, {
        message: 'Title must not be empty.',
    }),
    content: z.string().min(1, {
        message: 'Details must not be empty.',
    }),
})

export type CreateAnnouncementSchema = z.infer<typeof createAnnouncementSchema>

export const createAnnouncementActionSchema = z.object({
    ...createAnnouncementSchema.shape,
    files: optionalFileSchema,
})

export type CreateAnnouncementActionSchema = z.infer<
    typeof createAnnouncementActionSchema
>

export const uploadMaterialSchema = z.object({
    ...createAnnouncementSchema.shape,
})

export type UploadMaterialSchema = z.infer<typeof uploadMaterialSchema>

export const uploadMaterialActionSchema = z.object({
    ...uploadMaterialSchema.shape,
    files: filesSchema,
})

export type UploadMaterialActionSchema = z.infer<
    typeof uploadMaterialActionSchema
>

export const editMaterialSchema = z.object({
    ...uploadMaterialSchema.shape,
    files: optionalFileSchema,
})

export type EditMaterialSchema = z.infer<typeof editMaterialSchema>

export const createTaskSchema = z.object({
    ...createAnnouncementSchema.shape,
    dueDate: z.date().min(addMinutes(new Date(), 5), {
        message: 'Due date must be at least 5 minute from now.',
    }),
})

export type CreateTaskSchema = z.infer<typeof createTaskSchema>

export const createTaskActionSchema = z.object({
    ...createTaskSchema.shape,
    files: optionalFileSchema,
})

export type CreateTaskActionSchema = z.infer<typeof createTaskActionSchema>

export const updateStatusSchema = z.object({
    itemId: z.string().refine(isMongoId, {
        message: 'Invalid ID.',
    }),
    completed: z.boolean(),
})

export type UpdateStatusSchema = z.infer<typeof updateStatusSchema>

export const uploadStudentTaskSchema = z.object({
    taskId: z.string().refine(isMongoId, {
        message: 'Invalid task ID.',
    }),
    files: filesSchema,
})

export type UploadStudentTaskSchema = z.infer<typeof uploadStudentTaskSchema>
