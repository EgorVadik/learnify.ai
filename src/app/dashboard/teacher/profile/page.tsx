import { EditProfile } from '@/components/forms/edit-profile'
import { Header } from '@/components/nav/header'
import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import React from 'react'

export default async function page() {
    const session = await getServerAuthSession()
    const user = await prisma.user.findUnique({
        where: {
            id: session?.user.id,
        },
        select: {
            id: true,
            image: true,
            name: true,
            email: true,
            role: true,
        },
    })

    if (!user) notFound()

    return (
        <>
            <Header title='Your Profile' />
            <EditProfile user={user} />
        </>
    )
}
