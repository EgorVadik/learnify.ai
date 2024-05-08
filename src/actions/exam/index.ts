'use server'

import type { ReturnValue } from '@/types'
import {
    type CreateExamSchema,
    type QuestionsSchema,
    type EditGradeSchema,
    type SubmitStudentExamSchema,
    createExamSchema,
    questionsSchema,
    submitStudentExamSchema,
    editGradeSchema,
} from './schema'
import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { getErrorMessage, isMongoId } from '@/lib/utils'
import notificationapi from 'notificationapi-node-server-sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SOLVE_EXAM_PROMPT } from '@/lib/constants'
import { z } from 'zod'

notificationapi.init(
    process.env.NEXT_PUBLIC_NOTIFICATION_API_CLIENT_ID!,
    process.env.NOTIFICATION_API_CLIENT_SECRET!,
)

export const createExam = async (
    examDetails: CreateExamSchema,
    examQuestions: QuestionsSchema,
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You must be logged in to create an exam.',
        }
    }

    if (session.user.role !== 'TEACHER') {
        return {
            success: false,
            error: 'You must be a teacher to create an exam.',
        }
    }

    try {
        const { content, courseId, endDate, startDate, title } =
            createExamSchema.parse(examDetails)
        const questions = questionsSchema.parse(examQuestions)

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
                error: 'You cannot create a task for a completed course.',
            }
        }

        await prisma.task.create({
            data: {
                description: content,
                title,
                dueDate: endDate,
                startDate,
                type: 'EXAM',
                courseId,
                exam: {
                    create: {
                        duration: endDate.getTime() - startDate.getTime(),
                        questions: {
                            createMany: {
                                data: questions.map((question) => ({
                                    answer: question.answer,
                                    question: question.question,
                                    options: question.options,
                                    type: question.type,
                                })),
                            },
                        },
                    },
                },
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
                        type: 'exam',
                        date: `starts at: ${startDate.toDateString()}`,
                    },
                })
            }
        }

        return { success: true }
    } catch (error) {
        return { success: false, error: getErrorMessage(error) }
    }
}

