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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Icons } from '@/components/icons'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'
import { TimeInputWrapper } from '@/components/date-time/time-input-wrapper'
import { useMounted } from '@/hooks/use-mounted'
import {
    type CreateExamSchema,
    type QuestionsSchema,
    createExamSchema,
} from '@/actions/exam/schema'
import { createExam, editExam } from '@/actions/exam'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Question } from '@/types'

type ExamDetailsFormProps = {
    courseId: string
    questions: QuestionsSchema
    setEditingQuestions: (questions: boolean) => void
    setQuestions: (questions: Question[]) => void
    defaultValues?: Omit<CreateExamSchema, 'courseId'>
    examId?: string
}

export const ExamDetailsForm = ({
    courseId,
    questions,
    setEditingQuestions,
    setQuestions,
    defaultValues,
    examId,
}: ExamDetailsFormProps) => {
    const router = useRouter()
    const { mounted } = useMounted()
    const form = useForm<CreateExamSchema>({
        resolver: zodResolver(createExamSchema),
        defaultValues: {
            courseId,
            content: defaultValues?.content ?? '',
            title: defaultValues?.title ?? '',
            startDate: defaultValues?.startDate ?? new Date(),
            endDate: defaultValues?.endDate ?? new Date(),
        },
    })

    const handleCreate = async (data: CreateExamSchema) => {
        const res = await createExam(data, questions)
        if (!res.success) return toast.error(res.error)

        toast.success('Exam created successfully')
        router.replace(`/dashboard/teacher/courses/${courseId}`)
        router.refresh()
        setQuestions([])
    }

    const handleEdit = async (data: CreateExamSchema) => {
        const res = await editExam(data, questions, examId!)
        if (!res.success) return toast.error(res.error)

        toast.success('Exam updated successfully')
        router.replace(`/dashboard/teacher/courses/${courseId}`)
        router.refresh()
        setQuestions([])
    }

    const onSubmit = form.handleSubmit(async (data) => {
        if (examId != null && defaultValues != null) {
            return await handleEdit(data)
        }

        await handleCreate(data)
    })

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className='space-y-2'>
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

                {mounted && (
                    <>
                        <FormField
                            control={form.control}
                            name='startDate'
                            render={({ field }) => (
                                <FormItem className='flex flex-col items-start'>
                                    <div className='flex w-full flex-col items-start sm:flex-row sm:items-center sm:gap-2'>
                                        <FormLabel className='shrink-0 text-lg'>
                                            Start Date:
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
                                                            <span>
                                                                Pick a date
                                                            </span>
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
                                                        day_today:
                                                            'bg-transparent',
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
                        <FormField
                            control={form.control}
                            name='endDate'
                            render={({ field }) => (
                                <FormItem className='flex flex-col items-start'>
                                    <div className='flex w-full flex-col items-start sm:flex-row sm:items-center sm:gap-2'>
                                        <FormLabel className='shrink-0 text-lg'>
                                            End Date:
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
                                                            <span>
                                                                Pick a date
                                                            </span>
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
                                                        day_today:
                                                            'bg-transparent',
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
                    </>
                )}

                <div className='flex flex-col items-end justify-end gap-4 pt-7 sm:flex-row'>
                    <Button
                        type='button'
                        variant={'outline'}
                        className='px-7 max-sm:w-full'
                        onClick={() => setEditingQuestions(true)}
                    >
                        <span className='text-lg font-bold'>Back</span>
                    </Button>

                    <Button
                        type='submit'
                        variant={'primary'}
                        className='px-7 max-sm:w-full'
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting && <Icons.Spinner />}
                        <span className='text-lg font-bold text-blue-100'>
                            Save
                        </span>
                    </Button>
                </div>
            </form>
        </Form>
    )
}
