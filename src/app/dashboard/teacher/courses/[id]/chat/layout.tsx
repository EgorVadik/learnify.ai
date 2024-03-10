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
    params: { id: courseId },
}: {
    children: React.ReactNode
    params: { id: string }
}) {
    return (
        <AblyProviderWrapper>
            <div className='flex'>
                <Suspense fallback={'Loading chats'}>
                    <ChatSideNav courseId={courseId} />
                </Suspense>
                {children}
            </div>
        </AblyProviderWrapper>
    )
}
