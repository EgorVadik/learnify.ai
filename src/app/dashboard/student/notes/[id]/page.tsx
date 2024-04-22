import { Editor } from '@/components/editor/editor'
import { isMongoId } from '@/lib/utils'
import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { notFound } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

export default async function page({ params }: { params: { id: string } }) {
    const session = await getServerAuthSession()
    const parsedParams = z
        .object({
            id: z.string().refine(isMongoId),
        })
        .safeParse(params)

    if (!parsedParams.success) notFound()

    const { id } = parsedParams.data

    const note = await prisma.note.findUnique({
        where: {
            id,
        },
        select: {
            content: true,
            id: true,
            student: {
                select: {
                    userId: true,
                },
            },
        },
    })

    if (!note) notFound()
    return (
        <Editor
            id={note.id}
            content={note.content}
            userId={note.student.userId}
            session={session}
        />
    )
}
