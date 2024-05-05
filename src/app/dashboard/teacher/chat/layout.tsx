import { ChatSideNav } from '@/components/nav/chat-side-nav'
import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/nav/header'

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
            {/* <div className='px-10 py-9'>
                <Header title='Messages' padding={false} />
            </div> */}
            <div className='flex'>
                <Suspense fallback={'Loading chats'}>
                    <ChatSideNav />
                </Suspense>
                {children}
            </div>
        </AblyProviderWrapper>
    )
}
