import { getCourseName } from '@/actions/course'
import { AddMemberCard } from '@/components/cards/add-member-card'
import { CourseMembersCard } from '@/components/cards/course-members-card'
import { CourseReportCard } from '@/components/cards/course-report-card'
import { Header } from '@/components/nav/header'
import { buttonVariants } from '@/components/ui/button'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnnouncementsWrapper } from '@/components/wrappers/announcements-wrapper'
import { TasksWrapper } from '@/components/wrappers/tasks-wrapper'
import { MaterialWrapper } from '@/components/wrappers/material-wrapper'
import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'

export default async function page({
    params: { id },
}: {
    params: { id: string }
}) {
    const session = await getServerAuthSession()
    const course = await prisma.course.findUnique({
        where: {
            id,
        },
        select: {
            userIds: true,
        },
    })

    if (course == null || !course.userIds.includes(session?.user.id!))
        notFound()

    const courseName = await getCourseName(id)
    if (courseName == null) notFound()

    return (
        <div>
            <Header title={courseName} />
            <div className='grid max-w-screen-xl grid-cols-3 grid-rows-3 gap-x-16 gap-y-4 px-10'>
                <CardWrapper className='col-span-2 row-span-3'>
                    <div className='flex items-end justify-between'>
                        <h3 className='text-2xl font-medium text-black'>
                            Report
                        </h3>
                        <Link
                            href={`/dashboard/teacher/courses/${id}/report`}
                            className={buttonVariants({
                                variant: 'link',
                                className:
                                    'h-fit px-0 py-0 text-turq-600 underline',
                            })}
                        >
                            <span className='text-xl font-bold'>
                                View full report
                            </span>
                        </Link>
                    </div>
                    <Suspense fallback={<div>Loading reports...</div>}>
                        <CourseReportCard courseId={id} />
                    </Suspense>
                </CardWrapper>

                <CardWrapper className='row-span-2'>
                    <div className='flex items-end justify-between'>
                        <h3 className='text-2xl font-medium text-black'>
                            Members
                        </h3>
                    </div>
                    <Suspense fallback={<div>Loading members...</div>}>
                        <CourseMembersCard courseId={id} />
                    </Suspense>
                </CardWrapper>

                <CardWrapper className='row-span-1 py-4'>
                    <h3 className='text-2xl font-medium leading-none text-black'>
                        Add Member
                    </h3>
                    <AddMemberCard courseId={id} />
                </CardWrapper>
            </div>

            <Tabs defaultValue='announcements' className='w-full'>
                <TabsList className='grid grid-cols-3 bg-transparent py-9'>
                    <TabsTrigger
                        className='rounded-none border-b border-gray-200 text-xl font-bold text-gray-200 duration-200 data-[state=active]:border-b-[3px] data-[state=active]:border-turq-600 data-[state=active]:text-turq-600 data-[state=active]:shadow-none'
                        value='announcements'
                    >
                        Announcements
                    </TabsTrigger>
                    <TabsTrigger
                        className='rounded-none border-b border-gray-200 text-xl font-bold text-gray-200 duration-200 data-[state=active]:border-b-[3px] data-[state=active]:border-turq-600 data-[state=active]:text-turq-600 data-[state=active]:shadow-none'
                        value='tasks'
                    >
                        Tasks
                    </TabsTrigger>
                    <TabsTrigger
                        className='rounded-none border-b border-gray-200 text-xl font-bold text-gray-200 duration-200 data-[state=active]:border-b-[3px] data-[state=active]:border-turq-600 data-[state=active]:text-turq-600 data-[state=active]:shadow-none'
                        value='material'
                    >
                        Material
                    </TabsTrigger>
                </TabsList>
                <TabsContent value='announcements'>
                    <Suspense fallback={<div>Loading announcements...</div>}>
                        <AnnouncementsWrapper courseId={id} />
                    </Suspense>
                </TabsContent>
                <TabsContent value='tasks'>
                    <Suspense fallback={<div>Loading tasks...</div>}>
                        <TasksWrapper courseId={id} />
                    </Suspense>
                </TabsContent>
                <TabsContent value='material'>
                    <Suspense fallback={<div>Loading material...</div>}>
                        <MaterialWrapper courseId={id} />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    )
}
