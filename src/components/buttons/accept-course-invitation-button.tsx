'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { updateCourseStatus } from '@/actions/course'
import { toast } from 'sonner'
import { Icons } from '../icons'

export const AcceptCourseInvitationButton = ({
    courseId,
}: {
    courseId: string
}) => {
    const [loading, setLoading] = useState(false)

    return (
        <Button
            variant={'primary'}
            onClick={async () => {
                setLoading(true)
                try {
                    const res = await updateCourseStatus({
                        courseId,
                        status: 'ACCEPTED',
                    })

                    if (!res.success) return toast.error(res.error)
                    toast.success('Course invitation accepted')
                } catch (error) {
                    toast.error('Failed to accept course invitation')
                } finally {
                    setLoading(false)
                }
            }}
            disabled={loading}
        >
            {loading && <Icons.Spinner />}
            <span className='text-xl font-bold'>Accept</span>
        </Button>
    )
}
