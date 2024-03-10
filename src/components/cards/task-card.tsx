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

type TaskCardProps = {
    task: TasksWithUsers
    session: Session
}

export const TaskCard = ({ task, session }: TaskCardProps) => {
    return (
        <CardWrapper className='rounded-lg shadow-none'>
            <div className='flex items-start gap-10'>
                <div className='size-8 rounded-10 border-2 border-turq-600'></div>
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
                    <p className='text-lg'>{task.description}</p>
                    <div
                        className={cn(
                            'flex items-start gap-3',
                            task.attachments.length > 0
                                ? 'justify-between'
                                : 'justify-end',
                        )}
                    >
                        {task.attachments.length > 0 && (
                            <div>
                                {task.attachments.map((attachment) => (
                                    <Button
                                        variant={'link'}
                                        className='px-0 py-0'
                                        key={attachment.fileKey}
                                        onClick={() => {
                                            saveAs(
                                                attachment.fileUrl,
                                                attachment.fileName,
                                            )
                                        }}
                                    >
                                        <span className='flex items-center gap-2 text-sm font-medium'>
                                            <Icons.Attachment />
                                            {attachment.fileName}
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        )}
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
