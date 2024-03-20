'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    type UploadMaterialSchema,
    uploadMaterialSchema,
    FilesSchema,
} from '@/actions/course/schema'
import { useState } from 'react'
import { toast } from 'sonner'
import { Icons } from '../icons'
import { FileState, MultiFileDropzone } from '../uploads/multi-file-dropzone'
import { useEdgeStore } from '@/lib/edgestore'
import { uploadCourseMaterial } from '@/actions/course'

type UploadMaterialFormProps = {
    courseId: string
}

export const UploadMaterialForm = ({ courseId }: UploadMaterialFormProps) => {
    const [files, setFiles] = useState<FilesSchema>([])
    const [fileStates, setFileStates] = useState<FileState[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const { edgestore } = useEdgeStore()
    const form = useForm<UploadMaterialSchema>({
        resolver: zodResolver(uploadMaterialSchema),
        defaultValues: {
            courseId,
            content: '',
            title: '',
        },
    })

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

    const onSubmit = form.handleSubmit(async (data) => {
        if (files.length === 0)
            return toast.error('You must upload at least 1 file.')
        if (files.length > 10)
            return toast.error('You can only upload up to 10 files.')

        const res = await uploadCourseMaterial({
            ...data,
            files,
        })
        if (!res.success) return toast.error(res.error)

        form.reset()
        setFileStates([])
        setFiles([])
        toast.success('Material uploaded successfully.')
    })

    return (
        <Form {...form}>
            <form
                onSubmit={onSubmit}
                className='my-9 space-y-2 bg-blue-100 py-6 pl-28 pr-6'
            >
                <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder='Title'
                                    className='h-fit w-2/5 rounded-none border-x-0 border-b border-t-0 border-black bg-transparent text-[2rem] text-black placeholder:text-black'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='content'
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder='Details'
                                    className='h-fit rounded-none border-x-0 border-b border-t-0 border-black bg-transparent text-lg text-black placeholder:text-black'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className='m flex items-end justify-between pt-7'>
                    <MultiFileDropzone
                        className='h-8 w-fit'
                        dropzoneOptions={{
                            maxSize: 1024 * 1024 * 50,
                            maxFiles: 10,
                        }}
                        value={fileStates}
                        onChange={(files) => {
                            setFileStates(files)
                        }}
                        onFilesAdded={async (addedFiles) => {
                            setIsUploading(true)
                            setFileStates([...fileStates, ...addedFiles])
                            await Promise.all(
                                addedFiles.map(async (addedFileState) => {
                                    try {
                                        const res =
                                            await edgestore.documents.upload({
                                                file: addedFileState.file,
                                                onProgressChange: async (
                                                    progress,
                                                ) => {
                                                    updateFileProgress(
                                                        addedFileState.key,
                                                        progress,
                                                    )
                                                    if (progress === 100) {
                                                        await new Promise(
                                                            (resolve) =>
                                                                setTimeout(
                                                                    resolve,
                                                                    500,
                                                                ),
                                                        )
                                                        updateFileProgress(
                                                            addedFileState.key,
                                                            'COMPLETE',
                                                        )
                                                    }
                                                },
                                            })
                                        setFiles((files) => [
                                            ...files,
                                            {
                                                name: addedFileState.file.name,
                                                url: res.url,
                                            },
                                        ])
                                    } catch (err) {
                                        updateFileProgress(
                                            addedFileState.key,
                                            'ERROR',
                                        )
                                    }
                                }),
                            )

                            setIsUploading(false)
                        }}
                    />
                    <Button
                        type='submit'
                        variant={'primary'}
                        className='px-7'
                        disabled={form.formState.isSubmitting || isUploading}
                    >
                        {(form.formState.isSubmitting || isUploading) && (
                            <Icons.Spinner />
                        )}
                        <span className='text-lg font-bold text-blue-100'>
                            Send
                        </span>
                    </Button>
                </div>
            </form>
        </Form>
    )
}
