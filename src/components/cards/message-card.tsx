import { cn, formatDate, getUsernameFallback } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Session } from 'next-auth'
import type { SimpleUser } from '@/types'
import type { Message } from '@prisma/client'

type MessageCardProps = {
    message: Message & {
        user: Omit<SimpleUser, 'email' | 'role'>
    }
    session: Session
}

export const MessageCard = ({ message, session }: MessageCardProps) => {
    return (
        <div
            key={message.id}
            className={cn(
                'flex w-11/12 gap-2',
                {
                    'ml-auto': message.userId === session.user.id,
                },
                message.userId !== session.user.id
                    ? 'pt-3 first:pt-0'
                    : 'pt-6 first:pt-0',
            )}
        >
            {message.userId !== session.user.id && (
                <Avatar className='size-6'>
                    <AvatarFallback className='size-6 text-xs'>
                        {getUsernameFallback(message.user.name)}
                    </AvatarFallback>
                    <AvatarImage
                        className='size-6'
                        src={message.user.image ?? undefined}
                        alt='test'
                    />
                </Avatar>
            )}
            <div
                className={cn('flex flex-col gap-[6px]', {
                    'ml-auto': message.userId === session.user.id,
                })}
            >
                {message.userId !== session.user.id && (
                    <span className='text-xs text-blue-400'>
                        {message.user.name}
                    </span>
                )}
                <div
                    className={cn(
                        'rounded-2xl bg-[#F4F4F7] px-4 pb-2 pt-3',
                        message.userId === session.user.id
                            ? 'rounded-br-none'
                            : 'rounded-tl-none',
                    )}
                >
                    <div className='flex flex-col items-start gap-1'>
                        <span className='text-sm text-black-full/85'>
                            {message.content}
                        </span>
                        <span
                            className={cn('text-[0.625rem] text-gray-200', {
                                'self-end': message.userId === session.user.id,
                            })}
                        >
                            {formatDate(message.createdAt, {
                                dateStyle: undefined,
                                hour12: false,
                                timeStyle: 'short',
                            })}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
