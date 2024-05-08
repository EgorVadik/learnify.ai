import { Header } from '@/components/nav/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import {
    capitalizeFirstLetter,
    cn,
    getUsernameFallback,
    isMongoId,
} from '@/lib/utils'
import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import React from 'react'
import { z } from 'zod'
import {
    Table,
    TableBody,
    TableRow,
    TableHead,
    TableHeader,
    TableCell,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { getServerAuthSession } from '@/server/auth'
import { RemoveMemberButton } from '@/components/buttons/remove-member-button'

const Params = z.object({
    id: z.string().refine(isMongoId),
})

export default async function page({ params }: { params: { id: string } }) {
    const parsedParams = Params.safeParse(params)
    if (!parsedParams.success) notFound()
    const { id } = parsedParams.data
    const session = await getServerAuthSession()

    const user = await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            image: true,
            courses: {
                select: {
                    id: true,
                    name: true,
                    courseAdmin: {
                        select: {
                            userId: true,
                        },
                    },
                    tasks: {
                        select: {
                            id: true,
                            type: true,
                            title: true,
                            exam: {
                                select: {
                                    examSubmissions: {
                                        where: {
                                            student: {
                                                userId: id,
                                            },
                                        },
                                        select: {
                                            score: true,
                                            createdAt: true,
                                        },
                                    },
                                },
                            },
                            studentTaskUploads: {
                                where: {
                                    student: {
                                        userId: id,
                                    },
                                },
                                select: {
                                    id: true,
                                    uploadedAt: true,
                                    score: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    if (!user) notFound()
    if (user.role !== 'STUDENT') notFound()

    const filteredUser: typeof user = {
        ...user,
        courses: user.courses.map((course) => {
            return {
                ...course,
                tasks: course.tasks.filter(
                    (task) =>
                        (task.type === 'ASSIGNMENT' &&
                            task.studentTaskUploads.length > 0) ||
                        (task.type === 'EXAM' &&
                            (task.exam?.examSubmissions.length ?? 0) > 0),
                ),
            }
        }),
    }

    return (
        <>
            <Header title={user.name} />
            <main
                className={cn('space-y-12', {
                    'max-w-screen-lg': filteredUser.courses.length > 0,
                })}
            >
                <div className='flex items-end gap-4'>
                    <Avatar className='size-32'>
                        <AvatarFallback className='size-32 bg-gray-100 text-3xl'>
                            {getUsernameFallback(user.name)}
                        </AvatarFallback>
                        <AvatarImage
                            className='size-32'
                            src={user.image ?? undefined}
                        ></AvatarImage>
                    </Avatar>

                    <div>
                        <span className='text-2xl text-blue-400'>
                            {user.name}
                        </span>
                        <p className='text-gray-200'>
                            {capitalizeFirstLetter(user.role)}
                        </p>
                    </div>
                </div>

                {filteredUser.courses.length > 0 ? (
                    filteredUser.courses.map((course) => (
                        <div key={course.id} className='flex flex-col gap-10'>
                            <div className='flex items-center justify-between'>
                                <h2 className='text-heading text-black'>
                                    {course.name}
                                </h2>
                                {course.courseAdmin.userId ===
                                    session?.user.id && (
                                    <RemoveMemberButton
                                        userId={user.id}
                                        courseAdminId={
                                            course.courseAdmin.userId
                                        }
                                        courseId={course.id}
                                        text='Remove From Course'
                                        className='text-base font-bold'
                                    />
                                )}
                            </div>
                            <CardWrapper className='space-y-10'>
                                <Table>
                                    <TableHeader>
                                        <TableRow className='hover:bg-transparent'>
                                            <TableHead className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                                                Task Name
                                            </TableHead>
                                            <TableHead className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                                                Date Submitted
                                            </TableHead>
                                            <TableHead className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                                                Grade
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {course.tasks.length > 0 ? (
                                            course.tasks.map((task) => (
                                                <TableRow
                                                    key={task.id}
                                                    className='border-none hover:bg-transparent'
                                                >
                                                    <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                                                        {task.title}
                                                    </TableCell>
                                                    <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                                                        {formatDate(
                                                            (task.type ===
                                                            'ASSIGNMENT'
                                                                ? task.studentTaskUploads.at(
                                                                      0,
                                                                  )?.uploadedAt
                                                                : task.exam?.examSubmissions.at(
                                                                      0,
                                                                  )
                                                                      ?.createdAt) ??
                                                                new Date(),
                                                        )}
                                                    </TableCell>
                                                    <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                                                        {task.type ===
                                                        'ASSIGNMENT'
                                                            ? `${
                                                                  task.studentTaskUploads.at(
                                                                      0,
                                                                  )?.score
                                                              }%` ?? 'N/A'
                                                            : `${
                                                                  task.exam?.examSubmissions.at(
                                                                      0,
                                                                  )?.score
                                                              }%` ?? 'N/A'}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className='border-none hover:bg-transparent'>
                                                <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                                                    No tasks submitted
                                                </TableCell>
                                                <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                                                    N/A
                                                </TableCell>
                                                <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                                                    N/A
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardWrapper>
                        </div>
                    ))
                ) : (
                    <div className='text-balance text-center text-2xl font-medium text-black-full sm:text-heading'>
                        This student is not enrolled in any courses yet.
                    </div>
                )}
            </main>
        </>
    )
}
