import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

import { TasksWithUsers } from '@/types'
import {
    formatDistanceToNow,
    formatDuration,
    isAfter,
    isBefore,
    isEqual,
} from 'date-fns'
import { CalendarIcon, ClockIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useForceUpdate, useInterval, useTimeout } from '@mantine/hooks'
import { useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type StartExamDialogProps = {
    children: React.ReactNode
    task: Pick<
        TasksWithUsers,
        | 'id'
        | 'exam'
        | 'startDate'
        | 'description'
        | 'dueDate'
        | 'type'
        | 'title'
        | 'courseId'
    >
}

export const StartExamDialog = ({
    task: exam,
    children,
}: StartExamDialogProps) => {
    const forceUpdate = useForceUpdate()
    const interval = useInterval(forceUpdate, 10000)

    useEffect(() => {
        interval.start()
        return () => interval.stop()
    }, [interval])

    if (exam.exam === null) return null
    if (exam.type !== 'EXAM') return null
    if (!exam.startDate) return null

    const duration = formatDuration({
        minutes: Number((exam.exam.duration / 1000 / 60).toPrecision(2)),
    })

    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='text-center text-2xl'>
                        {exam.title}
                    </DialogTitle>
                </DialogHeader>

                <div className='flex flex-col items-center space-y-4'>
                    <div className='flex items-center space-x-2'>
                        <ClockIcon className='size-5 text-gray-200' />
                        <p className='text-gray-200'>Duration: {duration}</p>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <CalendarIcon className='size-5 text-gray-200' />
                        <p className='text-gray-200'>
                            {isAfter(new Date(), exam.dueDate) ? (
                                <span>
                                    Exam has ended{' '}
                                    {formatDistanceToNow(
                                        exam.dueDate ?? new Date(),
                                    )}{' '}
                                    ago
                                </span>
                            ) : (isEqual(
                                  new Date(),
                                  exam.startDate ?? new Date(),
                              ) ||
                                  isAfter(
                                      new Date(),
                                      exam.startDate ?? new Date(),
                                  )) &&
                              isBefore(new Date(), exam.dueDate) ? (
                                <span>
                                    Exam started:{' '}
                                    {formatDistanceToNow(
                                        exam.startDate ?? new Date(),
                                    )}{' '}
                                    ago
                                </span>
                            ) : (
                                <span>
                                    Exam starts in:{' '}
                                    {formatDistanceToNow(
                                        exam.startDate ?? new Date(),
                                        {
                                            includeSeconds: true,
                                        },
                                    )}
                                </span>
                            )}
                        </p>
                    </div>

                    <p className='text-center text-gray-700'>
                        {exam.description}
                    </p>

                    {(isEqual(new Date(), exam.startDate ?? new Date()) ||
                        isAfter(new Date(), exam.startDate ?? new Date())) &&
                        isBefore(new Date(), exam.dueDate) && (
                            <Link
                                href={`/dashboard/student/courses/${exam.courseId}/exam/${exam.id}`}
                                className={cn(
                                    buttonVariants({
                                        variant: 'primary',
                                    }),
                                    'w-full',
                                )}
                            >
                                Start Exam
                            </Link>
                        )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
