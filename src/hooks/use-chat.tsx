'use client'

import { getChatMessages } from '@/actions/chat'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type UseChatOptions = {
    chatId: string
}

export const useChat = ({ chatId }: UseChatOptions) => {
    const { data } = useQuery({
        queryKey: ['chat', chatId],
        queryFn: () => getChatMessages(chatId),
    })
    const [messages, setMessages] = useState(data)

    return {
        messages,
    }
}
