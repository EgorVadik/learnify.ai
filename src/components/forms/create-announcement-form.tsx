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
    type CreateAnnouncementSchema,
    createAnnouncementSchema,
    OptionalFileSchema,
} from '@/actions/course/schema'
import {
    createCourseAnnouncement,
    editCourseAnnouncement,
} from '@/actions/course'
import { toast } from 'sonner'
import { Icons } from '@/components/icons'
import { MultiFileDropzone } from '@/components/uploads/multi-file-dropzone'
import { useMultiFileUpload } from '@/hooks/use-multi-file-upload'
import { EditFiles } from './edit-files'
import { EditFile } from '@/types'
import { useState } from 'react'

type CreateAnnouncementFormProps = {
    courseId: string
    defaultValues?: EditFile<CreateAnnouncementSchema>
    handleCancel?: () => void
    announcementId?: string
}

export const CreateAnnouncementForm = ({
    courseId,
    defaultValues,
    handleCancel,
    announcementId,
}: CreateAnnouncementFormProps) => {
    const [filesToDelete, setFilesToDelete] = useState<string[]>([])
    const {
        isUploading,
        files,
        fileStates,
        setFileStates,
        handleFilesAdded,
        setFiles,
    } = useMultiFileUpload({
        isOptional: true,
    })
    const form = useForm<CreateAnnouncementSchema>({
        resolver: zodResolver(createAnnouncementSchema),
        defaultValues: {
            courseId,
            content: defaultValues?.content ?? '',
            title: defaultValues?.title ?? '',
        },
    })

    const createAnnouncement = async (data: CreateAnnouncementSchema) => {
        const res = await createCourseAnnouncement({
            ...data,
            files,
        })
        if (!res.success) return toast.error(res.error)

        form.reset()
        setFiles(undefined)
        setFileStates([])
        toast.success('Announcement created successfully.')
    }

    const editAnnouncement = async (data: CreateAnnouncementSchema) => {
        const res = await editCourseAnnouncement(
            {
                ...data,
                files,
            },
            announcementId ?? '',
            filesToDelete,
        )
        if (!res.success) return toast.error(res.error)

        form.reset()
        setFiles(undefined)
        setFileStates([])
        toast.success('Announcement updated successfully.')
        handleCancel?.()
    }

    const onSubmit = form.handleSubmit(async (data) => {
        if (defaultValues == null && handleCancel == null) {
            return await createAnnouncement(data)
        }

        await editAnnouncement(data)
    })

    return (
        <Form {...form}>
            <form
                onSubmit={onSubmit}
                className='my-9 space-y-2 bg-blue-100 py-6 pl-6 pr-6 md:pl-28'
            >
                <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder='Title'
                                    className='h-fit rounded-none border-x-0 border-b border-t-0 border-black bg-transparent text-[2rem] text-black placeholder:text-black md:w-2/5'
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
                <div className='flex flex-col justify-between gap-4 pt-7 sm:flex-row sm:items-end sm:gap-2'>
                    <div className='flex flex-col-reverse gap-2'>
                        {defaultValues != null && handleCancel != null && (
                            <EditFiles
                                defaultFiles={defaultValues.files}
                                setFilesToDelete={setFilesToDelete}
                            />
                        )}
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
                            onFilesAdded={handleFilesAdded}
                        />
                    </div>
                    <div className='flex flex-col max-sm:w-full max-sm:space-y-4 sm:flex-row sm:space-x-2'>
                        {defaultValues != null && handleCancel != null && (
                            <Button
                                type='button'
                                variant={'outline'}
                                className='px-7 max-sm:w-full'
                                onClick={handleCancel}
                            >
                                <span className='text-lg font-bold'>
                                    Cancel
                                </span>
                            </Button>
                        )}
                        <Button
                            type='submit'
                            variant={'primary'}
                            className='px-7 max-sm:w-full'
                            disabled={
                                form.formState.isSubmitting || isUploading
                            }
                        >
                            {(form.formState.isSubmitting || isUploading) && (
                                <Icons.Spinner />
                            )}
                            <span className='text-lg font-bold text-blue-100'>
                                Send
                            </span>
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}
