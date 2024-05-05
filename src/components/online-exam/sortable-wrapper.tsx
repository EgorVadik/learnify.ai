import { useSortable } from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'
import { CSS } from '@dnd-kit/utilities'

export const SortableWrapper = ({
    children,
    id,
}: {
    children: React.ReactNode
    id: string
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({
            id,
        })
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className='flex flex-row-reverse gap-2'
        >
            {children}
            <div
                className='flex cursor-move items-center justify-center'
                {...listeners}
            >
                <span className='sr-only'>Move</span>
                <GripVertical />
            </div>
        </div>
    )
}
