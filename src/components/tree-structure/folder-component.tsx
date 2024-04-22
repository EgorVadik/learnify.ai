import React from 'react'
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
    ChevronRight,
    FilePlus,
    FolderIcon,
    FolderPlus,
    Trash,
} from 'lucide-react'
import { toast } from 'sonner'
import { FolderAccordion } from './folder-accordion'
import { Folder } from '@/types'
import { useDrag, useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { moveFile } from '@/actions/notes'
import { NewNotePopover } from '@/components/popovers/new-note-popover'
import { DeleteNotePopover } from '@/components/popovers/delete-note-popover'

type FolderComponentProps = {
    folder: Folder
    userId: string
}

export const FolderComponent = ({ folder, userId }: FolderComponentProps) => {
    const [{ canDrop, isOver }, dropRef] = useDrop(() => ({
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
            if (item.parentId === folder.id) return

            const res = await moveFile({
                id: item.id,
                parentId: folder.id,
            })

            if (!res.success) {
                toast.error(res.error)
                return
            }
        },
        collect(monitor) {
            return {
                isOver: monitor.isOver(),
                canDrop: monitor.canDrop(),
            }
        },
    }))

    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: 'folder',
        item: { id: folder.id, title: folder.title, parentId: folder.parentId },
        collect(monitor) {
            return {
                isDragging: monitor.isDragging(),
            }
        },
    }))

    return (
        <div ref={dropRef}>
            <div ref={dragRef} className={cn(isDragging && 'hidden')}>
                <AccordionItem
                    value={folder.id}
                    className='border-l border-l-transparent duration-100 hover:border-gray-100'
                >
                    <div
                        className={cn(
                            'group flex items-center justify-between gap-2 px-1',
                            canDrop &&
                                isOver &&
                                'cursor-none bg-gray-100 duration-200',
                        )}
                    >
                        <AccordionTrigger className='group min-w-0 max-w-fit gap-1 truncate px-0 py-1'>
                            <ChevronRight className='size-4 duration-200 group-data-[state=open]:rotate-90' />
                            <FolderIcon className='size-4' />
                            <span className='block min-w-0 truncate'>
                                {folder.title}
                            </span>
                        </AccordionTrigger>
                        <div className='flex items-center gap-0'>
                            <NewNotePopover parentId={folder.id}>
                                <Button
                                    variant={'ghost'}
                                    size={'icon'}
                                    className='size-6 p-0'
                                >
                                    <FilePlus className='size-4' />
                                </Button>
                            </NewNotePopover>
                            <NewNotePopover parentId={folder.id} folder>
                                <Button
                                    variant={'ghost'}
                                    size={'icon'}
                                    className='size-6 p-0'
                                >
                                    <FolderPlus className='size-4' />
                                </Button>
                            </NewNotePopover>
                            <DeleteNotePopover id={folder.id}>
                                <Button
                                    variant={'destructive'}
                                    size={'icon'}
                                    className='size-6 p-0'
                                >
                                    <Trash className='size-4' />
                                </Button>
                            </DeleteNotePopover>
                        </div>
                    </div>
                    <AccordionContent className={'p-0 pl-5'}>
                        {folder.children?.map((folder) => (
                            <FolderAccordion
                                key={folder.id}
                                folder={folder}
                                userId={userId}
                            />
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </div>
        </div>
    )
}
