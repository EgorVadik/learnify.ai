'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { removeUserFromCourse } from '@/actions/course'
import { toast } from 'sonner'
import { Icons } from '@/components/icons'
import { cn } from '@/lib/utils'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type RemoveMemberButtonProps = {
    userId: string
    courseAdminId: string
    courseId: string
    text?: string
    className?: string
}

export const RemoveMemberButton = ({
    userId,
    courseAdminId,
    courseId,
    text,
    className,
}: RemoveMemberButtonProps) => {
    const [loading, setLoading] = useState(false)

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    className={cn(
                        'px-0 py-0 text-xs text-red-primary',
                        className,
                    )}
                    variant={'link'}
                    disabled={userId === courseAdminId || loading}
                >
                    {loading && <Icons.Spinner />}
                    {text ?? 'Remove'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the user from the course.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            setLoading(true)
                            try {
                                const res = await removeUserFromCourse({
                                    courseId,
                                    userId,
                                })

                                if (!res.success) {
                                    return toast.error(res.error)
                                }

                                toast.success('User removed from course')
                            } catch (error) {
                                toast.error('Failed to remove user from course')
                            } finally {
                                setLoading(false)
                            }
                        }}
                    >
                        Remove
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
