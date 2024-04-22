'use client'

import { AnnouncementsWithUsers } from '@/types'
import React from 'react'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import { Session } from 'next-auth'
import { cn, formatAttachmentName, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { saveAs } from 'file-saver'
import { MarkAsCompleteButton } from '@/components/buttons/mark-as-complete-button'
import { updateAnnouncementCompletion } from '@/actions/course'

type AnnouncementCardProps = {
    announcement: AnnouncementsWithUsers
    session: Session
    isComplete: boolean
}

export const AnnouncementCard = ({
    announcement,
    session,
    isComplete,
}: AnnouncementCardProps) => {
    return (
        <CardWrapper className='rounded-lg shadow-inner'>
            <div className='flex items-start gap-10'>
                <MarkAsCompleteButton
                    isComplete={isComplete}
                    onClick={async () =>
                        updateAnnouncementCompletion({
                            itemId: announcement.id,
                            completed: !isComplete,
                        })
                    }
                />
                <div className='w-full space-y-2'>
                    <div className='flex flex-col-reverse items-start justify-between md:flex-row md:gap-4'>
                        <div className='flex flex-wrap items-center gap-3'>
                            <h3 className='text-heading leading-none'>
                                {announcement.title}
                            </h3>
                            {session.user.role === 'TEACHER' && (
                                <>
                                    <Link
                                        href={`/dashboard/teacher/courses/${announcement.courseId}/announcements/${announcement.id}/edit`}
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
                                        href={`/dashboard/teacher/courses/${announcement.courseId}/announcements/${announcement.id}`}
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
                        <p className='text-xl text-gray-200 max-md:self-end'>
                            {formatDate(announcement.createdAt)}
                        </p>
                    </div>
                    <p className='text-lg'>{announcement.content}</p>
                    {announcement.attachments.length > 0 && (
                        <div className='flex flex-col items-start'>
                            {announcement.attachments.map((attachment) => (
                                <Button
                                    variant={'link'}
                                    className='px-0 py-0'
                                    key={attachment.url}
                                    onClick={() => {
                                        saveAs(attachment.url, attachment.name)
                                    }}
                                >
                                    <span className='flex items-center gap-2 text-sm font-medium'>
                                        <Icons.Attachment />
                                        {formatAttachmentName(attachment.name)}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CardWrapper>
    )
}
