import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import React from 'react'
import { MaterialCard } from '../cards/material-card'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'

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
            createdAt: 'asc',
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
                        isComplete={false}
                    />
                ))
            )}

            {completedMaterials.length > 0 && (
                <Accordion type='single' collapsible>
                    <AccordionItem value='completed-items' className='border-0'>
                        <div className='flex w-full items-center gap-3.5'>
                            <AccordionTrigger className='w-fit items-center gap-3.5 border-0 text-gray-200'>
                                <span>Hidden</span>
                                <ChevronDown size={16} />
                            </AccordionTrigger>
                            <div className='h-px w-full grow bg-gray-200' />
                        </div>
                        <AccordionContent
                            contentClassName='data-[state=open]:overflow-visible'
                            className='space-y-3'
                        >
                            {completedMaterials.map((material) => (
                                <MaterialCard
                                    key={material.id}
                                    material={material}
                                    session={session!}
                                    isComplete={true}
                                />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            )}
        </div>
    )
}
