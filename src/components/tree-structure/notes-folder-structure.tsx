'use client'

import { FolderAccordion } from '@/components/tree-structure/folder-accordion'
import { Folder } from '@/types'
import { Accordion } from '../ui/accordion'
import { Session } from 'next-auth'
import { ScrollArea } from '../ui/scroll-area'
import { useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { moveFile } from '@/actions/notes'
import { toast } from 'sonner'

type FolderWrapperProps = {
    folders: Folder[]
    session: Session
}

const groupBy = (xs: Folder[], key: 'parentId') => {
    return xs.reduce(
        (rv, x) => {
            const parentExists = xs.some((folder) => folder.id === x[key])
            const parentKey = parentExists ? x[key] ?? 'root' : 'root'
            ;(rv[parentKey] = rv[parentKey] || []).push(x)
            return rv
        },
        {} as Record<string, Folder[]>,
    )
}

export const NotesFolderStructure = ({
    folders,
    session,
}: FolderWrapperProps) => {
    const rootFolder = groupBy(folders, 'parentId')['root']

    const [, dropRef] = useDrop(() => ({
        accept: ['file', 'folder'],
        drop: async (
            item: {
                id: string
                name: string
                parentId: string
            },
            monitor,
        ) => {
            if (monitor.didDrop()) return
            if (item.parentId === null) return

            const res = await moveFile({
                id: item.id,
                parentId: null,
            })

            if (!res.success) {
                toast.error(res.error)
                return
            }
        },
    }))

    return (
        <Accordion
            type='multiple'
            className='sticky top-0 w-full max-w-xs grow px-3'
        >
            <ScrollArea
                className={cn('h-dvh flex-grow overflow-x-scroll border')}
                ref={dropRef}
            >
                {rootFolder?.map((folder) => (
                    <FolderAccordion
                        key={folder.id}
                        folder={folder}
                        userId={session.user.id}
                    />
                ))}
            </ScrollArea>
        </Accordion>
    )
}
