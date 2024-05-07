import { MainWrapper } from '@/components/online-exam/main-wrapper'
import { isMongoId } from '@/lib/utils'
import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import React from 'react'
import { z } from 'zod'

const paramsSchema = z.object({
    id: z.string().refine(isMongoId),
    'task-id': z.string().refine(isMongoId),
})

type Params = z.infer<typeof paramsSchema>

export default async function page({ params }: { params: Params }) {
    const parsedParams = paramsSchema.safeParse(params)
    if (!parsedParams.success) notFound()
    const { 'task-id': taskId, id } = parsedParams.data

    const exam = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            exam: {
                include: {
                    questions: true,
                },
            },
        },
    })

    if (!exam) notFound()
    if (!exam.exam) notFound()
    if (exam.type === 'ASSIGNMENT') notFound()
    if (exam.startDate == null) notFound()

    return (
        <MainWrapper
            courseId={id}
            defaultExamDetails={{
                content: exam.description,
                endDate: exam.dueDate,
                startDate: exam.startDate,
                title: exam.title,
            }}
            defaultQuestions={exam.exam.questions.map((q) => ({
                id: q.id,
                answer: q.answer,
                options: q.options,
                question: q.question,
                type: q.type,
            }))}
            examId={exam.exam.id}
        />
    )
}
