'use client'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { type FileSchema, fileSchema } from '@/actions/notes/schema'
import { createNewFile, createNewFolder } from '@/actions/notes'

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'

export const NewNotePopover = ({
    children,
    folder = false,
    parentId,
}: {
    children: React.ReactNode
    folder?: boolean
    parentId: string | null
}) => {
    const [open, setOpen] = useState(false)
    const form = useForm<FileSchema>({
        resolver: zodResolver(fileSchema),
        defaultValues: {
            title: '',
            parentId: null,
        },
    })

    const onSubmit = form.handleSubmit(async (data) => {
        try {
            if (!folder) {
                const res = await createNewFile({
                    title: data.title,
                    parentId,
                })
                if (!res.success) {
                    toast.error(res.error)
                    return
                }

                return
            }

            const res = await createNewFolder({
                title: data.title,
                parentId,
            })
            if (!res.success) {
                toast.error(res.error)
                return
            }

            setOpen(false)
        } catch (error) {
            toast.error('Something went wrong')
        }
    })

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent align='start'>
                <Form {...form}>
                    <form onSubmit={onSubmit} className='flex flex-col gap-2'>
                        <FormField
                            control={form.control}
                            name='title'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {folder
                                            ? '📁 Folder Name'
                                            : '📄 File Name'}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={
                                                folder
                                                    ? 'Enter a folder name'
                                                    : 'Enter a file name'
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            disabled={form.formState.isSubmitting}
                            className='flex items-center gap-2'
                        >
                            {form.formState.isSubmitting && (
                                <Loader2 className='animate-spin' />
                            )}
                            Create
                        </Button>
                    </form>
                </Form>
            </PopoverContent>
        </Popover>
    )
}
