import React from 'react'
import { NotificationAPIButton } from '@/components/buttons/notification-api-button'
import { getServerAuthSession } from '@/server/auth'
import { NavToggle } from './nav-toggle'
import { cn } from '@/lib/utils'

type HeaderProps = {
    title: string
    padding?: boolean
}

export const Header = async ({ title, padding = true }: HeaderProps) => {
    const session = await getServerAuthSession()
    return (
        <div
            className={cn('sticky bottom-0 flex items-center justify-between', {
                'pb-12': padding,
            })}
        >
            <h1 className='text-2xl font-medium text-black sm:text-4xl'>
                {title}
            </h1>
            <div className='flex items-center gap-2'>
                <NotificationAPIButton userId={session?.user.id || 'user-id'} />
                <NavToggle />
            </div>
        </div>
    )
}
