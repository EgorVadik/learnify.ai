'use client'

import { useChat } from '@/hooks/use-chat'
import type { Session } from 'next-auth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn, getUsernameFallback } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { type MessageSchema, messageSchema } from '@/actions/chat/schema'
import { Fragment, useEffect, useRef } from 'react'
import { notFound } from 'next/navigation'
import { MessageCard } from '../cards/message-card'
import { MessageSeparator } from '@/components/ui/message-separator'

type ChatContentWrapperProps = {
    chatId: string
    session: Session
}

export const ChatContentWrapper = ({
    chatId,
    session,
}: ChatContentWrapperProps) => {
    const { messages, sendMessage, handleIsTyping } = useChat({
        chatId,
        session,
    })
    const lastMessageRef = useRef<HTMLDivElement>(null)
    const form = useForm<MessageSchema>({
        resolver: zodResolver(messageSchema),
        defaultValues: {
            message: '',
        },
    })

    useEffect(() => {
        lastMessageRef.current?.scrollIntoView({
            behavior: 'smooth',
        })
    }, [messages])

    const onSubmit = async (data: MessageSchema) => {
        sendMessage(data.message)
        form.reset()
    }

    if (messages == null) notFound()

    return (
        <div className='flex w-full flex-col justify-between'>
            <div className='sticky top-0 z-50 bg-blue-100 px-7 pb-3'>
                <div className='flex w-full items-center gap-4 pb-3 pt-7'>
                    <Avatar className='size-16'>
                        <AvatarFallback className='size-16'>
                            {getUsernameFallback(
                                messages.isGroup
                                    ? messages.course.name
                                    : messages.users.find(
                                          (user) => user.id !== session.user.id,
                                      )?.name ?? 'UK',
                            )}
                        </AvatarFallback>
                        <AvatarImage
                            className='size-16'
                            src={
                                messages.isGroup
                                    ? undefined
                                    : messages.users.find(
                                          (user) => user.id !== session.user.id,
                                      )?.image ?? undefined
                            }
                        ></AvatarImage>
                    </Avatar>
                    <span className='text-lg text-blue-400'>
                        {messages.isGroup
                            ? messages.course.name
                            : messages.users.find(
                                  (user) => user.id !== session.user.id,
                              )?.name ?? 'Unknown'}
                    </span>
                </div>
                <Separator className='bg-[rgba(128,128,128,0.50)]' />
            </div>

            <div className='h-full px-7 pb-3'>
                {messages == null || messages.messages.length === 0 ? (
                    <div className='flex h-full items-center justify-center text-2xl font-bold'>
                        Chat is currently empty
                    </div>
                ) : (
                    <>
                        <MessageSeparator
                            date1={messages.messages[0].createdAt}
                            date2={new Date()}
                        />
                        {messages.messages.map((message, i) => {
                            return (
                                <Fragment key={message.id}>
                                    <MessageSeparator
                                        date1={message.createdAt}
                                        date2={
                                            messages.messages[
                                                i === 0 ? i : i - 1
                                            ]?.createdAt
                                        }
                                    />
                                    <MessageCard
                                        message={message}
                                        session={session}
                                    />
                                </Fragment>
                            )
                        })}
                        <div ref={lastMessageRef} />
                    </>
                )}
            </div>

            <div className='sticky bottom-0 mt-auto bg-white-full px-3 py-2'>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='flex items-center'
                    >
                        <FormField
                            control={form.control}
                            name='message'
                            render={({ field }) => (
                                <FormItem className='w-full'>
                                    <FormControl>
                                        <Input
                                            placeholder='Type your message here..'
                                            className={cn({
                                                'border-red-primary ring-red-primary':
                                                    form.control.getFieldState(
                                                        'message',
                                                    ).error != null,
                                            })}
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e)
                                                handleIsTyping()
                                            }}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <Button type='submit' variant={'link'} className='px-3'>
                            <span className='text-sm font-bold text-turq-600'>
                                Send Message
                            </span>
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}
