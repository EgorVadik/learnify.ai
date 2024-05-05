import { cn, formatDate } from '@/lib/utils'
import React from 'react'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'
import { generateRandomPattern } from '@/components/randomPattern'

type UpdatesCardProps = {
    item: {
        id: string
        title: string
        createdAt: Date
        course: string
        courseId: string
    }
    type: 'announcement' | 'material'
}

export const UpdatesCard = ({ item, type }: UpdatesCardProps) => {
    const { backgroundImage, color } = generateRandomPattern(item.courseId)

    return (
        <div className='flex grid-cols-4 flex-col justify-between gap-4 md:grid md:items-center'>
            <div className='flex items-center gap-4 xl:gap-9'>
                <div
                    className='flex size-16 items-center justify-center rounded-lg bg-cover'
                    style={{
                        backgroundColor: color,
                        backgroundImage,
                    }}
                />
                <span className='text-[1.375rem] text-black'>
                    {item.course}
                </span>
            </div>
            <span className='line-clamp-1 text-[1.375rem] text-black'>
                {item.title}
            </span>
            <span className='text-[1.375rem] text-black'>
                {formatDate(item.createdAt)}
            </span>
            <Link
                href={`/dashboard/student/courses/${item.courseId}?type=${type}#${item.id}`}
                className={cn(
                    buttonVariants({
                        size: 'sm',
                        variant: 'link',
                    }),
                    'w-fit px-0 py-0 text-turq-600',
                )}
            >
                <span className='text-xl font-bold'>View Details</span>
            </Link>
        </div>
    )
}
