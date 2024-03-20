import { getCourseIds } from '@/actions/course'
import { prisma } from '@/server/db'
import { startOfDay, subDays } from 'date-fns'
import { UpdatesCard } from '../cards/updates-card'

export const StudentLatestUpdatesWrapper = async () => {
    const courseIds = await getCourseIds()
    const updates = await prisma.course.findMany({
        where: {
            id: {
                in: courseIds,
            },
        },
        include: {
            announcements: {
                where: {
                    createdAt: {
                        gte: startOfDay(subDays(new Date(), 2)),
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            materials: {
                where: {
                    createdAt: {
                        gte: startOfDay(subDays(new Date(), 2)),
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
        },
    })

    const announcements = updates
        .map((course) =>
            course.announcements.map((announcement) => ({
                id: announcement.id,
                title: announcement.title,
                createdAt: announcement.createdAt,
                course: course.name,
                courseId: course.id,
            })),
        )
        .flat()

    const materials = updates
        .map((course) =>
            course.materials.map((material) => ({
                id: material.id,
                title: material.title,
                createdAt: material.createdAt,
                course: course.name,
                courseId: course.id,
            })),
        )
        .flat()

    if (announcements.length === 0 && materials.length === 0) {
        return (
            <div className='text-center text-[1.375rem] font-medium text-black-full'>
                No updates available
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-2.5'>
            {announcements.map((announcement) => (
                <UpdatesCard key={announcement.id} item={announcement} />
            ))}
            {materials.map((material) => (
                <UpdatesCard key={material.id} item={material} />
            ))}
        </div>
    )
}
