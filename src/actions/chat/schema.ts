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
