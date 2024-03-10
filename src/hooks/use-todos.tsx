'use client'

import { useState } from 'react'
import type { Todo } from '@prisma/client'
import {
    createNewTodo,
    toggleTodoStatus,
    deleteTodo as deleteTodoAction,
} from '@/actions/user'
import { toast } from 'sonner'
import { ToggleTodoStatusSchema } from '@/actions/user/schema'

type UseTodosOptions = {
    initialCompletedTodos: Todo[]
    initialCurrentTodos: Todo[]
}

export const useTodos = ({
    initialCompletedTodos,
    initialCurrentTodos,
}: UseTodosOptions) => {
    const [completedTodos, setCompletedTodos] = useState<Todo[]>(
        initialCompletedTodos,
    )
    const [currentTodos, setCurrentTodos] =
        useState<Todo[]>(initialCurrentTodos)
    const [isCreating, setIsCreating] = useState(false)

    const toggleCreating = () => {
        setIsCreating((prev) => !prev)
    }

    const addTodo = async (todo: Todo) => {
        const prevValue = [...currentTodos]
        setCurrentTodos((prev) => [todo, ...prev])
        const res = await createNewTodo({
            title: todo.title,
        })

        if (!res.success) {
            setCurrentTodos(prevValue)
            return toast.error(res.error)
        }

        const newTodo = res.data
        setCurrentTodos((prev) => prev.filter((t) => t.id !== todo.id))
        setCurrentTodos((prev) => [newTodo, ...prev])

        toast.success('Todo created!')
    }

    const toggleTodo = async ({ id, completed }: ToggleTodoStatusSchema) => {
        const prevCompleted = [...completedTodos]
        const prevCurrent = [...currentTodos]

        if (!completed) {
            const todo = prevCompleted.find((todo) => todo.id === id)
            if (todo) {
                todo.completed = completed
                setCurrentTodos((prev) => [todo, ...prev])
                setCompletedTodos((prev) => prev.filter((t) => t.id !== id))
            }
        } else {
            const todo = prevCurrent.find((todo) => todo.id === id)
            if (todo) {
                todo.completed = completed
                setCompletedTodos((prev) => [todo, ...prev])
                setCurrentTodos((prev) => prev.filter((t) => t.id !== id))
            }
        }

        const res = await toggleTodoStatus({
            id,
            completed,
        })

        if (!res.success) {
            setCompletedTodos(prevCompleted)
            setCurrentTodos(prevCurrent)
            return toast.error(res.error)
        }

        toast.success('Todo updated!')
    }

    const deleteTodo = async (id: string) => {
        const prevValue = [...currentTodos]
        setCurrentTodos((prev) => prev.filter((todo) => todo.id !== id))
        const res = await deleteTodoAction(id)

        if (!res.success) {
            setCurrentTodos(prevValue)
            return toast.error(res.error)
        }

        toast.success('Todo deleted!')
    }

    return {
        completedTodos,
        currentTodos,
        isCreating,
        toggleCreating,
        addTodo,
        toggleTodo,
        deleteTodo,
    }
}
