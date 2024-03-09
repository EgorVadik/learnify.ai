import Link from 'next/link'
import React from 'react'

type UpcomingDataRowsProps = {
    course: string
    event: string
    date: Date
    url: string
    dataType: 'Exam' | 'Assignment'
}

export const UpcomingDataRows = ({
    course,
    date,
    event,
    url,
    dataType,
}: UpcomingDataRowsProps) => {
    return (
        <div className='flex items-center justify-between gap-20 py-2 text-[1.375rem] text-black'>
            <p>{course}</p>
            <p>{event}</p>
            <p>{date.toDateString()}</p>
            <Link className='text-xl font-bold text-turq-600' href={url}>
                View {dataType}
            </Link>
        </div>
    )
}
