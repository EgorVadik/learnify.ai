import { Params, paramsSchema } from '@/actions/course/schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import {
    cn,
    formatAttachmentName,
    getUsernameFallback,
    pluralize,
} from '@/lib/utils'
import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { format, formatDistance, isBefore } from 'date-fns'
import { EditGradeButton } from '@/components/buttons/edit-grade-button'
import { Icons } from '@/components/icons'
import { AttachmentsDownload } from '@/components/buttons/attachments-download'

export default async function page({ params }: { params: Params }) {
    const parsedParams = paramsSchema.safeParse(params)
    if (!parsedParams.success) notFound()
    const { 'task-id': taskId } = parsedParams.data

    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
            studentTaskUploads: {
                include: {
                    student: {
                        select: {
                            user: {
                                select: {
                                    name: true,
                                    image: true,
                                },
                            },
                        },
                    },
                },
            },
            exam: {
                include: {
                    examSubmissions: {
                        include: {
                            submissionAnswers: {
                                select: {
                                    answer: true,
                                    note: true,
                                    question: {
                                        select: {
                                            id: true,
                                            question: true,
                                            options: true,
                                            answer: true,
                                            type: true,
                                        },
                                    },
                                },
                            },
                            student: {
                                select: {
                                    user: {
                                        select: {
                                            name: true,
                                            image: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!task) notFound()

    if (task.type === 'ASSIGNMENT') {
        if (task.studentTaskUploads.length === 0) {
            return (
                <div className='flex min-h-[calc(100vh-11rem)] items-center justify-center'>
                    <div className='text-center text-[1.375rem] font-bold text-black-full'>
                        No submissions attempted yet
                    </div>
                </div>
            )
        }

        return (
            <>
                <div className='flex flex-col justify-between sm:flex-row sm:items-center sm:gap-4'>
                    <span className='line-clamp-1 break-all text-3xl'>
                        {task.title}
                    </span>
                    <span className='text-black-medium whitespace-nowrap text-xl'>
                        {task.studentTaskUploads.length}{' '}
                        {pluralize(
                            task.studentTaskUploads.length,
                            'submission',
                        )}
                    </span>
                </div>

                <div className='mt-8 flex flex-col gap-4'>
                    {task.studentTaskUploads.map((submission) => (
                        <CardWrapper
                            key={submission.id}
                            className='flex flex-col justify-between md:flex-row md:items-end'
                        >
                            <SubmissionDetails
                                user={submission.student.user}
                                submissionDate={submission.uploadedAt}
                                taskDueDate={task.dueDate}
                            />

                            <div className='flex items-center gap-3 max-md:self-end'>
                                <span className='text-lg'>
                                    Grade: {submission.score ?? 0}
                                </span>
                                <Dialog>
                                    <DialogTrigger>
                                        <span
                                            className={cn(
                                                buttonVariants({
                                                    variant: 'link',
                                                }),
                                                'px-0 text-base font-bold text-turq-600',
                                            )}
                                        >
                                            View Details
                                        </span>
                                    </DialogTrigger>
                                    <DialogContent className='max-h-dvh overflow-y-auto'>
                                        <DialogHeader>
                                            <DialogTitle>
                                                {submission.student.user.name}
                                            </DialogTitle>
                                        </DialogHeader>

                                        <AttachmentsDownload
                                            attachments={submission.attachments}
                                            formatAttachment={false}
                                        />
                                    </DialogContent>
                                </Dialog>

                                <EditGradeButton
                                    submissionId={submission.id}
                                    grade={submission.score ?? 0}
                                    isAssignment
                                >
                                    <span
                                        className={cn(
                                            buttonVariants({
                                                variant: 'link',
                                            }),
                                            'px-0 text-base font-bold text-turq-600',
                                        )}
                                    >
                                        Edit Grade
                                    </span>
                                </EditGradeButton>
                            </div>
                        </CardWrapper>
                    ))}
                </div>
            </>
        )
    }

    if (!task.exam) notFound()
    if (task.exam.examSubmissions.length === 0) {
        return (
            <div className='flex min-h-[calc(100vh-11rem)] items-center justify-center'>
                <div className='text-center text-[1.375rem] font-bold text-black-full'>
                    No submissions attempted yet
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='flex flex-col justify-between sm:flex-row sm:items-center sm:gap-4'>
                <span className='line-clamp-1 break-all text-3xl'>
                    {task.title}
                </span>
                <span className='text-black-medium whitespace-nowrap text-xl'>
                    {task.exam.examSubmissions.length}{' '}
                    {pluralize(task.exam.examSubmissions.length, 'submission')}
                </span>
            </div>

            <div className='mt-8 flex flex-col gap-4'>
                {task.exam.examSubmissions.map((submission) => (
                    <CardWrapper
                        key={submission.id}
                        className='flex items-end justify-between'
                    >
                        <SubmissionDetails
                            user={submission.student.user}
                            submissionDate={submission.createdAt}
                            taskDueDate={task.dueDate}
                        />

                        <div className='flex items-center gap-3'>
                            <span className='text-lg'>
                                Grade: {submission.score ?? 0}
                            </span>
                            <Dialog>
                                <DialogTrigger>
                                    <span
                                        className={cn(
                                            buttonVariants({
                                                variant: 'link',
                                            }),
                                            'px-0 text-base font-bold text-turq-600',
                                        )}
                                    >
                                        View Details
                                    </span>
                                </DialogTrigger>
                                <DialogContent className='max-h-dvh max-w-screen-lg overflow-y-auto'>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {submission.student.user.name}
                                        </DialogTitle>
                                    </DialogHeader>

                                    {submission.submissionAnswers.map(
                                        (answer, i) => (
                                            <div
                                                key={answer.question.id}
                                                className='flex flex-col'
                                            >
                                                <div className='text-lg font-bold'>
                                                    {i + 1}-{' '}
                                                    {answer.question.question}
                                                </div>
                                                <div className='text-lg'>
                                                    <span className='font-bold'>
                                                        Student Answer:{' '}
                                                    </span>
                                                    {answer.answer}
                                                </div>
                                                <div className='text-lg'>
                                                    <span className='font-bold'>
                                                        Model Answer:{' '}
                                                    </span>
                                                    {answer.question.answer}
                                                </div>
                                                {answer.note != null &&
                                                    answer.note.trim() !==
                                                        '' && (
                                                        <div className='text-lg'>
                                                            <span className='font-bold'>
                                                                Note:{' '}
                                                            </span>
                                                            {answer.note}
                                                        </div>
                                                    )}

                                                {i !==
                                                    submission.submissionAnswers
                                                        .length -
                                                        1 && (
                                                    <Separator className='mt-4 bg-gray-200' />
                                                )}
                                            </div>
                                        ),
                                    )}
                                </DialogContent>
                            </Dialog>

                            <EditGradeButton
                                submissionId={submission.id}
                                grade={submission.score ?? 0}
                            >
                                <span
                                    className={cn(
                                        buttonVariants({
                                            variant: 'link',
                                        }),
                                        'px-0 text-base font-bold text-turq-600',
                                    )}
                                >
                                    Edit Grade
                                </span>
                            </EditGradeButton>
                        </div>
                    </CardWrapper>
                ))}
            </div>
        </>
    )
}

type SubmissionDetailsProps = {
    user: {
        name: string
        image: string | null
    }
    submissionDate: Date
    taskDueDate: Date
}

function SubmissionDetails({
    user,
    submissionDate,
    taskDueDate,
}: SubmissionDetailsProps) {
    return (
        <div className='flex flex-col gap-3'>
            <div className='flex items-center gap-3'>
                <Avatar>
                    <AvatarFallback>
                        {getUsernameFallback(user.name)}
                    </AvatarFallback>
                    <AvatarImage src={user.image ?? undefined} />
                </Avatar>
                <div className='line-clamp-1 text-lg font-bold'>
                    {user.name}
                </div>
            </div>

            <div className='flex flex-col'>
                <span className='text-lg'>
                    Submitted at: {format(submissionDate, 'dd/MM/yyyy HH:mm')}
                </span>
                <span className='text-lg'>
                    {isBefore(submissionDate, taskDueDate) ? (
                        <span>
                            Submitted{' '}
                            {formatDistance(submissionDate, taskDueDate)} early
                        </span>
                    ) : (
                        <span className='text-red-primary'>
                            Late by{' '}
                            {formatDistance(submissionDate, taskDueDate)}
                        </span>
                    )}
                </span>
            </div>
        </div>
    )
}
