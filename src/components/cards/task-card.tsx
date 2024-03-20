'use client'

import { TasksWithUsers } from '@/types'
import { Session } from 'next-auth'
import React from 'react'
import { CardWrapper } from '../wrappers/card-wrapper'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Icons } from '../icons'
import { saveAs } from 'file-saver'
import { MarkAsCompleteButton } from '../buttons/mark-as-complete-button'
import { updateTaskCompletion } from '@/actions/course'

type TaskCardProps = {
    task: TasksWithUsers
    session: Session
    isComplete: boolean
}

export const TaskCard = ({ task, session, isComplete }: TaskCardProps) => {
    return (
        <CardWrapper className='rounded-lg shadow-none'>
            <div className='flex items-start gap-10'>
                <MarkAsCompleteButton
                    isComplete={isComplete}
                    onClick={async () =>
                        updateTaskCompletion({
                            itemId: task.id,
                            completed: !isComplete,
                        })
                    }
                />
                <div className='w-full space-y-2'>
                    <div className='flex w-full items-start justify-between'>
                        <div className='flex items-center gap-3'>
                            <h3 className='text-heading leading-none'>
                                {task.title}
                            </h3>
                            {session.user.role === 'TEACHER' && (
                                <>
                                    <Link
                                        href={`/dashboard/teacher/courses/${task.courseId}/tasks/${task.id}/edit`}
                                        className={cn(
                                            buttonVariants({
                                                variant: 'link',
                                            }),
                                            'h-fit w-fit px-0 py-0 text-gray-200 underline',
                                        )}
                                    >
                                        <span className='text-xl font-bold'>
                                            Edit
                                        </span>
                                    </Link>
                                    <Link
                                        href={`/dashboard/teacher/courses/${task.courseId}/tasks/${task.id}`}
                                        className={cn(
                                            buttonVariants({
                                                variant: 'link',
                                            }),
                                            'h-fit w-fit px-0 py-0 text-gray-200 underline',
                                        )}
                                    >
                                        <span className='text-xl font-bold'>
                                            View
                                        </span>
                                    </Link>
                                </>
                            )}
                        </div>
                        <p className='text-xl text-gray-200'>
                            {formatDate(task.createdAt)}
                        </p>
                    </div>
                    <div className={'flex items-start justify-between gap-3'}>
                        <div>
                            <p className='text-lg'>{task.description}</p>
                            {task.attachments.length > 0 && (
                                <div>
                                    {task.attachments.map((attachment) => (
                                        <Button
                                            variant={'link'}
                                            className='px-0 py-0'
                                            key={attachment.url}
                                            onClick={() => {
                                                saveAs(
                                                    attachment.url,
                                                    attachment.name,
                                                )
                                            }}
                                        >
                                            <span className='flex items-center gap-2 text-sm font-medium'>
                                                <Icons.Attachment />
                                                {attachment.name}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            )}
                            {session.user.role === 'STUDENT' && (
                                // TODO: Add upload functionality
                                <div>Upload</div>
                            )}
                        </div>
                        {task.type === 'ASSIGNMENT' ? (
                            <DateInfo date={task.dueDate} title='Due:' />
                        ) : (
                            <div className='flex items-center gap-4'>
                                <DateInfo
                                    date={task.startDate!}
                                    title='Start:'
                                />
                                <DateInfo date={task.dueDate} title='End:' />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CardWrapper>
    )
}

const DateInfo = ({ date, title }: { date: Date; title: string }) => {
    return (
        <div className='flex flex-col text-lg text-gray-200'>
            <span>{title}</span>
            <span>
                {formatDate(date, {
                    dateStyle: undefined,
                    timeStyle: 'short',
                })}
            </span>
            <span>{formatDate(date)}</span>
        </div>
    )
}
