'use client'

import Ably from 'ably'
import { AblyProvider } from 'ably/react'

export const AblyProviderWrapper = ({
    children,
    // clientId,
}: {
    children: React.ReactNode
    clientId: string
}) => {
    const client = new Ably.Realtime.Promise({
        authUrl: '/api/ably/token',
        authMethod: 'POST',
        // clientId,
    })

    return <AblyProvider client={client}>{children}</AblyProvider>
}
