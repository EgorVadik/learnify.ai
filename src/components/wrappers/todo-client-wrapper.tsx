'use client'

import { useTodos } from '@/hooks/use-todos'
import type { Todo } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { MinusCircle, PlusCircle } from 'lucide-react'
import { TodoCard } from '@/components/cards/todo-card'
import { useForm } from 'react-hook-form'
import { type CreateTodoSchema, createTodoSchema } from '@/actions/user/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'

type TodoClientWrapperProps = {
    initialCompletedTodos: Todo[]
    initialCurrentTodos: Todo[]
    userId: string
}

export const TodoClientWrapper = ({
    initialCompletedTodos,
    initialCurrentTodos,
    userId,
}: TodoClientWrapperProps) => {
    const {
        completedTodos,
        currentTodos,
        isCreating,
        deleteTodo,
        toggleCreating,
        toggleTodo,
        addTodo,
    } = useTodos({
        initialCompletedTodos,
        initialCurrentTodos,
    })

    const form = useForm<CreateTodoSchema>({
        resolver: zodResolver(createTodoSchema),
        defaultValues: {
            title: '',
        },
    })

    const onSubmit = form.handleSubmit(async (data) => {
        const res = await addTodo({
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            title: data.title,
            userId,
            id: crypto.randomUUID(),
        })

        if (res != null) return

        form.reset()
        toggleCreating()
    })

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-2'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-[1.375rem]'>Current</h3>
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        onClick={toggleCreating}
                    >
                        {isCreating ? (
                            <>
                                <span className='sr-only'>Cancel</span>
                                <MinusCircle />
                            </>
                        ) : (
                            <>
                                <span className='sr-only'>Add todo</span>
                                <PlusCircle />
                            </>
                        )}
                    </Button>
                </div>
                <div className='flex flex-col gap-1'>
                    {!isCreating && currentTodos.length === 0 ? (
                        <div>No active todos yet.</div>
                    ) : (
                        <>
                            {isCreating && (
                                <Form {...form}>
                                    <form
                                        onSubmit={onSubmit}
                                        className='flex w-full items-start gap-3'
                                    >
                                        <FormField
                                            control={form.control}
                                            name='title'
                                            render={({ field }) => (
                                                <FormItem className='w-full'>
                                                    <FormControl>
                                                        <Input
                                                            placeholder='Enter a title for your todo'
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button
                                            type='submit'
                                            variant={'primary'}
                                            disabled={
                                                form.formState.isSubmitting
                                            }
                                        >
                                            {form.formState.isSubmitting && (
                                                <Icons.Spinner />
                                            )}
                                            <span className='font-bold'>
                                                Create
                                            </span>
                                        </Button>
                                    </form>
                                </Form>
                            )}
                            {currentTodos.map((todo) => (
                                <TodoCard
                                    key={todo.id}
                                    todo={todo}
                                    deleteTodo={deleteTodo}
                                    toggleTodo={toggleTodo}
                                />
                            ))}
                        </>
                    )}
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                <h3 className='text-[1.375rem]'>Done</h3>
                <div className='flex flex-col gap-1'>
                    {completedTodos.length === 0 ? (
                        <div>No completed todos yet.</div>
                    ) : (
                        completedTodos.map((todo) => (
                            <TodoCard
                                key={todo.id}
                                todo={todo}
                                deleteTodo={deleteTodo}
                                toggleTodo={toggleTodo}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
