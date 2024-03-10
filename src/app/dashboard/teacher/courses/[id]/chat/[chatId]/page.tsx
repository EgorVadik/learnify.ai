import {
    dehydrate,
    QueryClient,
    HydrationBoundary,
} from '@tanstack/react-query'
import { getChatMessages } from '@/actions/chat'
import { getServerAuthSession } from '@/server/auth'
import { ChatContentWrapper } from '@/components/wrappers/chat-content-wrapper'

export default async function page({
    params: { id: courseId, chatId },
}: {
    params: { id: string; chatId: string }
}) {
    const session = await getServerAuthSession()
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: ['chat', chatId],
        queryFn: () => getChatMessages(chatId),
    })

    return (
        <main className='flex min-h-screen flex-1 bg-blue-100'>
            <HydrationBoundary state={dehydrate(queryClient)}>
                {/* <ChatSideNavClient courseId={courseId} session={session!} /> */}
                <ChatContentWrapper
                    chatId={chatId}
                    courseId={courseId}
                    session={session!}
                />
            </HydrationBoundary>
        </main>
    )
}
