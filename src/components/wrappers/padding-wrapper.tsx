'use client'

import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import React from 'react'

export const PaddingWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()
    return (
        <div
            className={cn('min-w-0 flex-1', {
                'p-10':
                    !pathname.includes('chat') &&
                    !pathname.includes('dashboard/student/notes'),
            })}
        >
            {children}
        </div>
    )
}
