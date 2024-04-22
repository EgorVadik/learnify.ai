'use client'

import { useChat } from '@/hooks/use-chat'
import type { Session } from 'next-auth'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn, getUsernameFallback, pluralize } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { type MessageSchema, messageSchema } from '@/actions/chat/schema'
import { Fragment, useEffect, useRef } from 'react'
import { notFound } from 'next/navigation'
import { MessageCard } from '@/components/cards/message-card'
import { MessageSeparator } from '@/components/ui/message-separator'
import { ChatMembersSheet } from '@/components/sheets/chat-members-sheet'

type ChatContentWrapperProps = {
    chatId: string
    session: Session
}

export const ChatContentWrapper = ({
    chatId,
    session,
}: ChatContentWrapperProps) => {
    const {
        messages,
        sendMessage,
        handleIsTyping,
        activePresenceData: presenceData,
    } = useChat({
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

    const isTyping = presenceData.find(
        (user) => user?.data?.isTyping && user.clientId !== session.user.id,
    )?.data

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
            <ChatMembersSheet
                chatId={chatId}
                chatName={
                    messages.isGroup
                        ? messages.course.name
                        : messages.users.find(
                              (user) => user.id !== session.user.id,
                          )?.name ?? 'Unknown Chat'
                }
                image={
                    messages.isGroup
                        ? undefined
                        : messages.users.find(
                              (user) => user.id !== session.user.id,
                          )?.image ?? undefined
                }
                session={session}
                isGroup={messages.isGroup}
                activeUsers={presenceData.map((user) => user.clientId)}
            >
                <div className='sticky top-0 z-50 cursor-pointer bg-blue-100 px-7 pb-3 duration-200 hover:*:underline'>
                    <div className='flex w-full items-center gap-4 pb-3 pt-7'>
                        <div className='relative'>
                            <Avatar className='size-16'>
                                <AvatarFallback className='size-16'>
                                    {getUsernameFallback(
                                        messages.isGroup
                                            ? messages.course.name
                                            : messages.users.find(
                                                  (user) =>
                                                      user.id !==
                                                      session.user.id,
                                              )?.name ?? 'UK',
                                    )}
                                </AvatarFallback>
                                <AvatarImage
                                    className='size-16'
                                    src={
                                        messages.isGroup
                                            ? undefined
                                            : messages.users.find(
                                                  (user) =>
                                                      user.id !==
                                                      session.user.id,
                                              )?.image ?? undefined
                                    }
                                ></AvatarImage>
                            </Avatar>

                            {!messages.isGroup && (
                                <span
                                    className={cn(
                                        'absolute bottom-0.5 right-0.5 size-3.5 rounded-full border border-white',
                                        presenceData.length === 2
                                            ? 'bg-turq-600'
                                            : 'bg-gray-200',
                                    )}
                                ></span>
                            )}
                        </div>
                        <div className='flex flex-col items-start'>
                            <span className='text-lg text-blue-400'>
                                {messages.isGroup
                                    ? messages.course.name
                                    : messages.users.find(
                                          (user) => user.id !== session.user.id,
                                      )?.name ?? 'Unknown'}
                            </span>
                            {messages.isGroup ? (
                                <span className='text-xs text-gray-200'>{`${presenceData.length} ${pluralize(presenceData.length, 'user')} currently active`}</span>
                            ) : (
                                <span className='text-xs text-gray-200'>
                                    {presenceData.length === 2
                                        ? 'Active Now' +
                                          (isTyping?.isTyping
                                              ? ' - Typing'
                                              : '')
                                        : 'Currently Inactive'}
                                </span>
                            )}
                        </div>
                    </div>
                    <Separator className='bg-[rgba(128,128,128,0.50)]' />
                </div>
            </ChatMembersSheet>

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
