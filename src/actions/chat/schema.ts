import { isMongoId } from '@/lib/utils'
import { z } from 'zod'

export const initializeCourseChatSchema = z.object({
    courseId: z.string().refine(isMongoId, {
        message: 'Invalid course id',
    }),
})

export type InitializeCourseChatSchema = z.input<
    typeof initializeCourseChatSchema
>

export const messageSchema = z.object({
    message: z
        .string()
        .min(1, {
            message: 'Message must be at least 1 character',
        })
        .max(2048, {
            message: 'Message must be less than 2048 characters',
        }),
})

export type MessageSchema = z.infer<typeof messageSchema>

export const startPrivateChatSchema = z.object({
    userId: z.string().refine(isMongoId, {
        message: 'Invalid user id',
    }),
    courseId: z.string().refine(isMongoId, {
        message: 'Invalid course id',
    }),
})

export type StartPrivateChatSchema = z.input<typeof startPrivateChatSchema>
