import { getNotes } from '@/actions/notes'
import { NotesFolderStructure } from '@/components/tree-structure/notes-folder-structure'
import { getServerAuthSession } from '@/server/auth'
import type { Folder } from '@/types'
import React from 'react'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable'

export default async function NotesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerAuthSession()
    const notes = (await getNotes()) as Folder[]

    return (
        <ResizablePanelGroup direction='horizontal'>
            <ResizablePanel
                defaultSize={20}
                minSize={10}
                maxSize={80}
                collapsible
                collapsedSize={5}
            >
                <NotesFolderStructure folders={notes} session={session!} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
                defaultSize={80}
                className='flex h-dvh w-full items-center justify-center overflow-y-auto'
            >
                {children}
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}
