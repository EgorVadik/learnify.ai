import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { TodoClientWrapper } from './todo-client-wrapper'

export const TodosWrapper = async () => {
    const session = await getServerAuthSession()
    const todos = await prisma.todo.findMany({
        where: {
            userId: session?.user.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    const completedTodos = todos.filter((todo) => todo.completed)
    const currentTodos = todos.filter((todo) => !todo.completed)

    return (
        <TodoClientWrapper
            initialCompletedTodos={completedTodos}
            initialCurrentTodos={currentTodos}
            userId={session?.user.id!}
        />
    )
}
