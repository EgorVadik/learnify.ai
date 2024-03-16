import { ChatSideNav } from '@/components/nav/chat-side-nav'
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

const AblyProviderWrapper = dynamic(
    () => import('@/components/providers/ably-provider-wrapper'),
    {
        ssr: false,
    },
)

export default async function ChatLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <AblyProviderWrapper>
            <div className='flex'>
                <Suspense fallback={'Loading chats'}>
                    <ChatSideNav />
                </Suspense>
                {children}
            </div>
        </AblyProviderWrapper>
    )
}
