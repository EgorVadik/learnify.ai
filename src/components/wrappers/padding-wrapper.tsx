'use client'

import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import React from 'react'

export const PaddingWrapper = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname()
    return (
        <div className={cn('flex-1', { 'p-10': !pathname.includes('chat') })}>
            {children}
        </div>
    )
}
