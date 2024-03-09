'use client'
import { createEdgeStoreProvider } from '@edgestore/react'
import { EdgeStoreRouter } from './edgestore-server'

export const { EdgeStoreProvider, useEdgeStore } =
    createEdgeStoreProvider<EdgeStoreRouter>()
