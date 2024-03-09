import { isMongoId } from '@/lib/utils'
import { z } from 'zod'

export const fileSchema = z.object({
    title: z.string().min(1).max(64),
    parentId: z
        .string()
        .nullable()
        .refine(
            (val) => {
                return val === null || isMongoId(val)
            },
            {
                message: 'Invalid id provided',
            },
        ),
})

export type FileSchema = z.infer<typeof fileSchema>

export const moveFileSchema = z.object({
    id: z.string(),
    parentId: z
        .string()
        .nullable()
        .refine(
            (val) => {
                return val === null || isMongoId(val)
            },
            {
                message: 'Invalid id provided',
            },
        ),
})

export type MoveFileSchema = z.infer<typeof moveFileSchema>

export const saveNoteSchema = z.object({
    id: z.string().refine(isMongoId, {
        message: 'Invalid id provided',
    }),
    content: z.string(),
})

export type SaveNoteSchema = z.infer<typeof saveNoteSchema>
