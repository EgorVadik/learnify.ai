'use client'

import { useChannel, usePresence, usePresenceListener } from 'ably/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn, formatDate, getUsernameFallback } from '@/lib/utils'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Role } from '@prisma/client'
import { useEffect, useState } from 'react'
import { updateChatReadStatus } from '@/actions/chat'
import { useToast } from '@/components/ui/use-toast'

type ChatCardProps = {
    image: string | null
    name: string
    lastMessage: string | null
    lastMessageDate: string | Date | null
    lastMessageSenderId: string | null
    userId: string
    chatId: string
    role: Role
    unReadMessageCount?: number
}

export const ChatCard = ({
    image,
    lastMessage,
    lastMessageDate,
    name,
    lastMessageSenderId,
    userId,
    chatId,
    role,
    unReadMessageCount,
}: ChatCardProps) => {
    const { toast: notificationToaster } = useToast()
    const pathname = usePathname()
    const [unSeenMessageCount, setUnSeenMessageCount] = useState<number | null>(
        unReadMessageCount ?? null,
    )
    const [lastMessageState, setLastMessageState] = useState({
        lastMessage,
        lastMessageDate,
        lastMessageSenderId,
    })
    useChannel(`chat:${chatId}`, async (msg) => {
        const [type, data] = msg.data

        if (type === 'NOTIFY') {
            if (pathname.includes(chatId)) return
            notificationToaster({
                title: `New Message from ${data.user}`,
                description: data.content,
            })
            return
        }

        if (type === 'SEND') {
            if (pathname.includes(chatId)) {
                setUnSeenMessageCount(null)
            } else {
                setUnSeenMessageCount((prev) => (prev ?? 0) + 1)
            }

            return setLastMessageState({
                lastMessage: data.content,
                lastMessageDate: data.createdAt,
                lastMessageSenderId: data.userId,
            })
        }

        setLastMessageState({
            lastMessage,
            lastMessageDate,
            lastMessageSenderId,
        })
    })

    const { presenceData } = usePresenceListener(`chat:${chatId}`)
    const isTyping = presenceData.find(
        (user) => user?.data?.isTyping && user.clientId !== userId,
    )?.data

    useEffect(() => {
        if (pathname.includes(chatId)) {
            setUnSeenMessageCount(null)
            updateChatReadStatus(chatId)
        }
    }, [chatId, pathname, setUnSeenMessageCount])

    return (
        <Link
            href={`/dashboard/${role.toLowerCase()}/chat/${chatId}`}
            className={cn(
                'flex items-stretch justify-between px-6 py-2 duration-200 hover:bg-blue-100',
                {
                    'bg-blue-100':
                        pathname ===
                        `/dashboard/${role.toLowerCase()}/chat/${chatId}`,
                },
            )}
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
                    <span className='block max-w-[11rem] truncate whitespace-nowrap text-xs text-gray-200'>
                        {isTyping?.isTyping ? (
                            <span className='text-turq-600'>
                                {isTyping.name} is typing
                            </span>
                        ) : userId === lastMessageState.lastMessageSenderId ? (
                            `you: ${lastMessageState.lastMessage}`
                        ) : (
                            lastMessageState.lastMessage
                        )}
                    </span>
                </div>
            </div>

            <div className='flex flex-col items-end justify-between text-[0.625rem]'>
                {lastMessageDate != null && (
                    <span className='text-gray-200'>
                        {formatDate(
                            lastMessageState.lastMessageDate ?? new Date(),
                            {
                                dateStyle: undefined,
                                timeStyle: 'short',
                            },
                        )}
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
