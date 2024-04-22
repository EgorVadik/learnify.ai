'use client'

import { getCourseChats } from '@/actions/chat'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatCard } from '@/components/cards/chat-card'
import { Session } from 'next-auth'
import { useLocalStorage } from '@mantine/hooks'
import { cn, getDefaultChatTabView } from '@/lib/utils'
import { ChannelProvider } from 'ably/react'

type ChatSideNavClientProps = {
    session: Session
}

export const ChatSideNavClient = ({ session }: ChatSideNavClientProps) => {
    const { data } = useQuery({
        queryKey: ['chats'],
        queryFn: () => getCourseChats(),
    })
    const [tab, setTab] = useLocalStorage<'courses' | 'private'>({
        key: 'chat-tab',
        defaultValue: 'courses',
    })

    const groupChats = data?.filter((chat) => chat.isGroup)
    const privateChats = data?.filter((chat) => !chat.isGroup)

    return (
        <>
            <Tabs
                value={tab}
                className='w-full'
                onValueChange={(value) => setTab(getDefaultChatTabView(value))}
                activationMode='manual'
            >
                <TabsList className='grid grid-cols-2 bg-transparent py-9'>
                    <TabsTrigger
                        className='rounded-none border-b border-gray-200 text-xl font-bold text-gray-200 duration-200 data-[state=active]:border-b-[3px] data-[state=active]:border-turq-600 data-[state=active]:text-turq-600 data-[state=active]:shadow-none'
                        value='courses'
                    >
                        Courses
                    </TabsTrigger>
                    <TabsTrigger
                        className='rounded-none border-b border-gray-200 text-xl font-bold text-gray-200 duration-200 data-[state=active]:border-b-[3px] data-[state=active]:border-turq-600 data-[state=active]:text-turq-600 data-[state=active]:shadow-none'
                        value='private'
                    >
                        Private
                    </TabsTrigger>
                </TabsList>
                <TabsContent
                    forceMount
                    value='courses'
                    className={cn(tab !== 'courses' && 'hidden')}
                >
                    {groupChats == null || groupChats.length === 0 ? (
                        <div className='flex items-center justify-center py-20'>
                            <p className='text-gray-700'>No group chats</p>
                        </div>
                    ) : (
                        groupChats.map((chat) => (
                            <ChannelProvider
                                key={chat.id}
                                channelName={`chat:${chat.id}`}
                            >
                                <ChatCard
                                    chatId={chat.id}
                                    image={null}
                                    name={chat.course.name}
                                    lastMessage={
                                        chat.messages[0]?.content ?? null
                                    }
                                    lastMessageDate={
                                        chat.messages[0]?.createdAt
                                    }
                                    lastMessageSenderId={
                                        chat.messages[0]?.userId
                                    }
                                    userId={session?.user.id!}
                                    role={session.user.role}
                                    unReadMessageCount={
                                        chat.hasUnread.find(
                                            (usr) =>
                                                usr.userId === session.user.id,
                                        )?.unReadCount ?? undefined
                                    }
                                />
                            </ChannelProvider>
                        ))
                    )}
                </TabsContent>
                <TabsContent
                    forceMount
                    value='private'
                    className={cn(tab !== 'private' && 'hidden')}
                >
                    {privateChats == null || privateChats.length === 0 ? (
                        <div className='flex items-center justify-center py-20'>
                            <p className='text-gray-700'>No private chats</p>
                        </div>
                    ) : (
                        privateChats.map((chat) => (
                            <ChannelProvider
                                key={chat.id}
                                channelName={`chat:${chat.id}`}
                            >
                                <ChatCard
                                    chatId={chat.id}
                                    image={
                                        chat.users.find(
                                            (user) =>
                                                user.id !== session.user.id,
                                        )?.image ?? null
                                    }
                                    name={
                                        chat.users.find(
                                            (user) =>
                                                user.id !== session.user.id,
                                        )?.name ?? ''
                                    }
                                    lastMessage={
                                        chat.messages[0]?.content ?? null
                                    }
                                    lastMessageDate={
                                        chat.messages[0]?.createdAt
                                    }
                                    lastMessageSenderId={
                                        chat.messages[0]?.userId
                                    }
                                    userId={session?.user.id!}
                                    role={session.user.role}
                                    unReadMessageCount={
                                        chat.hasUnread.find(
                                            (usr) =>
                                                usr.userId === session.user.id,
                                        )?.unReadCount ?? undefined
                                    }
                                />
                            </ChannelProvider>
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </>
    )
}
