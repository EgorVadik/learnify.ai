'use client'

import { useChat } from '@/hooks/use-chat'
import type { Session } from 'next-auth'
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar'
import { getUsernameFallback } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

type ChatContentWrapperProps = {
    chatId: string
    courseId: string
    session: Session
}

export const ChatContentWrapper = ({
    chatId,
    courseId,
    session,
}: ChatContentWrapperProps) => {
    const { messages } = useChat({ chatId })

    return (
        <div className='w-full px-7 pb-7'>
            <div className='sticky top-0 bg-blue-100 pb-3'>
                <div className='flex w-full items-center gap-4 pb-3 pt-7'>
                    <Avatar className='size-16'>
                        <AvatarFallback className='size-16'>
                            {getUsernameFallback(
                                messages?.isGroup
                                    ? messages.course.name
                                    : messages?.users.find(
                                          (user) => user.id !== session.user.id,
                                      )?.name ?? 'UK',
                            )}
                        </AvatarFallback>
                        <AvatarImage
                            className='size-16'
                            src={
                                messages?.isGroup
                                    ? undefined
                                    : messages?.users.find(
                                          (user) => user.id !== session.user.id,
                                      )?.image ?? undefined
                            }
                        ></AvatarImage>
                    </Avatar>
                    <span className='text-lg text-blue-400'>
                        {messages?.isGroup
                            ? messages.course.name
                            : messages?.users.find(
                                  (user) => user.id !== session.user.id,
                              )?.name ?? 'Unknown'}
                    </span>
                </div>
                <Separator className='bg-[rgba(128,128,128,0.50)]' />
            </div>
        </div>
    )
}
