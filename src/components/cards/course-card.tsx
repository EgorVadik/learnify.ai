import Link from 'next/link'
import React from 'react'
import { Icons } from '../icons'

type CourseCardProps = {
    courseName: string
    courseId: string
}

export const CourseCard = ({ courseName, courseId }: CourseCardProps) => {
    return (
        <Link
            href={`/dashboard/teacher/courses/${courseId}`}
            className='w-full max-w-xs shrink-0 grow space-y-2 rounded-10 p-7 text-[1.375rem] shadow-shadow'
            style={{
                backgroundColor: 'rgba(255, 228, 228, 0.25)',
            }}
        >
            <div className='h-24 w-full rounded-10 bg-orange-200'>
                course random bg
            </div>
            <div className='flex items-center justify-between'>
                <span>{courseName}</span>
                <div
                    className='rounded-10'
                    style={{
                        backgroundColor: '#FFE4E4',
                    }}
                >
                    <Icons.ArrowRight />
                </div>
            </div>
        </Link>
    )
}
