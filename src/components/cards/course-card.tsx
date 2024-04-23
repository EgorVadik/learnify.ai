import Link from 'next/link'
import React from 'react'
import { Icons } from '@/components/icons'
import { generateRandomPattern } from '../randomPattern'
import { hexToRgb } from '@/lib/utils'

type CourseCardProps = {
    courseName: string
    courseId: string
    href: 'student' | 'teacher'
}

export const CourseCard = ({ courseName, courseId, href }: CourseCardProps) => {
    const { backgroundImage, color } = generateRandomPattern(courseId)
    const rgb = hexToRgb(color)

    return (
        <Link
            href={`/dashboard/${href}/courses/${courseId}`}
            className='w-full max-w-xs shrink-0 grow space-y-2 rounded-10 p-7 text-[1.375rem] shadow-shadow'
            style={{
                backgroundColor: `rgba(${rgb})`,
            }}
        >
            <div
                className='h-24 w-full rounded-10'
                style={{
                    backgroundImage,
                    backgroundColor: color,
                }}
            />
            <div className='flex items-center justify-between'>
                <span>{courseName}</span>
                <div
                    className='rounded-10'
                    style={{
                        backgroundColor: color,
                    }}
                >
                    <Icons.ArrowRight />
                </div>
            </div>
        </Link>
    )
}
