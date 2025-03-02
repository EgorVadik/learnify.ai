import { Header } from '@/components/nav/header'
import { CourseInvitations } from '@/components/tables/course-invitations'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import { UserCoursesWrapper } from '@/components/wrappers/user-courses-wrapper'
import React, { Suspense } from 'react'

export default function page() {
    return (
        <>
            <Header title='Dashboard' />
            <main className='space-y-8'>
                <div className='flex flex-col gap-8'>
                    <h2 className='text-heading text-black-full'>
                        Course Invitations:
                    </h2>
                    <CardWrapper>
                        <Suspense fallback={<div>Loading invites...</div>}>
                            <CourseInvitations />
                        </Suspense>
                    </CardWrapper>
                </div>

                <div className='flex flex-col gap-8'>
                    <h2 className='text-heading text-black-full'>
                        Your Courses
                    </h2>
                    <Suspense fallback={<div>Loading courses...</div>}>
                        <UserCoursesWrapper wrapCourses />
                    </Suspense>
                </div>
            </main>
        </>
    )
}
