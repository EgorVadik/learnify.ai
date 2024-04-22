'use client'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Loader2, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import { deleteFile } from '@/actions/notes'
import { usePathname, useRouter } from 'next/navigation'

export const DeleteNotePopover = ({
    id,
    children,
}: {
    id: string
    children: React.ReactNode
}) => {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent align='start'>
                <Button
                    disabled={loading}
                    onClick={async () => {
                        setLoading(true)
                        try {
                            const res = await deleteFile(id)
                            if (!res.success) {
                                toast.error(res.error)
                                return
                            }

                            if (pathname.includes(id)) {
                                router.replace('/dashboard/student/notes')
                            }

                            toast.success('File deleted')
                        } catch (error) {
                            toast.error('Something went wrong')
                        } finally {
                            setLoading(false)
                        }
                    }}
                    className='flex w-full items-center gap-1'
                    variant={'destructive'}
                >
                    {loading && <Loader2 className='animate-spin' />}
                    <Trash /> Delete
                </Button>
            </PopoverContent>
        </Popover>
    )
}
