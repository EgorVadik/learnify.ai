'use client'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { CreateCourseSchema, createCourseSchema } from '@/actions/course/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icons } from '../icons'
import { PlusCircle } from 'lucide-react'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { createCourse } from '@/actions/course'
import { toast } from 'sonner'

export const CreateCourseButton = () => {
    const form = useForm<CreateCourseSchema>({
        resolver: zodResolver(createCourseSchema),
        defaultValues: {
            name: '',
        },
    })
    const name = form.watch('name')

    const onSubmit = async (data: CreateCourseSchema) => {
        const res = await createCourse(data)
        if (!res.success) {
            return toast.error(res.error)
        }

        form.reset()
        toast.success('Course created!')
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'link'}
                    className='flex items-center gap-1 px-0 font-bold text-black-full'
                >
                    <span className='text-xl'>Create Course</span>
                    <PlusCircle />
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='flex flex-col gap-4'
                    >
                        <FormField
                            control={form.control}
                            name='name'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input
                                                {...field}
                                                className='peer focus-visible:ring-turq-600'
                                                data-is-empty={name === ''}
                                            />
                                            <FormLabel className='absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm duration-200 peer-focus-visible:-top-1 peer-focus-visible:left-2 peer-focus-visible:text-xs peer-data-[is-empty=false]:-top-1 peer-data-[is-empty=false]:left-2 peer-data-[is-empty=false]:text-xs'>
                                                Name
                                            </FormLabel>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type='submit'
                            disabled={form.formState.isSubmitting}
                            variant={'primary'}
                        >
                            {form.formState.isSubmitting && <Icons.Spinner />}
                            Create Course
                        </Button>
                    </form>
                </Form>
            </PopoverContent>
        </Popover>
    )
}
