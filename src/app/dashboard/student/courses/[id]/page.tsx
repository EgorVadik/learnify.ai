import { getCourseName } from '@/actions/course'
import { Header } from '@/components/nav/header'
import { notFound } from 'next/navigation'
import React, { Suspense } from 'react'
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnnouncementsWrapper } from '@/components/wrappers/announcements-wrapper'
import { TasksWrapper } from '@/components/wrappers/tasks-wrapper'
import { MaterialWrapper } from '@/components/wrappers/material-wrapper'
import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { CourseClientTabWrapper } from '@/components/wrappers/course-client-tab-wrapper'
import { isMongoId } from '@/lib/utils'
import { z } from 'zod'

export default async function page({
    searchParams: { type },
    params: { id: _id },
}: {
    params: { id: string }
    searchParams: { type?: string }
}) {
    const parsedId = z.string().refine(isMongoId).safeParse(_id)
    if (!parsedId.success) notFound()

    const id = parsedId.data

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
        <>
            <Header title={courseName} />
            <CourseClientTabWrapper type={type}>
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
                <TabsContent value='announcements' className='mt-9'>
                    <Suspense fallback={<div>Loading announcements...</div>}>
                        <AnnouncementsWrapper courseId={id} />
                    </Suspense>
                </TabsContent>
                <TabsContent value='tasks' className='mt-9'>
                    <Suspense fallback={<div>Loading tasks...</div>}>
                        <TasksWrapper courseId={id} />
                    </Suspense>
                </TabsContent>
                <TabsContent value='material' className='mt-9'>
                    <Suspense fallback={<div>Loading material...</div>}>
                        <MaterialWrapper courseId={id} />
                    </Suspense>
                </TabsContent>
            </CourseClientTabWrapper>
        </>
    )
}
