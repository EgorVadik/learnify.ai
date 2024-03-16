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
import { Textarea } from '@/components/ui/textarea'
import {
    type CreateAnnouncementSchema,
    createAnnouncementSchema,
} from '@/actions/course/schema'
import { useEffect, useRef } from 'react'
import { createCourseAnnouncement } from '@/actions/course'
import { toast } from 'sonner'
import { Icons } from '../icons'

type CreateAnnouncementFormProps = {
    courseId: string
}

export const CreateAnnouncementForm = ({
    courseId,
}: CreateAnnouncementFormProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const form = useForm<CreateAnnouncementSchema>({
        resolver: zodResolver(createAnnouncementSchema),
        defaultValues: {
            courseId,
            content: '',
            title: '',
        },
    })

    const content = form.watch('content')

    useEffect(() => {
        if (content.trim() === '') return

        const textarea = textareaRef.current
        if (textarea == null) return
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
    }, [content])

    const onSubmit = form.handleSubmit(async (data) => {
        const res = await createCourseAnnouncement(data)
        if (!res.success) return toast.error(res.error)

        form.reset()
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
                                <Textarea
                                    placeholder='Details'
                                    className='h-10 max-h-40 min-h-10 resize-none rounded-none border-x-0 border-b border-t-0 border-black bg-transparent text-lg text-black placeholder:text-black'
                                    {...field}
                                    ref={textareaRef}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className='m flex items-end justify-end pt-7'>
                    <Button
                        type='submit'
                        variant={'primary'}
                        className='px-7'
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting && <Icons.Spinner />}
                        <span className='text-lg font-bold text-blue-100'>
                            Send
                        </span>
                    </Button>
                </div>
            </form>
        </Form>
    )
}
