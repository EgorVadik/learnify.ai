'use client'

import { Folder } from '@/types'
import { usePathname } from 'next/navigation'
import { FileComponent } from './file-component'
import { FolderComponent } from './folder-component'

type FolderAccordionProps = {
    folder: Folder
    userId: string
}

export const FolderAccordion = ({ folder, userId }: FolderAccordionProps) => {
    const pathname = usePathname().split('/')

    if (!folder.isFolder) {
        return <FileComponent folder={folder} pathname={pathname} />
    }

    return <FolderComponent folder={folder} userId={userId} />
}
