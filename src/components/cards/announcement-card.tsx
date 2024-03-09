import { AnnouncementsWithUsers } from '@/types'
import React from 'react'
import { CardWrapper } from '../wrappers/card-wrapper'
import { Session } from 'next-auth'
import { cn, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'

type AnnouncementCardProps = {
    announcement: AnnouncementsWithUsers
    session: Session
}

export const AnnouncementCard = ({
    announcement,
    session,
}: AnnouncementCardProps) => {
    return (
        <CardWrapper className='rounded-lg shadow-inner'>
            <div className='flex items-start gap-10'>
                <div className='size-8 rounded-10 border-2 border-turq-600'></div>
                <div className='w-full space-y-2'>
                    <div className='flex w-full items-start justify-between'>
                        <div className='flex items-center gap-3'>
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
                        <p className='text-xl text-gray-200'>
                            {formatDate(announcement.createdAt)}
                        </p>
                    </div>
                    <p className='text-lg'>{announcement.content}</p>
                </div>
            </div>
        </CardWrapper>
    )
}
