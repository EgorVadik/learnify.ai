import {
    dehydrate,
    QueryClient,
    HydrationBoundary,
} from '@tanstack/react-query'
import { getChatMessages } from '@/actions/chat'
import { getServerAuthSession } from '@/server/auth'
import { ChatContentWrapper } from '@/components/wrappers/chat-content-wrapper'
import { ClientChannelProvider } from '@/components/providers/client-channel-provider'
import { isMongoId } from '@/lib/utils'
import { z } from 'zod'
import { notFound } from 'next/navigation'

export default async function page({
    params: { chatId: _chatId },
}: {
    params: { chatId: string }
}) {
    const parsedId = z.string().refine(isMongoId).safeParse(_chatId)
    if (!parsedId.success) notFound()

    const chatId = parsedId.data

    const session = await getServerAuthSession()
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: ['chat', chatId],
        queryFn: () => getChatMessages(chatId),
    })

    return (
        <main className='flex min-h-screen flex-1 bg-blue-100'>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ClientChannelProvider channelName={`chat:${chatId}`}>
                    <ClientChannelProvider
                        channelName={`chat:${chatId}:active`}
                    >
                        <ChatContentWrapper
                            chatId={chatId}
                            session={session!}
                        />
                    </ClientChannelProvider>
                </ClientChannelProvider>
            </HydrationBoundary>
        </main>
    )
}
