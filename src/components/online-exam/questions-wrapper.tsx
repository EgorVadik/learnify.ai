import { cn } from '@/lib/utils'
import { useDroppable } from '@dnd-kit/core'

export const QuestionsWrapper = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id: 'droppable',
    })

    return (
        <div
            className={cn(
                'flex flex-1 flex-col justify-between space-y-2 rounded-md border p-2',
                {
                    'border-green-500': isOver,
                },
            )}
            ref={setNodeRef}
        >
            {children}
        </div>
    )
}
