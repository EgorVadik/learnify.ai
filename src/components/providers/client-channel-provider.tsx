'use client'

import { ChannelProvider } from 'ably/react'

export const ClientChannelProvider = ({
    children,
    channelName,
}: {
    children: React.ReactNode
    channelName: string
}) => {
    return (
        <ChannelProvider channelName={channelName}>{children}</ChannelProvider>
    )
}
