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
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnnouncementsWrapper } from '@/components/wrappers/announcements-wrapper'
import { TasksWrapper } from '@/components/wrappers/tasks-wrapper'
import { MaterialWrapper } from '@/components/wrappers/material-wrapper'
import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { CreateAnnouncementForm } from '@/components/forms/create-announcement-form'
import { UploadMaterialForm } from '@/components/forms/upload-material-form'
import { CreateTaskForm } from '@/components/forms/create-task-form'
import { CourseClientTabWrapper } from '@/components/wrappers/course-client-tab-wrapper'
import { cn } from '@/lib/utils'

export default async function page({
    params: { id },
    searchParams: { view },
}: {
    params: { id: string }
    searchParams: { view: 'announcements' | 'tasks' | 'material' | undefined }
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
            <div className='xl:grid-col-1 grid max-w-screen-xl gap-y-4 sm:gap-x-16 sm:px-10 lg:grid-cols-3 lg:grid-rows-3 xl:grid-cols-1 xl:grid-rows-1 2xl:grid-cols-3 2xl:grid-rows-3'>
                <CardWrapper className='lg:col-span-2 lg:row-span-3 xl:col-span-1 xl:row-span-1 2xl:col-span-2 2xl:row-span-3'>
                    <div className='flex flex-col justify-between sm:flex-row sm:items-end'>
                        <h3 className='text-2xl font-medium text-black'>
                            Report
                        </h3>
                        <Link
                            href={`/dashboard/teacher/courses/${id}/report`}
                            className={cn(
                                buttonVariants({
                                    variant: 'link',
                                    size: 'sm',
                                }),
                                'h-fit w-fit px-0 text-turq-600 underline',
                            )}
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

                <CardWrapper className='lg:row-span-2 xl:row-span-1 2xl:row-span-2'>
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

            <CourseClientTabWrapper>
                <TabsList className='grid w-full items-stretch justify-stretch bg-transparent pt-9 max-sm:h-auto sm:grid-cols-3 sm:pb-9'>
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
                    <CreateAnnouncementForm courseId={id} />
                    <Suspense fallback={<div>Loading announcements...</div>}>
                        <AnnouncementsWrapper courseId={id} />
                    </Suspense>
                </TabsContent>
                <TabsContent value='tasks'>
                    <CreateTaskForm courseId={id} />
                    <Suspense fallback={<div>Loading tasks...</div>}>
                        <TasksWrapper courseId={id} />
                    </Suspense>
                </TabsContent>
                <TabsContent value='material'>
                    <UploadMaterialForm courseId={id} />
                    <Suspense fallback={<div>Loading material...</div>}>
                        <MaterialWrapper courseId={id} />
                    </Suspense>
                </TabsContent>
            </CourseClientTabWrapper>
        </div>
    )
}
