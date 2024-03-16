'use client'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
    type InviteUserToCourseSchema,
    inviteUserToCourseSchema,
} from '@/actions/course/schema'
import { PlusCircle } from 'lucide-react'
import { Icons } from '../icons'
import { inviteUserToCourse } from '@/actions/course'
import { toast } from 'sonner'

export const AddMemberCard = ({ courseId }: { courseId: string }) => {
    const form = useForm<InviteUserToCourseSchema>({
        resolver: zodResolver(inviteUserToCourseSchema),
        defaultValues: {
            courseId,
            email: '',
            role: 'STUDENT',
        },
    })

    const onSubmit = form.handleSubmit(async (data) => {
        const res = await inviteUserToCourse(data)
        if (!res.success) {
            return toast.error(res.error)
        }

        form.reset()
        toast.success(`Invited ${data.email} to the course.`)
    })

    return (
        <Form {...form}>
            <form onSubmit={onSubmit} className='flex flex-col gap-2 pt-2'>
                <FormField
                    control={form.control}
                    name='role'
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className='flex items-center gap-4'
                                >
                                    <FormItem className='flex items-center gap-1 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem
                                                turqCircle={false}
                                                value='STUDENT'
                                            />
                                        </FormControl>
                                        <FormLabel className='font-normal'>
                                            Student
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className='flex items-center gap-1 space-y-0'>
                                        <FormControl>
                                            <RadioGroupItem
                                                turqCircle={false}
                                                value='TEACHER'
                                            />
                                        </FormControl>
                                        <FormLabel className='font-normal'>
                                            Teacher
                                        </FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='flex w-full items-center justify-between gap-5'>
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem className='w-full'>
                                <FormControl>
                                    <Input
                                        type='email'
                                        placeholder='email@email.com'
                                        className='rounded-10 border-0 bg-[rgba(8,131,149,0.15)]'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type='submit'
                        size={'icon'}
                        variant={'ghost'}
                        disabled={form.formState.isSubmitting}
                    >
                        <span className='sr-only'>
                            {form.formState.isSubmitting
                                ? 'Adding member'
                                : 'Add member'}
                        </span>
                        {form.formState.isSubmitting ? (
                            <Icons.Spinner />
                        ) : (
                            <PlusCircle />
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
