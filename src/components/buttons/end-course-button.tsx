'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { endCourse, removeUserFromCourse } from '@/actions/course'
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

type EndCourseButtonProps = {
    courseId: string
}

export const EndCourseButton = ({ courseId }: EndCourseButtonProps) => {
    const [loading, setLoading] = useState(false)

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    className={'px-0 py-0 text-xs text-red-primary'}
                    variant={'link'}
                    disabled={loading}
                >
                    {loading && <Icons.Spinner />}
                    {'End Course'}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will end the course for all users.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={async () => {
                            setLoading(true)
                            try {
                                const res = await endCourse(courseId)

                                if (!res.success) {
                                    return toast.error(res.error)
                                }

                                toast.success('Course ended successfully')
                            } catch (error) {
                                toast.error('Failed to end course')
                            } finally {
                                setLoading(false)
                            }
                        }}
                    >
                        End Course
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
