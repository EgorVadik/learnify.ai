import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { TodoClientWrapper } from './todo-client-wrapper'

export const TodosWrapper = async () => {
    const session = await getServerAuthSession()
    const todosAsync = prisma.todo.findMany({
        where: {
            userId: session?.user.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
    const todosOrderAsync = prisma.todoOrder.findUnique({
        where: {
            userId: session?.user.id,
        },
    })

    const [todos, todosOrder] = await Promise.all([todosAsync, todosOrderAsync])

    const orderedTodos = todos.sort((a, b) => {
        const aIndex = todosOrder?.order.indexOf(a.id) || -1
        const bIndex = todosOrder?.order.indexOf(b.id) || -1

        if (aIndex === -1 || bIndex === -1) {
            return 0
        }

        return aIndex - bIndex
    })

    const completedTodos = orderedTodos.filter((todo) => todo.completed)
    const currentTodos = orderedTodos.filter((todo) => !todo.completed)

    return (
        <TodoClientWrapper
            initialCompletedTodos={completedTodos}
            initialCurrentTodos={currentTodos}
            userId={session?.user.id!}
        />
    )
}
