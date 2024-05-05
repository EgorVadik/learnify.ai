'use client'

import { OptionalFileSchema } from '@/actions/course/schema'
import { FileState } from '@/components/uploads/multi-file-dropzone'
import { useEdgeStore } from '@/lib/edgestore'
import { useState } from 'react'

type UseMultiFileUpload = {
    isOptional?: boolean
}

export const useMultiFileUpload = ({
    isOptional = false,
}: UseMultiFileUpload = {}) => {
    const [files, setFiles] = useState<OptionalFileSchema>(
        isOptional ? undefined : [],
    )
    const [fileStates, setFileStates] = useState<FileState[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const { edgestore } = useEdgeStore()

    function updateFileProgress(key: string, progress: FileState['progress']) {
        setFileStates((fileStates) => {
            const newFileStates = structuredClone(fileStates)
            const fileState = newFileStates.find(
                (fileState) => fileState.key === key,
            )
            if (fileState) {
                fileState.progress = progress
            }
            return newFileStates
        })
    }

    const handleFilesAdded = async (addedFiles: FileState[]) => {
        setIsUploading(true)
        setFileStates([...fileStates, ...addedFiles])
        await Promise.all(
            addedFiles.map(async (addedFileState) => {
                try {
                    const res = await edgestore.documents.upload({
                        file: addedFileState.file,
                        onProgressChange: async (progress) => {
                            updateFileProgress(addedFileState.key, progress)
                            if (progress === 100) {
                                updateFileProgress(
                                    addedFileState.key,
                                    'COMPLETE',
                                )
                            }
                        },
                    })
                    setFiles((files) => {
                        return [
                            ...(files ?? []),
                            {
                                name: addedFileState.file.name,
                                url: res.url,
                            },
                        ]
                    })
                } catch (err) {
                    updateFileProgress(addedFileState.key, 'ERROR')
                }
            }),
        )

        setIsUploading(false)
    }

    return {
        files,
        fileStates,
        isUploading,
        handleFilesAdded,
        setFileStates,
        setFiles,
    }
}
