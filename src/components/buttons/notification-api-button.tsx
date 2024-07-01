'use client'

import { cn } from '@/lib/utils'
import 'notificationapi-js-client-sdk/dist/styles.css'
import {
    MarkAsReadModes,
    PopupPosition,
} from 'notificationapi-js-client-sdk/lib/interfaces'
import { memo, useEffect } from 'react'
import { buttonVariants } from '../ui/button'

export const NotificationAPIButton = memo(({ userId }: { userId: string }) => {
    useEffect(() => {
        const loadNotificationAPI = async () => {
            const NotificationAPI = (
                await import('notificationapi-js-client-sdk')
            ).default
            const notificationapi = new NotificationAPI({
                clientId: process.env.NEXT_PUBLIC_NOTIFICATION_API_CLIENT_ID!,
                userId,
            })
            notificationapi.showInApp({
                root: 'CONTAINER_DIV_ID',
                markAsReadMode: MarkAsReadModes.AUTOMATIC,
                paginated: true,
                pageSize: 5,
                popupPosition: PopupPosition.BottomLeft,
            })
        }

        // Call the async function
        loadNotificationAPI()
    }, [userId])

    return (
        <div
            id='CONTAINER_DIV_ID'
            tabIndex={0}
            className={cn(
                buttonVariants({
                    size: 'icon',
                    variant: 'ghost',
                }),
                '*:relative *:z-[99999999] hover:bg-gray-100 [&_.notificationapi-notification-imageContainer]:hidden [&_.notificationapi-popup]:w-full [&_.notificationapi-popup]:min-w-80 [&_.notificationapi-popup]:max-w-xs',
            )}
        />
    )
})

NotificationAPIButton.displayName = 'NotificationAPIButton'
