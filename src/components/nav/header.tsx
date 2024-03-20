import React from 'react'
import { NotificationAPIButton } from '../buttons/notification-api-button'
import { getServerAuthSession } from '@/server/auth'

type HeaderProps = {
    title: string
}

export const Header = async ({ title }: HeaderProps) => {
    const session = await getServerAuthSession()
    return (
        <div className='flex items-center justify-between pb-12'>
            <h1 className='text-4xl font-medium text-black'>{title}</h1>
            <div className='flex items-center gap-3'>
                <NotificationAPIButton userId={session?.user.id || 'user-id'} />
            </div>
        </div>
    )
}
