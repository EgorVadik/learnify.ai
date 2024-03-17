import {
    dehydrate,
    QueryClient,
    HydrationBoundary,
} from '@tanstack/react-query'
import { getChatMessages } from '@/actions/chat'
import { getServerAuthSession } from '@/server/auth'
import { ChatContentWrapper } from '@/components/wrappers/chat-content-wrapper'

export default async function page({
    params: { chatId },
}: {
    params: { chatId: string }
}) {
    const session = await getServerAuthSession()
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: ['chat', chatId],
        queryFn: () => getChatMessages(chatId),
    })
    await queryClient.invalidateQueries({
        exact: true,
        queryKey: ['chats', 'members', chatId],
    })

    return (
        <main className='flex min-h-screen flex-1 bg-blue-100'>
            <HydrationBoundary state={dehydrate(queryClient)}>
                <ChatContentWrapper chatId={chatId} session={session!} />
            </HydrationBoundary>
        </main>
    )
}
