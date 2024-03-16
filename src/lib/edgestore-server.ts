import { initEdgeStoreClient } from '@edgestore/server/core'
import { initEdgeStore } from '@edgestore/server'
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app'
import { getServerAuthSession } from '@/server/auth'

const es = initEdgeStore.create()
const edgeStoreRouter = es.router({
    documents: es
        .fileBucket({
            maxSize: 1024 * 1024 * 50, // 50MB
        })
        .beforeUpload(async () => {
            const session = await getServerAuthSession()
            return session !== null
        }),
    profileImages: es
        .imageBucket({
            maxSize: 1024 * 1024 * 4, // 4MB
            accept: ['image/jpeg', 'image/png'],
        })
        .beforeUpload(async () => {
            const session = await getServerAuthSession()
            return session !== null
        }),
})

export const handler = createEdgeStoreNextHandler({
    router: edgeStoreRouter,
})

export const backendClient = initEdgeStoreClient({
    router: edgeStoreRouter,
})

export type EdgeStoreRouter = typeof edgeStoreRouter
