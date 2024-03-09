import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { TaskCard } from '../cards/task-card'

type TasksWrapperProps = {
    courseId: string
}

export const TasksWrapper = async ({ courseId }: TasksWrapperProps) => {
    const session = await getServerAuthSession()
    const tasks = await prisma.task.findMany({
        where: {
            courseId,
        },
        include: {
            course: {
                select: {
                    courseAdminId: true,
                    users: {
                        select: {
                            id: true,
                            role: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    const completedTasks = tasks.filter((task) =>
        task.completed.some(
            (comp) => comp.userId === session?.user.id && comp.completed,
        ),
    )
    const incompleteTasks = tasks.filter(
        (task) =>
            !task.completed.some(
                (comp) => comp.userId === session?.user.id && comp.completed,
            ),
    )

    return (
        <div className='space-y-3'>
            {incompleteTasks.length === 0 ? (
                <div className='py-10 text-center text-2xl'>No tasks found</div>
            ) : (
                incompleteTasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        session={session!}
                    />
                ))
            )}
        </div>
    )
}
