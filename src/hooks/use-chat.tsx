'use client'

import { createChatMessage, getChatMessages } from '@/actions/chat'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useChannel, usePresence, usePresenceListener } from 'ably/react'
import type { Session } from 'next-auth'
import { toast } from 'sonner'

type UseChatOptions = {
    chatId: string
    session: Session
}

let typingTimer: NodeJS.Timeout | null = null

export const useChat = ({ chatId, session }: UseChatOptions) => {
    const queryClient = useQueryClient()
    const { data } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: () => getChatMessages(chatId),
    })
    const { mutate } = useMutation({
        mutationKey: ['chat', chatId],
        mutationFn: ({
            chatId,
            message,
        }: {
            chatId: string
            message: string
            id: string
        }) => createChatMessage(chatId, message),
        async onSuccess(data, { id }) {
            await queryClient.invalidateQueries({
                exact: true,
                queryKey: ['chat', chatId],
            })
            await queryClient.invalidateQueries({
                exact: true,
                queryKey: ['chats'],
            })
            if (data.success) return
            channel.publish(`chat:${chatId}`, ['REMOVE', id])
            toast.error(data.error)
        },
    })
    const [messages, setMessages] = useState(data)
    const { channel } = useChannel(`chat:${chatId}`, (message) => {
        const [type, data] = message.data
        if (type === 'SEND') {
            setMessages((prev) => {
                if (!prev) return
                return {
                    ...prev,
                    messages: [...prev.messages, data],
                }
            })
            return
        }

        setMessages((prev) => {
            if (!prev) return
            return {
                ...prev,
                messages: prev.messages.filter((msg) => msg.id !== data),
            }
        })
    })
    const {
        updateStatus: updateActiveStatus,
        // presenceData: activePresenceData,
    } = usePresence(`chat:${chatId}:active`)
    const { updateStatus } = usePresence(`chat:${chatId}`)
    // const { updateStatus, presenceData } = usePresence(`chat:${chatId}`)
    const { presenceData: activePresenceData } = usePresenceListener(
        `chat:${chatId}:active`,
    )
    const { presenceData } = usePresenceListener(`chat:${chatId}`)

    const sendMessage = async (message: string) => {
        const id = crypto.randomUUID()
        channel.publish(`chat:${chatId}`, [
            'SEND',
            {
                id,
                chatId,
                content: message,
                createdAt: new Date(),
                updatedAt: new Date(),
                user: {
                    id: session.user.id,
                    name: session.user.name,
                    image: session.user.image,
                },
                userId: session.user.id,
            },
        ])

        updateStatus({ isTyping: false, name: session.user.name })
        updateActiveStatus({ isTyping: false, name: session.user.name })

        if (typingTimer) {
            clearTimeout(typingTimer)
        }

        mutate({
            chatId,
            message,
            id,
        })
    }

    const handleIsTyping = () => {
        const user = presenceData.find(
            (user) => user.clientId === session.user.id,
        )
        if (user?.data?.isTyping) return

        updateStatus({ isTyping: true, name: session.user.name })
        updateActiveStatus({ isTyping: true, name: session.user.name })

        if (typingTimer) {
            clearTimeout(typingTimer)
        }

        typingTimer = setTimeout(() => {
            updateStatus({ isTyping: false })
            updateActiveStatus({ isTyping: false })
        }, 5000)
    }

    return {
        messages,
        sendMessage,
        handleIsTyping,
        activePresenceData,
    }
}
