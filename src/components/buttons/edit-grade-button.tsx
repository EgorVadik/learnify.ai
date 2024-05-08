'use client'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Icons } from '@/components/icons'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { type EditGradeSchema, editGradeSchema } from '@/actions/exam/schema'
import { editAssignmentGrade, editExamGrade } from '@/actions/exam'
import { useRouter } from 'next/navigation'

type EditGradeButtonProps = {
    children: React.ReactNode
    isAssignment?: boolean
}

export const EditGradeButton = ({
    submissionId,
    grade,
    children,
    isAssignment = false,
}: EditGradeSchema & EditGradeButtonProps) => {
    const router = useRouter()
    const form = useForm<EditGradeSchema>({
        resolver: zodResolver(editGradeSchema),
        defaultValues: {
            grade,
            submissionId,
        },
    })

    const onSubmit = async (data: EditGradeSchema) => {
        if (isAssignment) {
            const res = await editAssignmentGrade(data)
            if (!res.success) {
                return toast.error(res.error)
            }
        } else {
            const res = await editExamGrade(data)
            if (!res.success) {
                return toast.error(res.error)
            }
        }

        toast.success('Grade updated successfully.')
        router.refresh()
    }

    return (
        <Popover>
            <PopoverTrigger>{children}</PopoverTrigger>
            <PopoverContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='flex flex-col gap-4'
                    >
                        <FormField
                            control={form.control}
                            name='grade'
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className='relative'>
                                            <Input
                                                className='peer focus-visible:ring-turq-600'
                                                {...field}
                                                onChange={(e) => {
                                                    const num = Number(
                                                        e.target.value,
                                                    )
                                                    if (
                                                        !isNaN(num) &&
                                                        num <= 100
                                                    )
                                                        field.onChange(num)
                                                }}
                                                data-is-empty={false}
                                            />
                                            <FormLabel className='absolute left-3 top-1/2 -translate-y-1/2 bg-white px-1 text-sm duration-200 peer-focus-visible:-top-1 peer-focus-visible:left-2 peer-focus-visible:text-xs peer-data-[is-empty=false]:-top-1 peer-data-[is-empty=false]:left-2 peer-data-[is-empty=false]:text-xs'>
                                                Grade
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
                            Edit Grade
                        </Button>
                    </form>
                </Form>
            </PopoverContent>
        </Popover>
    )
}
