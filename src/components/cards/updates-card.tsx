import { formatDate } from '@/lib/utils'
import React from 'react'
import { buttonVariants } from '../ui/button'
import Link from 'next/link'

type UpdatesCardProps = {
    item: {
        id: string
        title: string
        createdAt: Date
        course: string
        courseId: string
    }
}

export const UpdatesCard = ({ item }: UpdatesCardProps) => {
    return (
        <div className='flex items-center justify-between gap-1.5'>
            <div className='flex items-center gap-9'>
                <div className='flex size-12 items-center justify-center rounded-lg'>
                    BG
                </div>
                <span className='text-[1.375rem] text-black'>
                    {item.course}
                </span>
            </div>
            <span className='text-[1.375rem] text-black'>{item.title}</span>
            <span className='text-[1.375rem] text-black'>
                {formatDate(item.createdAt)}
            </span>
            <Link
                href={`/dashboard/student/courses/${item.courseId}`}
                className={buttonVariants({
                    size: 'sm',
                    variant: 'link',
                    className: 'text-turq-600',
                })}
            >
                <span className='text-xl font-bold'>View Details</span>
            </Link>
        </div>
    )
}
