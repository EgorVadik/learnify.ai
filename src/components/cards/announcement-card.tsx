'use client'

import { AnnouncementsWithUsers } from '@/types'
import React, { useState } from 'react'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import { Session } from 'next-auth'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MarkAsCompleteButton } from '@/components/buttons/mark-as-complete-button'
import { updateAnnouncementCompletion } from '@/actions/course'
import { CreateAnnouncementForm } from '../forms/create-announcement-form'
import { AttachmentsDownload } from '../buttons/attachments-download'

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
    const [isEditing, setIsEditing] = useState(false)

    if (isEditing) {
        return (
            <CreateAnnouncementForm
                courseId={announcement.courseId}
                defaultValues={{
                    title: announcement.title,
                    content: announcement.content,
                    files: announcement.attachments,
                }}
                handleCancel={() => setIsEditing(false)}
                announcementId={announcement.id}
            />
        )
    }

    return (
        <CardWrapper className='rounded-lg shadow-inner'>
            <div
                id={announcement.id}
                className='flex flex-col items-start gap-4 sm:flex-row sm:gap-10'
            >
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
                                    <Button
                                        className={
                                            'h-fit w-fit px-0 py-0 text-gray-200 underline'
                                        }
                                        variant={'link'}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <span className='text-xl font-bold'>
                                            Edit
                                        </span>
                                    </Button>
                                </>
                            )}
                        </div>
                        <p className='text-xl text-gray-200 max-md:self-end'>
                            {formatDate(announcement.createdAt)}
                        </p>
                    </div>
                    <p className='text-lg'>{announcement.content}</p>
                    <AttachmentsDownload
                        attachments={announcement.attachments}
                    />
                </div>
            </div>
        </CardWrapper>
    )
}
