'use client'

import { useMounted } from '@/hooks/use-mounted'
import { useForceUpdate, useInterval } from '@mantine/hooks'
import { format, formatDistanceToNow } from 'date-fns'
import { useEffect } from 'react'

type ExamHeaderProps = {
    startDate: Date
    endDate: Date
    title: string
}

export const ExamHeader = ({ startDate, endDate, title }: ExamHeaderProps) => {
    const forceUpdate = useForceUpdate()
    const { start, stop } = useInterval(forceUpdate, 1000)
    const { mounted } = useMounted()

    const hours = endDate.getHours() - new Date().getHours()
    const minutes = endDate.getMinutes() - new Date().getMinutes()
    const seconds = endDate.getSeconds() - new Date().getSeconds()

    useEffect(() => {
        start()
        return stop
    }, [start, stop])

    return (
        <header className='sticky top-0 flex flex-col justify-between bg-white px-10 py-5 sm:flex-row sm:items-center sm:gap-4'>
            <span className='line-clamp-1 text-2xl font-bold'>{title}</span>

            {mounted && (
                <span className='whitespace-nowrap'>
                    {format(startDate, 'hh:mm a')} -{' '}
                    {format(endDate, 'hh:mm a')} ({hours}h {minutes}m {seconds}
                    s)
                </span>
            )}
        </header>
    )
}
