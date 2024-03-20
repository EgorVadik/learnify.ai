import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import React from 'react'
import { AnnouncementCard } from '../cards/announcement-card'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../ui/accordion'
import { ChevronDown } from 'lucide-react'

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
                        isComplete={false}
                    />
                ))
            )}

            {completedAnnouncements.length > 0 && (
                <Accordion type='single' collapsible>
                    <AccordionItem value='completed-items' className='border-0'>
                        <div className='flex w-full items-center gap-3.5'>
                            <AccordionTrigger className='w-fit items-center gap-3.5 border-0 text-gray-200'>
                                <span>Hidden</span>
                                <ChevronDown size={16} />
                            </AccordionTrigger>
                            <div className='h-px w-full grow bg-gray-200' />
                        </div>
                        <AccordionContent
                            contentClassName='data-[state=open]:overflow-visible'
                            className='space-y-3'
                        >
                            {completedAnnouncements.map((announcement) => (
                                <AnnouncementCard
                                    key={announcement.id}
                                    announcement={announcement}
                                    session={session!}
                                    isComplete={true}
                                />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    )
}
