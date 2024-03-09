import { cn } from '@/lib/utils'
import React from 'react'

export const AuthFormWrapper = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <div className='bg-gray-100'>
            <div className='flex min-h-screen items-center justify-center xl:container'>
                {/* <div className='left-1/2 top-1/2 xl:container xl:absolute xl:-translate-x-1/2 xl:-translate-y-1/2'> */}
                <main
                    className={cn(
                        'w-full grow border border-gray-200 shadow-shadow',
                    )}
                >
                    {children}
                </main>
            </div>
        </div>
    )
}
