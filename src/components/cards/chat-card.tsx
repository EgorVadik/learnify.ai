'use client'

import { useChannel, usePresence } from 'ably/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, getUsernameFallback } from '@/lib/utils'
import Link from 'next/link'

type ChatCardProps = {
    image: string | null
    name: string
    lastMessage: string | null
    lastMessageDate: string | Date | null
    lastMessageSenderId: string | null
    // isTyping: boolean
    userId: string
    chatId: string
    courseId: string
    // unSeenMessageCount: number | null
}

export const ChatCard = ({
    image,
    lastMessage,
    lastMessageDate,
    name,
    // isTyping,
    lastMessageSenderId,
    userId,
    chatId,
    courseId,
    // unSeenMessageCount,
}: ChatCardProps) => {
    const channel = useChannel(`chat:${chatId}`)
    const { presenceData, updateStatus } = usePresence(`chat:${chatId}`)

    // const isTyping = presenceData.some(
    //     (user) => user.data.isTyping && user.clientId !== userId,
    // )
    // const unSeenMessageCount = presenceData.find(
    //     (user) => user.clientId === userId,
    // )?.data.unSeenMessageCount

    const isTyping = false
    const unSeenMessageCount = null

    return (
        <Link
            href={`/dashboard/teacher/courses/${courseId}/chat/${chatId}`}
            className='flex items-stretch justify-between px-6 py-2 duration-200 hover:bg-blue-100'
        >
            <div className='flex items-center gap-3'>
                <Avatar>
                    <AvatarFallback className='bg-gray-100'>
                        {getUsernameFallback(name)}
                    </AvatarFallback>
                    <AvatarImage src={image ?? undefined} alt={name} />
                </Avatar>
                <div className='flex flex-col items-start'>
                    <span className='block max-w-[13rem] truncate whitespace-nowrap text-sm font-medium text-black'>
                        {name}
                    </span>
                    <span className='block max-w-[13rem] truncate whitespace-nowrap text-xs text-gray-200'>
                        {isTyping ? (
                            <span className='text-turq-600'>... is typing</span>
                        ) : (
                            userId === lastMessageSenderId &&
                            `you: ${lastMessage}`
                        )}
                    </span>
                </div>
            </div>

            <div className='flex flex-col items-end justify-between text-[0.625rem]'>
                {lastMessageDate != null && (
                    <span className='text-gray-200'>
                        {formatDate(lastMessageDate, {
                            dateStyle: undefined,
                            timeStyle: 'short',
                        })}
                    </span>
                )}
                {unSeenMessageCount != null && (
                    <span className='flex size-4 items-center justify-center rounded-full bg-turq-600 text-white'>
                        {unSeenMessageCount}
                    </span>
                )}
            </div>
        </Link>
    )
}
