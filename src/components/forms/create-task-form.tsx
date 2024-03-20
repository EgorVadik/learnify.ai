'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
    FormLabel,
} from '@/components/ui/form'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

import {
    type CreateTaskSchema,
    createTaskSchema,
    type OptionalFileSchema,
} from '@/actions/course/schema'
import { createCourseTask } from '@/actions/course'
import { toast } from 'sonner'
import { Icons } from '../icons'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'
import { TimeInputWrapper } from '../date-time/time-input-wrapper'
import { FileState, MultiFileDropzone } from '../uploads/multi-file-dropzone'
import { useEdgeStore } from '@/lib/edgestore'
import { useState } from 'react'
import Link from 'next/link'
import { useMounted } from '@/hooks/use-mounted'

type CreateTaskFormProps = {
    courseId: string
}

export const CreateTaskForm = ({ courseId }: CreateTaskFormProps) => {
    const [files, setFiles] = useState<OptionalFileSchema>(undefined)
    const [fileStates, setFileStates] = useState<FileState[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const { edgestore } = useEdgeStore()
    const { mounted } = useMounted()

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

    const form = useForm<CreateTaskSchema>({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
            courseId,
            content: '',
            title: '',
            dueDate: new Date(),
        },
    })

    const onSubmit = form.handleSubmit(async (data) => {
        if (files != null && files.length > 10)
            return toast.error('You can only upload up to 10 files.')

        const res = await createCourseTask({
            ...data,
            files:
                files != null
                    ? files.length === 0
                        ? undefined
                        : files
                    : undefined,
        })
        if (!res.success) return toast.error(res.error)

        form.reset()
        toast.success('Task created successfully.')
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

                {mounted && (
                    <FormField
                        control={form.control}
                        name='dueDate'
                        render={({ field }) => (
                            <FormItem className='flex flex-col items-start'>
                                <div className='flex w-full items-center gap-2'>
                                    <FormLabel className='shrink-0 text-lg'>
                                        Due Date:
                                    </FormLabel>
                                    <Popover>
                                        <PopoverTrigger
                                            asChild
                                            className='w-full'
                                        >
                                            <FormControl>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                        'h-fit rounded-none border-x-0 border-b border-t-0 border-black bg-transparent text-lg text-black placeholder:text-black',
                                                        !field.value &&
                                                            'text-muted-foreground',
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(
                                                            field.value,
                                                            'PPP HH:mm:ss',
                                                        )
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent
                                            className='w-auto p-0'
                                            align='start'
                                        >
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date <
                                                    subDays(new Date(), 1)
                                                }
                                                classNames={{
                                                    day_selected:
                                                        'border-2 border-turq-600 text-turq-600',
                                                    day_today: 'bg-transparent',
                                                }}
                                                initialFocus
                                                components={{
                                                    CaptionLabel(props) {
                                                        return (
                                                            <span>
                                                                {format(
                                                                    props.displayMonth,
                                                                    'MMMM yyyy',
                                                                )}
                                                            </span>
                                                        )
                                                    },
                                                }}
                                            />
                                            <div className='border-border border-t p-3'>
                                                <TimeInputWrapper
                                                    date={field.value}
                                                    setDate={field.onChange}
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <div className='flex items-end justify-between pt-7'>
                    <div className='flex flex-col gap-3.5'>
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
                                                await edgestore.documents.upload(
                                                    {
                                                        file: addedFileState.file,
                                                        onProgressChange:
                                                            async (
                                                                progress,
                                                            ) => {
                                                                updateFileProgress(
                                                                    addedFileState.key,
                                                                    progress,
                                                                )
                                                                if (
                                                                    progress ===
                                                                    100
                                                                ) {
                                                                    await new Promise(
                                                                        (
                                                                            resolve,
                                                                        ) =>
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
                                                    },
                                                )
                                            setFiles((files) => {
                                                if (!files) return
                                                return [
                                                    ...files,
                                                    {
                                                        name: addedFileState
                                                            .file.name,
                                                        url: res.url,
                                                    },
                                                ]
                                            })
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

                        <Link
                            href={`/dashboard/teacher/courses/${courseId}/create-online-task`}
                            className={buttonVariants({
                                variant: 'primary',
                            })}
                        >
                            <span className='text-lg font-bold text-blue-100'>
                                Create online task
                            </span>
                        </Link>
                    </div>
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
