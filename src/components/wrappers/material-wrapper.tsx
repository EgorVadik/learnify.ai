import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import React from 'react'
import { MaterialCard } from '../cards/material-card'

type MaterialWrapperProps = {
    courseId: string
}

export const MaterialWrapper = async ({ courseId }: MaterialWrapperProps) => {
    const session = await getServerAuthSession()
    const materials = await prisma.material.findMany({
        where: {
            courseId,
        },
        include: {
            course: {
                select: {
                    courseAdminId: true,
                    users: {
                        select: {
                            id: true,
                            role: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    const completedMaterials = materials.filter((material) =>
        material.completed.some(
            (comp) => comp.userId === session?.user.id && comp.completed,
        ),
    )
    const incompleteMaterials = materials.filter(
        (material) =>
            !material.completed.some(
                (comp) => comp.userId === session?.user.id && comp.completed,
            ),
    )
    return (
        <div className='space-y-3'>
            {incompleteMaterials.length === 0 ? (
                <div className='py-10 text-center text-2xl'>
                    No materials found
                </div>
            ) : (
                incompleteMaterials.map((material) => (
                    <MaterialCard
                        key={material.id}
                        material={material}
                        session={session!}
                    />
                ))
            )}
        </div>
    )
}
