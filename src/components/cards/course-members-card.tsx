import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { UserAvatar } from './user-avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { RemoveMemberButton } from '@/components/buttons/remove-member-button'
import { SearchMember } from '../forms/search-member'
import { EndCourseButton } from '../buttons/end-course-button'

type CourseMembersCardProps = {
    courseId: string
    defaultSearchValue: string
}

export const CourseMembersCard = async ({
    courseId,
    defaultSearchValue,
}: CourseMembersCardProps) => {
    const session = await getServerAuthSession()
    const members = await prisma.course.findUnique({
        where: {
            id: courseId,
        },
        select: {
            users: {
                where: {
                    name: {
                        contains: defaultSearchValue,
                        mode: 'insensitive',
                    },
                },
                select: {
                    role: true,
                    name: true,
                    id: true,
                    image: true,
                },
            },
            courseAdmin: {
                select: {
                    userId: true,
                },
            },
        },
    })

    return (
        <>
            <div className='flex items-end justify-between'>
                <h3 className='text-2xl font-medium text-black'>Members</h3>
                {members?.courseAdmin.userId === session?.user.id && (
                    <EndCourseButton courseId={courseId} />
                )}
            </div>
            <SearchMember
                courseId={courseId}
                defaultValue={defaultSearchValue}
            />
            <ScrollArea className='h-48'>
                {members?.users.map((user) => (
                    <div
                        key={user.id}
                        className='flex items-center justify-between gap-2 py-[6px]'
                    >
                        <UserAvatar name={user.name} image={user.image} />

                        {members.courseAdmin.userId === session?.user.id && (
                            <RemoveMemberButton
                                userId={user.id}
                                courseAdminId={members.courseAdmin.userId}
                                courseId={courseId}
                            />
                        )}
                    </div>
                ))}
            </ScrollArea>
        </>
    )
}
