import { cn } from '@/lib/utils'
import React from 'react'

export const CardWrapper = ({
    children,
    className,
}: Readonly<{
    children: React.ReactNode
    className?: string
}>) => {
    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl bg-blue-100 px-8 py-7 shadow-shadow-2',
                className,
            )}
        >
            {children}
        </div>
    )
}
