import { getCourseIds } from '@/actions/course'
import { formatDate } from '@/lib/utils'
import { prisma } from '@/server/db'
import { format, startOfDay } from 'date-fns'
import { Separator } from '@/components/ui/separator'

export const StudentUpcomingTasksWrapper = async () => {
    const courseIds = await getCourseIds()
    const tasks = await prisma.task.findMany({
        where: {
            courseId: {
                in: courseIds,
            },
            dueDate: {
                gte: startOfDay(new Date()),
            },
        },
        include: {
            course: {
                select: {
                    name: true,
                },
            },
        },
    })

    if (tasks.length === 0) {
        return (
            <div className='text-center text-[1.375rem] font-medium text-black-full'>
                No upcoming tasks
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-2.5'>
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className='flex items-center gap-5 rounded-2xl bg-orange-200/25 px-4 py-1'
                    // style={{}}
                >
                    <span className='w-full max-w-9 text-[1.375rem] text-black'>
                        {format(task.dueDate, 'EEE')}
                    </span>
                    <Separator
                        orientation='vertical'
                        className='bg-orange-200 py-6'
                    />
                    <div className='flex flex-col text-sm text-black'>
                        <span>{task.title}</span>
                        <span>{task.course.name}</span>
                        <span>
                            {formatDate(task.dueDate, {
                                dateStyle: undefined,
                                timeStyle: 'short',
                            })}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    )
}
