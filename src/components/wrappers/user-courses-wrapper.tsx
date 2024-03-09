import { getUserCourses } from '@/actions/course'
import { CourseCard } from '../cards/course-card'
import { cn } from '@/lib/utils'
import { ScrollContainerWrapper } from './scroll-container-wrapper'

type UserCoursesWrapperProps = {
    wrapCourses?: boolean
}

export const UserCoursesWrapper = async ({
    wrapCourses = true,
}: UserCoursesWrapperProps) => {
    const courses = await getUserCourses()

    if (courses.length === 0) {
        return (
            <div className='text-center text-[1.375rem] font-medium text-black-full'>
                No courses found.
            </div>
        )
    }

    return (
        <ScrollContainerWrapper
            className={cn(
                'hidden-scrollbar flex items-center gap-4 px-2 py-5',
                wrapCourses ? 'flex-wrap' : 'flex-nowrap',
            )}
        >
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    courseName={course.name}
                    courseId={course.id}
                />
            ))}
        </ScrollContainerWrapper>
    )
}
