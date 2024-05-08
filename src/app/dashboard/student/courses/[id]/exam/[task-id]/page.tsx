import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import React from 'react'
import { isBefore, isEqual, isAfter } from 'date-fns'
import { StudentExamForm } from '@/components/forms/student-exam-form'
import { ExamHeader } from '@/components/nav/exam-header'
import { getServerAuthSession } from '@/server/auth'
import { type Params, paramsSchema } from '@/actions/course/schema'

export default async function page({ params }: { params: Params }) {
    const parsedParams = paramsSchema.safeParse(params)
    if (!parsedParams.success) notFound()
    const { 'task-id': taskId, id } = parsedParams.data

    const session = await getServerAuthSession()

    const exam = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            exam: {
                select: {
                    id: true,
                    duration: true,
                    questions: {
                        select: {
                            id: true,
                            question: true,
                            options: true,
                            type: true,
                        },
                    },
                    examSubmissions: {
                        where: {
                            student: {
                                userId: session?.user.id,
                            },
                        },
                        select: {
                            student: {
                                select: {
                                    userId: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!exam || exam.type !== 'EXAM') notFound()
    if (exam.exam === null) notFound()
    if (!exam.startDate) notFound()
    if (exam.exam.examSubmissions.length > 0) notFound()

    if (isBefore(new Date(), exam.startDate)) notFound()
    if (isAfter(new Date(), exam.dueDate)) notFound()

    if (
        (isEqual(new Date(), exam.startDate) ||
            isAfter(new Date(), exam.startDate)) &&
        isBefore(new Date(), exam.dueDate)
    ) {
        return (
            <div>
                <ExamHeader
                    startDate={exam.startDate}
                    endDate={exam.dueDate}
                    title={exam.title}
                />
                <main className='px-10 pb-10 pt-4'>
                    <StudentExamForm
                        questions={exam.exam.questions.map((question) => ({
                            ...question,
                            answer: '',
                        }))}
                        taskId={exam.id}
                        courseId={id}
                    />
                </main>
            </div>
        )
    }

    return notFound()
}
