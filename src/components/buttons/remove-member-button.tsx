'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { removeUserFromCourse } from '@/actions/course'
import { toast } from 'sonner'
import { Icons } from '@/components/icons'

type RemoveMemberButtonProps = {
    userId: string
    courseAdminId: string
    courseId: string
}

export const RemoveMemberButton = ({
    userId,
    courseAdminId,
    courseId,
}: RemoveMemberButtonProps) => {
    const [loading, setLoading] = useState(false)

    return (
        <Button
            className='px-0 py-0 text-xs text-red-primary'
            variant={'link'}
            disabled={userId === courseAdminId || loading}
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
            {loading && <Icons.Spinner />}
            Remove
        </Button>
    )
}
