import { prisma } from '@/server/db'
import { DonutChart } from '../charts/donut-chart'

type CourseReportCardProps = {
    courseId: string
}

export const CourseReportCard = async ({ courseId }: CourseReportCardProps) => {
    const report = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            users: {
                select: {
                    role: true,
                },
            },
        },
    })

    const teacherCount = report?.users.filter(
        (user) => user.role === 'TEACHER',
    ).length
    const studentCount = report?.users.filter(
        (user) => user.role === 'STUDENT',
    ).length
    const totalCount = report?.users.length

    return (
        <div className='flex'>
            <div className='flex flex-col items-start gap-4 pt-9'>
                <div className='flex flex-col items-start gap-2'>
                    <span className='whitespace-nowrap text-xl font-medium'>
                        Total Members
                    </span>
                    <span className='text-[4rem] font-medium leading-none'>
                        {totalCount}
                    </span>
                </div>

                <div className='flex flex-col items-start gap-2'>
                    <span className='whitespace-nowrap text-xl font-medium'>
                        Students
                    </span>
                    <span className='text-[4rem] font-medium leading-none'>
                        {studentCount}
                    </span>
                </div>

                <div className='flex flex-col items-start gap-2'>
                    <span className='whitespace-nowrap text-xl font-medium'>
                        Teachers
                    </span>
                    <span className='text-[4rem] font-medium leading-none'>
                        {teacherCount}
                    </span>
                </div>
            </div>

            <DonutChart
                data={[
                    {
                        name: 'Students',
                        value: studentCount ?? 0,
                        percent:
                            ((studentCount ?? 1) / (totalCount ?? 1)) * 100,
                    },
                    {
                        name: 'Teachers',
                        value: teacherCount ?? 0,
                        percent:
                            ((teacherCount ?? 1) / (totalCount ?? 1)) * 100,
                    },
                ]}
            />
        </div>
    )
}
