'use client'

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { capitalizeFirstLetter, getUsernameFallback } from '@/lib/utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getChatMembers, startPrivateChat } from '@/actions/chat'
import { Separator } from '@/components/ui/separator'
import { UserAvatar } from '../cards/user-avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Icons } from '../icons'
import { Session } from 'next-auth'
import { useCallback, useEffect, useState } from 'react'
import { SimpleUser } from '@/types'
import Link from 'next/link'
import { ArrowLeftSquareIcon } from 'lucide-react'
import { toast } from 'sonner'
import { StartPrivateChatSchema } from '@/actions/chat/schema'
import { useRouter } from 'next/navigation'

type ChatMembersSheetProps = {
    children: React.ReactNode
    chatId: string
    chatName: string
    image?: string
    session: Session
    isGroup: boolean
    activeUsers: string[]
}

export const ChatMembersSheet = ({
    children,
    chatId,
    chatName,
    image,
    session,
    isGroup,
    activeUsers,
}: ChatMembersSheetProps) => {
    const queryClient = useQueryClient()
    const router = useRouter()
    const { mutate, isPending } = useMutation({
        mutationFn: ({ userId, courseId }: StartPrivateChatSchema) =>
            startPrivateChat({
                userId,
                courseId,
            }),
        async onSuccess(data) {
            if (!data.success) return toast.error(data.error)
            await queryClient.invalidateQueries({
                exact: true,
                queryKey: ['chat', 'members', chatId],
            })

            await queryClient.invalidateQueries({
                exact: true,
                queryKey: ['chats'],
            })

            router.push(data.data.url)
        },
    })
    const { data, isLoading } = useQuery({
        queryKey: ['chat', 'members', chatId],
        queryFn: () => getChatMembers(chatId),
    })
    const [selectedUser, setSelectedUser] = useState<
        | (Omit<SimpleUser, 'email'> & {
              courses: {
                  id: string
                  name: string
              }[]
              chats: {
                  id: string
                  userIds: string[]
              }[]
          })
        | null
    >(null)

    useEffect(() => {
        if (isGroup || data == null) return
        if (selectedUser == null) {
            setSelectedUser(
                data.users.find((user) => user.id !== session.user.id) ?? null,
            )
        }
    }, [data, isGroup, selectedUser, session.user.id])

    const renderContent = useCallback(() => {
        if (isLoading) {
            return (
                <div className='flex items-center justify-center text-2xl font-bold'>
                    <Icons.Spinner />
                </div>
            )
        }

        if (selectedUser !== null) {
            return (
                <div className='flex h-full flex-col px-7'>
                    <span className='pb-5 text-xl text-blue-400'>
                        Mutual Courses:
                    </span>
                    {selectedUser.courses.map((course) => (
                        <Link
                            key={course.id}
                            className={buttonVariants({
                                className: 'h-fit',
                                variant: 'link',
                            })}
                            href={`/dashboard/${session.user.role.toLowerCase()}/courses/${course.id}`}
                        >
                            <div className='flex w-full items-center justify-between'>
                                <div className='flex items-center gap-6'>
                                    <Avatar className='rounded-md'>
                                        <AvatarFallback className='rounded-md bg-gray-100'>
                                            {getUsernameFallback(course.name)}
                                        </AvatarFallback>
                                        <AvatarImage
                                            className='rounded-md'
                                            src={undefined}
                                        ></AvatarImage>
                                    </Avatar>
                                    <span className='text-base text-black'>
                                        {course.name}
                                    </span>
                                </div>
                                <Icons.ArrowRight />
                            </div>
                        </Link>
                    ))}
                </div>
            )
        }

        if (data != null && data.users.length > 0) {
            return (
                <div className='flex h-full flex-col px-7'>
                    <span className='pb-5 text-xl text-blue-400'>
                        Chat Members:
                    </span>
                    {data.users.map((user) => (
                        <Button
                            key={user.id}
                            variant={'ghost'}
                            className='h-fit justify-start py-3 hover:bg-gray-100'
                            disabled={user.id === session.user.id}
                            onClick={() => setSelectedUser(user)}
                        >
                            <UserAvatar
                                image={user.image}
                                name={user.name}
                                activeNow={activeUsers.includes(user.id)}
                                nameClassName='flex flex-col text-base items-start'
                            />
                        </Button>
                    ))}
                </div>
            )
        }

        return (
            <div className='flex items-center justify-center text-2xl font-bold'>
                No members
            </div>
        )
    }, [activeUsers, data, isLoading, selectedUser, session])

    return (
        <Sheet
            onOpenChange={(open) => {
                if (!open) {
                    setSelectedUser(null)
                }
            }}
        >
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent side={'right'}>
                {isGroup && selectedUser !== null && (
                    <Button
                        variant={'link'}
                        size={'icon'}
                        onClick={() => setSelectedUser(null)}
                        className='absolute left-1 top-1 z-50'
                    >
                        <span className='sr-only'>Back to members</span>
                        <ArrowLeftSquareIcon />
                    </Button>
                )}
                <ScrollArea className='h-screen pb-10'>
                    <SheetHeader className='mb-10 items-center gap-10'>
                        <SheetTitle className='flex flex-col items-center gap-4 truncate'>
                            <Avatar className='size-32'>
                                <AvatarFallback className='size-32 bg-gray-100 text-3xl'>
                                    {getUsernameFallback(
                                        selectedUser === null
                                            ? chatName
                                            : selectedUser.name,
                                    )}
                                </AvatarFallback>
                                <AvatarImage
                                    className='size-32'
                                    src={
                                        selectedUser === null
                                            ? image
                                            : selectedUser.image ?? undefined
                                    }
                                ></AvatarImage>
                            </Avatar>
                            <div className='flex flex-col items-center'>
                                <span className='text-2xl font-medium text-blue-400'>
                                    {selectedUser === null
                                        ? chatName
                                        : selectedUser.name}
                                </span>
                                {selectedUser !== null && (
                                    <>
                                        <span className='pb-4 text-sm font-normal text-gray-200'>
                                            {capitalizeFirstLetter(
                                                selectedUser.role,
                                            )}
                                        </span>
                                        {session.user.role === 'TEACHER' && (
                                            <Link
                                                href={`/dashboard/teacher/student-details/${selectedUser.id}`}
                                                className={buttonVariants({
                                                    variant: 'primary',
                                                })}
                                            >
                                                <span className='font-bold'>
                                                    View Details
                                                </span>
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                            {isGroup &&
                                selectedUser !== null &&
                                (selectedUser.chats.length > 0 ? (
                                    <Link
                                        href={`/dashboard/${session.user.role.toLowerCase()}/chat/${selectedUser.chats[0].id}`}
                                        className={buttonVariants({
                                            variant: 'primary',
                                        })}
                                    >
                                        <span className='font-bold'>
                                            Message Privately
                                        </span>
                                    </Link>
                                ) : (
                                    <Button
                                        variant={'primary'}
                                        onClick={() =>
                                            mutate({
                                                userId: selectedUser.id,
                                                courseId:
                                                    selectedUser.courses[0]?.id,
                                            })
                                        }
                                        disabled={isPending}
                                    >
                                        {isPending && <Icons.Spinner />}
                                        <span className='font-bold'>
                                            Start Private Chat
                                        </span>
                                    </Button>
                                ))}
                        </SheetTitle>
                        <Separator className='bg-muted-gray' />
                    </SheetHeader>
                    {renderContent()}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
