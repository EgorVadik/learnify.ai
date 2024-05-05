import { getServerAuthSession } from '@/server/auth'
import {
    dehydrate,
    QueryClient,
    HydrationBoundary,
} from '@tanstack/react-query'
import { ChatSideNavClient } from './chat-side-nav-client'
import { getCourseChats } from '@/actions/chat'

export const ChatSideNav = async () => {
    const session = await getServerAuthSession()
    const queryClient = new QueryClient()
    await queryClient.prefetchQuery({
        queryKey: ['chats'],
        queryFn: () => getCourseChats(),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ChatSideNavClient session={session!} />
        </HydrationBoundary>
    )
}
