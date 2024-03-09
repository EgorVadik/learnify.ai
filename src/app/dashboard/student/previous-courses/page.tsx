import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'

export default async function page() {
    const session = await getServerAuthSession()
    const courses = await prisma.student.findUnique({
        where: {
            userId: session?.user.id,
        },
        select: {
            courseStatuses: {
                include: {
                    course: true,
                },
            },
        },
    })

    const enrolledCourses = courses?.courseStatuses.filter(
        (stat) => stat.status === 'ENROLLED',
    )
    const finishedCourses = courses?.courseStatuses.filter(
        (stat) => stat.status === 'DONE',
    )
    const droppedCourses = courses?.courseStatuses.filter(
        (stat) => stat.status === 'DROPPED',
    )

    return (
        <Tabs
            // activationMode='manual'
            defaultValue='ENROLLED'
            className='w-[400px]'
        >
            <TabsList>
                <TabsTrigger value='ENROLLED'>Enrolled</TabsTrigger>
                <TabsTrigger value='DROPPED'>Dropped</TabsTrigger>
                <TabsTrigger value='DONE'>Done</TabsTrigger>
            </TabsList>
            <TabsContent value='ENROLLED'>
                <EnrolledCom />
            </TabsContent>
            <TabsContent value='DROPPED'>
                <DroppedCom />
            </TabsContent>
            <TabsContent value='DONE'>
                <FinishedCom />
            </TabsContent>
        </Tabs>
    )
}

const EnrolledCom = () => {
    console.log('ENROLLED')
    return 'Enrolled courses'
}

const DroppedCom = () => {
    console.log('DROPPED')
    return 'Dropped courses'
}

const FinishedCom = () => {
    console.log('DONE')
    return 'Finished courses'
}
