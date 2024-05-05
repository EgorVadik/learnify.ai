import { NotificationAPIButton } from '@/components/buttons/notification-api-button'
import { ChatNavToggle } from '@/components/nav/chat-nav-toggle'
import { NavToggle } from '@/components/nav/nav-toggle'
import { getServerAuthSession } from '@/server/auth'
import React from 'react'

export default async function page() {
    const session = await getServerAuthSession()

    return (
        <>
            <main className='relative flex min-h-screen flex-1 items-center justify-center text-balance bg-blue-100 text-center text-2xl font-semibold'>
                Select a chat to get started
                <div className='absolute right-10 top-10 flex items-center gap-2'>
                    <NotificationAPIButton
                        userId={session?.user.id || 'user-id'}
                    />
                    <NavToggle />
                    <ChatNavToggle />
                </div>
            </main>
        </>
    )
}
