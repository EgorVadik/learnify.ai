import { OptionalFileSchema } from '@/actions/course/schema'
import { useEditFiles } from '@/hooks/use-edit-files'
import React from 'react'
import { Button } from '../ui/button'
import { File, Trash2 } from 'lucide-react'

type EditFilesProps = {
    defaultFiles: OptionalFileSchema
    setFilesToDelete: React.Dispatch<React.SetStateAction<string[]>>
}

export const EditFiles = ({
    defaultFiles,
    setFilesToDelete,
}: EditFilesProps) => {
    const { editedFiles, removeFile } = useEditFiles({
        defaultFiles,
    })

    return editedFiles?.map((file) => (
        <div key={file.url} className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
                <File className='h-6 w-6 text-gray-400' />
                <span className='line-clamp-1 break-all'>{file.name}</span>
            </div>
            <Button
                className='shrink-0'
                variant={'destructive'}
                onClick={() => {
                    removeFile(file.url)
                    setFilesToDelete((filesToDelete) => [
                        ...filesToDelete,
                        file.url,
                    ])
                }}
                size={'icon'}
            >
                <Trash2 />
                <span className='sr-only'>Remove</span>
            </Button>
        </div>
    ))
}
