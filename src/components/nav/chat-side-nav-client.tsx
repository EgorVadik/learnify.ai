'use client'

import { getCourseChats } from '@/actions/chat'
import { useQuery } from '@tanstack/react-query'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatCard } from '../cards/chat-card'
import { Session } from 'next-auth'

type ChatSideNavClientProps = {
    session: Session
}

export const ChatSideNavClient = ({ session }: ChatSideNavClientProps) => {
    const { data } = useQuery({
        queryKey: ['chats'],
        queryFn: () => getCourseChats(),
        // queryFn: () => getCourseChats(courseId),
    })

    return (
        <>
            <Tabs defaultValue='courses' className='w-full'>
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
                <TabsContent value='courses'>
                    {data
                        ?.filter((chat) => chat.isGroup)
                        .map((chat) => (
                            <ChatCard
                                key={chat.id}
                                chatId={chat.id}
                                image={null}
                                name={chat.course.name}
                                lastMessage={chat.messages[0]?.content ?? null}
                                lastMessageDate={chat.messages[0]?.createdAt}
                                lastMessageSenderId={chat.messages[0]?.userId}
                                userId={session?.user.id!}
                            />
                        ))}
                </TabsContent>
                <TabsContent value='private'>
                    {data
                        ?.filter((chat) => !chat.isGroup)
                        .map((chat) => (
                            <ChatCard
                                key={chat.id}
                                chatId={chat.id}
                                image={
                                    chat.users.find(
                                        (user) => user.id !== session.user.id,
                                    )?.image ?? null
                                }
                                name={
                                    chat.users.find(
                                        (user) => user.id !== session.user.id,
                                    )?.name ?? ''
                                }
                                lastMessage={chat.messages[0]?.content ?? null}
                                lastMessageDate={chat.messages[0]?.createdAt}
                                lastMessageSenderId={chat.messages[0]?.userId}
                                userId={session?.user.id!}
                            />
                        ))}
                </TabsContent>
            </Tabs>
        </>
    )
}
