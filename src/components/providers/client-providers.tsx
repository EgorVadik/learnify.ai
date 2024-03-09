'use client'

import { EdgeStoreProvider } from '@/lib/edgestore'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export const ClientProviders = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const queryClient = new QueryClient()

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <EdgeStoreProvider>
                    <DndProvider backend={HTML5Backend}>{children}</DndProvider>
                </EdgeStoreProvider>
            </QueryClientProvider>
        </SessionProvider>
    )
}
