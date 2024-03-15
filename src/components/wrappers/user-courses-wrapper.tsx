import { getTeacherCourses, getStudentCourses } from '@/actions/course'
import { CourseCard } from '../cards/course-card'
import { cn } from '@/lib/utils'
import { ScrollContainerWrapper } from './scroll-container-wrapper'
import { getServerAuthSession } from '@/server/auth'
import { notFound } from 'next/navigation'
import type { Course, CourseStatus } from '@prisma/client'

type UserCoursesWrapperProps = {
    wrapCourses?: boolean
}

type StatusWithCourse = CourseStatus & {
    course: Course
}

export const UserCoursesWrapper = async ({
    wrapCourses = true,
}: UserCoursesWrapperProps) => {
    const session = await getServerAuthSession()
    const courses =
        session?.user.role === 'TEACHER'
            ? await getTeacherCourses()
            : session?.user.role === 'STUDENT'
              ? await getStudentCourses()
              : null

    if (courses == null) notFound()

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
                'hidden-scrollbar min-w-0 gap-4 px-2 py-5',
                wrapCourses
                    ? 'grid grid-cols-auto-20 items-center max-xl:[_&>*]:mx-auto'
                    : 'flex flex-nowrap',
            )}
            vertical={false}
            horizontal
        >
            {courses.map((course) => (
                <CourseCard
                    key={
                        session?.user.role === 'TEACHER'
                            ? course.id
                            : (course as StatusWithCourse).course.id
                    }
                    courseName={
                        session?.user.role === 'TEACHER'
                            ? (course as Course).name
                            : (course as StatusWithCourse).course.name
                    }
                    courseId={
                        session?.user.role === 'TEACHER'
                            ? course.id
                            : (course as StatusWithCourse).course.id
                    }
                    href={
                        session?.user.role.toLowerCase() as
                            | 'student'
                            | 'teacher'
                    }
                />
            ))}
        </ScrollContainerWrapper>
    )
}
