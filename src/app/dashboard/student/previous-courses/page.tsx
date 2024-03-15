import { getStudentCourses } from '@/actions/course'
import { Header } from '@/components/nav/header'
import { PreviousCourseRows } from '@/components/tables/previous-course-rows'
import { CardWrapper } from '@/components/wrappers/card-wrapper'

export default async function page() {
    const courses = await getStudentCourses({
        getAll: true,
    })
    const enrolledCourses = courses.filter(
        (course) => course.status === 'ENROLLED',
    )
    const finishedCourses = courses.filter((course) => course.status === 'DONE')
    const droppedCourses = courses.filter(
        (course) => course.status === 'DROPPED',
    )

    return (
        <>
            <Header title='Previous Courses' />
            <main className='mx-auto max-w-screen-lg space-y-7'>
                <div className='space-y-8'>
                    <h2 className='text-heading'>Enrolled</h2>
                    <CardWrapper>
                        {enrolledCourses.length === 0 ? (
                            <div className='text-center text-xl'>
                                No courses found yet.
                            </div>
                        ) : (
                            <PreviousCourseRows
                                courses={enrolledCourses.map((course) => ({
                                    id: course.courseId,
                                    name: course.course.name,
                                    createdAt: course.createdAt,
                                    courseAdminId: course.course.courseAdminId,
                                    dateCompleted: course.course.dateCompleted,
                                    isCompleted: course.course.isCompleted,
                                    updatedAt: course.updatedAt,
                                    userIds: course.course.userIds,
                                }))}
                            />
                        )}
                    </CardWrapper>
                </div>

                <div className='space-y-8'>
                    <h2 className='text-heading'>Done</h2>
                    <CardWrapper>
                        {finishedCourses.length === 0 ? (
                            <div className='text-center text-xl'>
                                No finished courses found yet.
                            </div>
                        ) : (
                            <PreviousCourseRows
                                courses={finishedCourses.map((course) => ({
                                    id: course.courseId,
                                    name: course.course.name,
                                    createdAt: course.createdAt,
                                    courseAdminId: course.course.courseAdminId,
                                    dateCompleted: course.course.dateCompleted,
                                    isCompleted: course.course.isCompleted,
                                    updatedAt: course.updatedAt,
                                    userIds: course.course.userIds,
                                }))}
                            />
                        )}
                    </CardWrapper>
                </div>

                <div className='space-y-8'>
                    <h2 className='text-heading'>Dropped</h2>
                    <CardWrapper>
                        {droppedCourses.length === 0 ? (
                            <div className='text-center text-xl'>
                                No dropped courses found.
                            </div>
                        ) : (
                            <PreviousCourseRows
                                courses={droppedCourses.map((course) => ({
                                    id: course.courseId,
                                    name: course.course.name,
                                    createdAt: course.createdAt,
                                    courseAdminId: course.course.courseAdminId,
                                    dateCompleted: course.course.dateCompleted,
                                    isCompleted: course.course.isCompleted,
                                    updatedAt: course.updatedAt,
                                    userIds: course.course.userIds,
                                }))}
                            />
                        )}
                    </CardWrapper>
                </div>
            </main>
        </>
    )
}
