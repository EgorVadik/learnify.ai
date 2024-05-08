import { z } from 'zod'
import { QuestionType } from '@prisma/client'
import { addMinutes } from 'date-fns'
import { createAnnouncementSchema } from '@/actions/course/schema'
import { isMongoId } from '@/lib/utils'

export const questionsSchema = z
    .array(
        z
            .object({
                id: z.string(),
                question: z.string().min(1),
                answer: z.string().min(1),
                options: z.array(z.string()).optional(),
                type: z.nativeEnum(QuestionType),
            })
            .refine((data) => {
                switch (data.type) {
                    case 'MULTIPLE_CHOICE':
                        return data.options !== undefined
                    case 'TRUE_FALSE':
                        return data.answer === 'true' || data.answer === 'false'
                }
                return true
            }),
    )
    .min(1, {
        message: 'You must have at least one question.',
    })

export type QuestionsSchema = z.infer<typeof questionsSchema>

export const createExamSchema = z
    .object({
        ...createAnnouncementSchema.shape,
        startDate: z.date().min(addMinutes(new Date(), 5), {
            message: 'Due date must be at least 5 minute from now.',
        }),
        endDate: z.date().min(addMinutes(new Date(), 5), {
            message: 'Due date must be at least 5 minute from now.',
        }),
    })
    .refine((data) => data.startDate < data.endDate, {
        message: 'Start date must be before end date.',
        path: ['startDate'],
    })

export type CreateExamSchema = z.infer<typeof createExamSchema>

export const submitStudentExamSchema = z.object({
    answers: z.array(
        z.object({
            id: z.string().refine(isMongoId),
            answer: z.string(),
        }),
    ),
    taskId: z.string().refine(isMongoId),
})

export type SubmitStudentExamSchema = z.infer<typeof submitStudentExamSchema>

export const editGradeSchema = z.object({
    grade: z.number().int().min(0).max(100),
    submissionId: z.string().refine(isMongoId),
})

export type EditGradeSchema = z.infer<typeof editGradeSchema>
