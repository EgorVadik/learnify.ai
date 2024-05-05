import { OptionalFileSchema } from '@/actions/course/schema'
import React from 'react'

type UseEditFilesOptions = {
    defaultFiles: OptionalFileSchema
}

export const useEditFiles = ({ defaultFiles }: UseEditFilesOptions) => {
    const [editedFiles, setEditedFiles] =
        React.useState<OptionalFileSchema>(defaultFiles)

    const removeFile = (url: string) => {
        setEditedFiles((files) => {
            if (files == null) return
            return files.filter((file) => file.url !== url)
        })
    }

    return {
        editedFiles,
        removeFile,
    }
}
