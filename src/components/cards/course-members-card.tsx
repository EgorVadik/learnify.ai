import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { UserAvatar } from './user-avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

type CourseMembersCardProps = {
    courseId: string
}

export const CourseMembersCard = async ({
    courseId,
}: CourseMembersCardProps) => {
    const session = await getServerAuthSession()
    const members = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            users: {
                select: {
                    role: true,
                    name: true,
                    id: true,
                    image: true,
                },
            },
            courseAdminId: true,
        },
    })

    // TODO: Add search bar

    return (
        <>
            {/* <SearchBar /> */}
            <span className='block pt-3'>Search bar</span>
            <ScrollArea className='h-48'>
                {members?.users.map((user) => (
                    <div
                        key={user.id}
                        className='flex items-center justify-between py-[6px]'
                    >
                        <UserAvatar name={user.name} image={user.image} />

                        {members.courseAdminId === session?.user.id && (
                            <Button
                                className='px-0 py-0 text-xs text-red-primary'
                                variant={'link'}
                                disabled={user.id === members.courseAdminId}
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                ))}
            </ScrollArea>
        </>
    )
}
