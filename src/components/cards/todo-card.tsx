import { Icons } from '../icons'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Trash2 } from 'lucide-react'
import { Todo } from '@prisma/client'
import { ToggleTodoStatusSchema } from '@/actions/user/schema'

type TodoCardProps = {
    todo: Todo
    toggleTodo: (
        data: ToggleTodoStatusSchema,
    ) => Promise<string | number | undefined>
    deleteTodo: (id: string) => Promise<string | number | undefined>
}

export const TodoCard = ({ todo, deleteTodo, toggleTodo }: TodoCardProps) => {
    return (
        <div className='flex items-center justify-between rounded-md bg-white px-3 py-2'>
            <div className='flex items-center gap-3'>
                <Button
                    variant={'link'}
                    size={'icon'}
                    onClick={() =>
                        toggleTodo({
                            id: todo.id,
                            completed: !todo.completed,
                        })
                    }
                >
                    {todo.completed ? (
                        <>
                            <span className='sr-only'>
                                Mark todo as incomplete
                            </span>
                            <Icons.CheckCircleFilled />
                        </>
                    ) : (
                        <>
                            <span className='sr-only'>
                                Mark todo as complete
                            </span>
                            <Icons.CheckCircle />
                        </>
                    )}
                </Button>
                <span
                    className={cn('text-sm', todo.completed && 'line-through')}
                >
                    {todo.title}
                </span>
            </div>

            <Button
                variant={'ghost'}
                size={'icon'}
                onClick={() => deleteTodo(todo.id)}
            >
                <span className='sr-only'>Delete todo</span>
                <Trash2 className='size-5 text-red-primary' />
            </Button>
        </div>
    )
}
