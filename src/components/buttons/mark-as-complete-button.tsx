import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { Icons } from '../icons'
import { toast } from 'sonner'
import { ReturnValue } from '@/types'

type MarkAsCompleteButtonProps = {
    onClick: () => Promise<ReturnValue>
    isComplete: boolean
}

export const MarkAsCompleteButton = ({
    isComplete,
    onClick,
}: MarkAsCompleteButtonProps) => {
    const [loading, setLoading] = useState(false)

    return (
        <Button
            size={'icon'}
            variant={'ghost'}
            className={cn(
                'size-8 rounded-[0.625rem] border-2 border-turq-600',
                {
                    'bg-turq-600': isComplete,
                },
            )}
            disabled={loading}
            onClick={async () => {
                setLoading(true)
                try {
                    const res = await onClick()
                    if (!res.success) return toast.error(res.error)
                    toast.success('Status updated successfully.')
                } catch (error) {
                    toast.error('Failed to update status. Please try again.')
                } finally {
                    setLoading(false)
                }
            }}
        >
            <span className='sr-only'>
                {isComplete ? 'Mark as incomplete' : 'Mark as complete'}
            </span>

            {loading ? (
                <Icons.Spinner className='animate-spin text-black' />
            ) : (
                isComplete && <Check className='h-4 w-4 text-white' />
            )}
        </Button>
    )
}
