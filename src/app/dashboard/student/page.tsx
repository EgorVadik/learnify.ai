import { CreateCourseButton } from '@/components/buttons/create-course-button'
import { Header } from '@/components/nav/header'
import { CourseInvitations } from '@/components/tables/course-invitations'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import { StudentLatestUpdatesWrapper } from '@/components/wrappers/student-latest-updates-wrapper'
import { StudentUpcomingTasksWrapper } from '@/components/wrappers/student-upcoming-tasks-wrapper'
import { TodosWrapper } from '@/components/wrappers/todos-wrapper'
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

                <div className='grid grid-cols-3 gap-x-32 gap-y-8'>
                    <div className='col-span-2 flex flex-col gap-8'>
                        <h2 className='text-heading text-black-full'>
                            Latest Updates
                        </h2>
                        <CardWrapper>
                            <Suspense fallback={<div>Loading updates...</div>}>
                                <StudentLatestUpdatesWrapper />
                            </Suspense>
                        </CardWrapper>
                    </div>

                    <div className='row-span-2 flex flex-col gap-8'>
                        <h2 className='text-heading text-black-full'>
                            Upcoming Tasks
                        </h2>
                        <CardWrapper>
                            <Suspense fallback={<div>Loading tasks...</div>}>
                                <StudentUpcomingTasksWrapper />
                            </Suspense>
                        </CardWrapper>
                    </div>

                    <div className='col-span-2 flex flex-col gap-8'>
                        <h2 className='text-heading text-black-full'>
                            Your Todos
                        </h2>
                        <CardWrapper>
                            <Suspense fallback={<div>Loading Todos...</div>}>
                                <TodosWrapper />
                            </Suspense>
                        </CardWrapper>
                    </div>
                </div>

                <div className='flex flex-col gap-8'>
                    <h2 className='text-heading text-black-full'>
                        Your Courses
                    </h2>
                    <Suspense fallback={<div>Loading courses...</div>}>
                        <UserCoursesWrapper wrapCourses={false} />
                    </Suspense>
                </div>
            </main>
        </>
    )
}
