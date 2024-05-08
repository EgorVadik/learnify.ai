import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { TaskCard } from '@/components/cards/task-card'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'

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
            studentTaskUploads: {
                where: {
                    student: {
                        userId: session?.user.id,
                    },
                },
                select: {
                    score: true,
                },
            },
            exam: {
                select: {
                    duration: true,
                    examSubmissions: {
                        where: {
                            student: {
                                userId: session?.user.id,
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'asc',
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
                        isComplete={false}
                    />
                ))
            )}

            {completedTasks.length > 0 && (
                <Accordion type='single' collapsible>
                    <AccordionItem value='completed-items' className='border-0'>
                        <div className='flex w-full items-center gap-3.5'>
                            <AccordionTrigger className='w-fit items-center gap-3.5 border-0 text-gray-200'>
                                <span>Hidden</span>
                                <ChevronDown size={16} />
                            </AccordionTrigger>
                            <div className='h-px w-full grow bg-gray-200' />
                        </div>
                        <AccordionContent
                            contentClassName='data-[state=open]:overflow-visible'
                            className='space-y-3'
                        >
                            {completedTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    session={session!}
                                    isComplete={true}
                                    examScore={
                                        task.type === 'EXAM'
                                            ? task.exam?.examSubmissions.at(0)
                                                  ?.score
                                            : task.studentTaskUploads.at(0)
                                                  ?.score ?? undefined
                                    }
                                />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    )
}