export const submitStudentAnswers = async (
    data: SubmitStudentExamSchema,
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You must be logged in to submit an exam.',
        }
    }

    if (session.user.role !== 'STUDENT') {
        return {
            success: false,
            error: 'You must be a student to submit an exam.',
        }
    }

    try {
        const { answers, taskId } = submitStudentExamSchema.parse(data)

        const task = await prisma.task.findUnique({
            where: {
                id: taskId,
            },
            select: {
                course: {
                    select: {
                        id: true,
                        isCompleted: true,
                        userIds: true,
                    },
                },
                exam: {
                    select: {
                        id: true,
                        questions: {
                            select: {
                                id: true,
                                answer: true,
                                type: true,
                                question: true,
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

        if (!task.course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to submit an exam.',
            }
        }

        if (task.course.isCompleted) {
            return {
                success: false,
                error: 'You cannot submit an exam for a completed course.',
            }
        }

        if (task.exam === null) {
            return {
                success: false,
                error: 'Task is not an exam.',
            }
        }

        if (task.exam.questions.length !== answers.length) {
            return {
                success: false,
                error: 'Invalid number of answers.',
            }
        }

        const student = await prisma.student.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (student === null) {
            return {
                success: false,
                error: 'Student not found.',
            }
        }

        const writtenQuestions = task.exam.questions
            .filter(
                (question) =>
                    question.type === 'LONG_ANSWER' ||
                    question.type === 'SHORT_ANSWER',
            )
            .map((question) => ({
                ...question,
                studentAnswer:
                    answers.find((answer) => answer.id === question.id)
                        ?.answer ?? '',
            }))

        const examPrompt = SOLVE_EXAM_PROMPT(
            writtenQuestions
                .map(
                    (question, index) =>
                        `**Question ID: ${question.id}** -- **Question ${index + 1}:** ${question.question}?: Model Answer: ${
                            question.answer
                        }`,
                )
                .join('\n\n'),
            writtenQuestions
                .map(
                    (question, index) =>
                        `**Answer for question ${index + 1}:** ${question.studentAnswer}`,
                )
                .join('\n\n'),
        )

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
        const response = await model.generateContent(examPrompt)

        const regex = /"(\w+)":\s*\{[^{}]*\}/g
        const match = response.response.text().match(regex)
        const jsonString = `{${match?.map((val) => val.replaceAll('\t', '')).join(',')}}`
        const jsonResponse = JSON.parse(jsonString ?? '{}') as Record<
            string,
            {
                score: number
                explanation: string
                question: string
                modelAnswer: string
                studentAnswer: string
                questionId: string
            }
        >

        const otherQuestions = task.exam.questions.filter(
            (question) =>
                question.type !== 'LONG_ANSWER' &&
                question.type !== 'SHORT_ANSWER',
        )

        const totalScore =
            otherQuestions.reduce((acc, question) => {
                const studentAnswer = answers.find(
                    (answer) => answer.id === question.id,
                )?.answer

                if (studentAnswer === undefined) {
                    return acc
                }

                return acc + (question.answer === studentAnswer ? 100 : 0)
            }, 0) +
            writtenQuestions.reduce((acc, question) => {
                return acc + jsonResponse[question.id].score
            }, 0)

        await prisma.examSubmission.create({
            data: {
                examId: task.exam.id,
                studentId: student.id,
                score: totalScore / task.exam.questions.length,
                status: 'GRADED',
                submissionAnswers: {
                    createMany: {
                        data: answers.map((answer) => {
                            return {
                                questionId: answer.id,
                                answer: answer.answer,
                                note:
                                    jsonResponse[answer.id]?.explanation ?? '',
                            }
                        }),
                    },
                },
            },
        })

        await prisma.task.update({
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
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: getErrorMessage(error) }
    }
}

export const editExam = async (
    examDetails: CreateExamSchema,
    examQuestions: QuestionsSchema,
    _examId: string,
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You must be logged in to edit an exam.',
        }
    }

    if (session.user.role !== 'TEACHER') {
        return {
            success: false,
            error: 'You must be a teacher to edit an exam.',
        }
    }

    try {
        const { content, courseId, endDate, startDate, title } =
            createExamSchema.parse(examDetails)
        const questions = questionsSchema.parse(examQuestions)
        const examId = z.string().refine(isMongoId).parse(_examId)

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
                error: 'You do not have permission to edit this exam.',
            }
        }

        if (course.isCompleted) {
            return {
                success: false,
                error: 'You cannot edit an exam for a completed course.',
            }
        }

        const exam = await prisma.exam.findUnique({
            where: {
                id: examId,
            },
            select: {
                id: true,
                taskId: true,
            },
        })

        if (exam === null) {
            return {
                success: false,
                error: 'Exam not found.',
            }
        }

        await prisma.task.update({
            where: {
                id: exam.taskId,
            },
            data: {
                description: content,
                title,
                dueDate: endDate,
                startDate,
                exam: {
                    update: {
                        duration: endDate.getTime() - startDate.getTime(),
                        questions: {
                            deleteMany: {},
                            createMany: {
                                data: questions.map((question) => ({
                                    answer: question.answer,
                                    question: question.question,
                                    options: question.options,
                                    type: question.type,
                                })),
                            },
                        },
                    },
                },
            },
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: getErrorMessage(error) }
    }
}

export const editExamGrade = async (
    data: EditGradeSchema,
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You must be logged in to edit an exam grade.',
        }
    }

    if (session.user.role !== 'TEACHER') {
        return {
            success: false,
            error: 'You must be a teacher to edit an exam grade.',
        }
    }

    try {
        const { grade, submissionId } = editGradeSchema.parse(data)

        const submission = await prisma.examSubmission.findUnique({
            where: {
                id: submissionId,
            },
            select: {
                examId: true,
                studentId: true,
                score: true,
                exam: {
                    select: {
                        task: {
                            select: {
                                course: {
                                    select: {
                                        userIds: true,
                                        isCompleted: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        if (submission === null) {
            return {
                success: false,
                error: 'Submission not found.',
            }
        }

        if (!submission.exam.task.course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to edit this grade.',
            }
        }

        if (submission.exam.task.course.isCompleted) {
            return {
                success: false,
                error: 'You cannot edit a grade for a completed course.',
            }
        }

        await prisma.examSubmission.update({
            where: {
                id: submissionId,
            },
            data: {
                score: grade,
            },
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: getErrorMessage(error) }
    }
}

export const editAssignmentGrade = async (
    data: EditGradeSchema,
): Promise<ReturnValue> => {
    const session = await getServerAuthSession()
    if (session === null) {
        return {
            success: false,
            error: 'You must be logged in to edit an assignment grade.',
        }
    }

    if (session.user.role !== 'TEACHER') {
        return {
            success: false,
            error: 'You must be a teacher to edit an assignment grade.',
        }
    }

    try {
        const { grade, submissionId } = editGradeSchema.parse(data)

        const submission = await prisma.studentTaskUpload.findUnique({
            where: {
                id: submissionId,
            },
            select: {
                task: {
                    select: {
                        course: {
                            select: {
                                userIds: true,
                                isCompleted: true,
                            },
                        },
                    },
                },
            },
        })

        if (submission === null) {
            return {
                success: false,
                error: 'Submission not found.',
            }
        }

        if (!submission.task.course.userIds.includes(session.user.id)) {
            return {
                success: false,
                error: 'You do not have permission to edit this grade.',
            }
        }

        if (submission.task.course.isCompleted) {
            return {
                success: false,
                error: 'You cannot edit a grade for a completed course.',
            }
        }

        await prisma.studentTaskUpload.update({
            where: {
                id: submissionId,
            },
            data: {
                score: grade,
            },
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: getErrorMessage(error) }
    }
}
