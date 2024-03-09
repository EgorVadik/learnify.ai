import { cn } from '@/lib/utils'
import { Folder } from '@/types'
import React from 'react'
import { Button } from '../ui/button'
import { FileIcon, Trash } from 'lucide-react'
import { useDrag } from 'react-dnd'
import { DeleteNotePopover } from '../popovers/delete-note-popover'
import { useSetAtom } from 'jotai'
import { currentFileAtom, markdownAtom } from '@/atoms'

type FileComponentProps = {
    folder: Folder
    pathname: string[]
}

export const FileComponent = ({
    folder: file,
    pathname,
}: FileComponentProps) => {
    const setMarkdown = useSetAtom(markdownAtom)
    const setCurrentFile = useSetAtom(currentFileAtom)
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: 'file',
        item: { id: file.id, title: file.title, parentId: file.parentId },
        collect(monitor) {
            return {
                isDragging: monitor.isDragging(),
            }
        },
    }))

    if (isDragging) return <div className='h-14' />

    return (
        <div
            ref={dragRef}
            className={cn(
                'px-1 py-1 duration-200 hover:bg-gray-100',
                pathname.at(-1) === file.id && 'bg-gray-100',
                isDragging && 'hidden',
            )}
        >
            <div className='flex justify-end'>
                <Button
                    // href={`/file/${file.id}`}
                    variant={'ghost'}
                    className='mr-auto block h-fit w-full grow p-0 hover:bg-transparent'
                    onClick={() => {
                        setMarkdown(file.content ?? '')
                        setCurrentFile(file.id)
                    }}
                >
                    <span className='flex items-center gap-1 truncate whitespace-nowrap'>
                        <FileIcon className='size-4' />
                        {file.title}
                    </span>
                </Button>
                <DeleteNotePopover id={file.id}>
                    <Button
                        variant={'destructive'}
                        size={'icon'}
                        className='size-6'
                    >
                        <Trash size={16} />
                    </Button>
                </DeleteNotePopover>
            </div>
        </div>
    )
}
