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
        <aside className='w-full max-w-xs shrink-0 grow'>
            <nav className='sticky top-0'>
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <ChatSideNavClient session={session!} />
                </HydrationBoundary>
            </nav>
        </aside>
    )
}
