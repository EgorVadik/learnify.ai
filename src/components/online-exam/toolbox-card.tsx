'use client'

import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { CSS } from '@dnd-kit/utilities'
import type { QuestionType } from '@prisma/client'

type ToolboxCardProps = {
    type: QuestionType
    title: string
    icon: JSX.Element
}

export const ToolboxCard = ({ type, title, icon }: ToolboxCardProps) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
        useDraggable({
            id: type,
        })
    const style = transform
        ? {
              transform: CSS.Translate.toString(transform),
          }
        : undefined

    return (
        <button
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={cn(
                'flex w-full cursor-grab items-center gap-2 rounded-sm border border-dashed px-4 py-2',
                {
                    'z-[9999]': isDragging,
                },
            )}
        >
            {icon}
            {title}
        </button>
    )
}
