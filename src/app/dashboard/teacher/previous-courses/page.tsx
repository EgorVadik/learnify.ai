import { getUserCourses } from '@/actions/course'
import { Header } from '@/components/nav/header'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import { PreviousCourseRows } from '@/components/tables/previous-course-rows'

export default async function page() {
    const previousCourses = await getUserCourses({
        getAll: true,
    })

    const currentCourses = previousCourses.filter(
        (course) => !course.isCompleted,
    )

    const completedCourses = previousCourses.filter(
        (course) => course.isCompleted,
    )

    return (
        <>
            <Header title='Previous Courses' />
            <div className='mx-auto max-w-screen-lg space-y-7'>
                <div className='space-y-8'>
                    <h2 className='text-heading'>Current</h2>
                    <CardWrapper>
                        {currentCourses.length === 0 ? (
                            <div className='text-center text-xl'>
                                No courses found yet.
                            </div>
                        ) : (
                            <PreviousCourseRows courses={currentCourses} />
                        )}
                    </CardWrapper>
                </div>

                <div className='space-y-8'>
                    <h2 className='text-heading'>Completed</h2>
                    <CardWrapper>
                        {completedCourses.length === 0 ? (
                            <div className='text-center text-xl'>
                                No completed courses found yet.
                            </div>
                        ) : (
                            <PreviousCourseRows courses={completedCourses} />
                        )}
                    </CardWrapper>
                </div>
            </div>
        </>
    )
}
