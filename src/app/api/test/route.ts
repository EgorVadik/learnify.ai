import { NextResponse } from 'next/server'
import { faker } from '@faker-js/faker'
import { prisma } from '@/server/db'
import { createNewUser } from '@/actions/user'
import { hash } from 'bcrypt'
import { createCourse } from '@/actions/course'

export async function GET(request: Request) {
    const courses = await prisma.course.findMany({
        include: {
            courseAdmin: true,
            users: true,
        },
    })

    return new Response(
        JSON.stringify({
            courses,
        }),
        { status: 200 },
    )
}

export async function POST(req: Request) {
    const messages = await prisma.message.createMany({
        data: Array.from({ length: 100 }, () => ({
            content: faker.lorem.sentence(),
            chatId: '663b5934a1c02d173a68a247',
            userId:
                Math.random() > 0.5
                    ? '663b55ffa1c02d173a68a168'
                    : '663b55ffa1c02d173a68a16a',
        })),
    })

    return NextResponse.json({ messages }, { status: 201 })
}

export async function DELETE(req: Request) {
    // const message = await prisma.message.deleteMany()
    // const chat = await prisma.chat.deleteMany()
    // const courses = await prisma.course.deleteMany()
    // const teacher = await prisma.teacher.deleteMany()
    // const student = await prisma.student.deleteMany()
    // const user = await prisma.user.deleteMany()
    // return NextResponse.json(user, { status: 200 })
}

export async function PUT(req: Request) {
    const users = await prisma.user.findMany()
    const courses = await prisma.course.findMany()
    await Promise.all(
        courses.map(async (course) => {
            return await prisma.course.update({
                where: {
                    id: course.id,
                },
                data: {
                    users: {
                        connect: {
                            id: users.find(
                                (user) =>
                                    user.id ===
                                    course.userIds.find((c) => c === user.id),
                            )?.id,
                        },
                    },
                },
            })
        }),
    )

    return NextResponse.json(
        { message: 'done' },
        {
            status: 200,
        },
    )
}
