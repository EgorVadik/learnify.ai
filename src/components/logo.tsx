import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

export const Logo = ({ className }: { className?: string }) => {
    return (
        <Link href={'/'}>
            <span
                className={cn(
                    'text-[2rem] font-extrabold text-black',
                    // montserrat.className,
                    className,
                )}
                style={{
                    lineHeight: 'normal',
                }}
            >
                Learnify
            </span>
            <span
                className={cn(
                    'text-[2rem] font-extrabold text-turq-600',
                    // montserrat.className,
                )}
                style={{
                    lineHeight: 'normal',
                }}
            >
                .ai
            </span>
        </Link>
    )
}
