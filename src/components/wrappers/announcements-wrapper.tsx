import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import React from 'react'
import { AnnouncementCard } from '../cards/announcement-card'

type AnnouncementsWrapperProps = {
    courseId: string
}

export const AnnouncementsWrapper = async ({
    courseId,
}: AnnouncementsWrapperProps) => {
    const session = await getServerAuthSession()
    const announcements = await prisma.announcement.findMany({
        where: {
            courseId,
        },
        include: {
            course: {
                select: {
                    courseAdminId: true,
                    users: {
                        select: {
                            id: true,
                            role: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    const completedAnnouncements = announcements.filter((announcement) =>
        announcement.completed.some(
            (comp) => comp.userId === session?.user.id && comp.completed,
        ),
    )
    const incompleteAnnouncements = announcements.filter(
        (announcement) =>
            !announcement.completed.some(
                (comp) => comp.userId === session?.user.id && comp.completed,
            ),
    )

    return (
        <div className='space-y-3'>
            {incompleteAnnouncements.length === 0 ? (
                <div className='py-10 text-center text-2xl'>
                    No announcements found
                </div>
            ) : (
                incompleteAnnouncements.map((announcement) => (
                    <AnnouncementCard
                        key={announcement.id}
                        announcement={announcement}
                        session={session!}
                    />
                ))
            )}
        </div>
    )
}
