import { CreateCourseButton } from '@/components/buttons/create-course-button'
import { Header } from '@/components/nav/header'
import { CourseInvitations } from '@/components/tables/course-invitations'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import { UserCoursesWrapper } from '@/components/wrappers/user-courses-wrapper'
import React, { Suspense } from 'react'

export default function page() {
    return (
        <>
            <Header title='Your Courses' />
            <main className='space-y-8'>
                <div className='flex flex-col gap-8'>
                    <h2 className='text-[2rem] text-black-full'>
                        Course Invitations:
                    </h2>
                    <CardWrapper>
                        <Suspense fallback={<div>Loading invites...</div>}>
                            <CourseInvitations />
                        </Suspense>
                    </CardWrapper>
                </div>
                <div className='flex flex-col gap-8'>
                    <div className='flex flex-col justify-between sm:flex-row sm:items-center'>
                        <h2 className='text-[2rem] text-black-full'>
                            Your Courses
                        </h2>
                        <CreateCourseButton />
                    </div>
                    <Suspense fallback={<div>Loading courses...</div>}>
                        <UserCoursesWrapper />
                    </Suspense>
                </div>
            </main>
        </>
    )
}
