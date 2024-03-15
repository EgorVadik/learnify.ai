import { Editor } from '@/components/editor/editor'
import { NotesFolderStructure } from '@/components/tree-structure/notes-folder-structure'
import { getNotes } from '@/actions/notes'
import { Folder } from '@/types'
import { getServerAuthSession } from '@/server/auth'

export default async function page() {
    const session = await getServerAuthSession()
    const notes = (await getNotes()) as Folder[]

    return (
        <div className='flex items-stretch'>
            <NotesFolderStructure folders={notes} session={session!} />
            <Editor />
        </div>
    )
}
