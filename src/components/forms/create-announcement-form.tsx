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
} from '@/actions/course/schema'
import { createCourseAnnouncement } from '@/actions/course'
import { toast } from 'sonner'
import { Icons } from '../icons'
import { MultiFileDropzone } from '../uploads/multi-file-dropzone'
import { useMultiFileUpload } from '@/hooks/use-multi-file-upload'

type CreateAnnouncementFormProps = {
    courseId: string
}

export const CreateAnnouncementForm = ({
    courseId,
}: CreateAnnouncementFormProps) => {
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
            content: '',
            title: '',
        },
    })

    const onSubmit = form.handleSubmit(async (data) => {
        const res = await createCourseAnnouncement({
            ...data,
            files,
        })
        if (!res.success) return toast.error(res.error)

        form.reset()
        setFiles(undefined)
        setFileStates([])
        toast.success('Announcement created successfully.')
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
                <div className='flex items-end justify-between pt-7'>
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
