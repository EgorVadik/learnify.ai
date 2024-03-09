'use server'

import { getErrorMessage, isMongoId } from '@/lib/utils'
import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { ReturnValue } from '@/types'
import {
    type FileSchema,
    type MoveFileSchema,
    type SaveNoteSchema,
    moveFileSchema,
    fileSchema,
    saveNoteSchema,
} from './schema'
import { revalidateTag, unstable_cache } from 'next/cache'
import { nestedChildrenLoop } from '@/lib/constants'
import { z } from 'zod'

export const getNotes = unstable_cache(
    async () => {
        const session = await getServerAuthSession()
        if (!session) return []

        const notes = await prisma.note.findMany({
            where: {
                userId: session.user.id,
            },
            include: {
                ...nestedChildrenLoop(20),
            },
        })

        return notes
    },
    ['user-notes'],
    {
        tags: ['user-notes'],
    },
)

export const createNewFolder = async (
    data: FileSchema,
): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (!session) return { success: false, error: 'Not authenticated' }

        const { parentId, title } = fileSchema.parse(data)

        await prisma.note.create({
            data: {
                title,
                userId: session.user.id,
                parentId,
            },
        })

        revalidateTag('user-notes')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}

export const createNewFile = async (data: FileSchema): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (!session) return { success: false, error: 'Not authenticated' }

        const { parentId, title } = fileSchema.parse(data)

        await prisma.note.create({
            data: {
                title,
                userId: session.user.id,
                isFolder: false,
                parentId,
            },
        })

        revalidateTag('user-notes')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}

export const moveFile = async (data: MoveFileSchema): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (!session) return { success: false, error: 'Not authenticated' }

        const { id, parentId } = moveFileSchema.parse(data)

        await prisma.note.update({
            where: {
                id,
            },
            data: {
                parentId,
            },
        })

        revalidateTag('user-notes')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}

export const deleteFile = async (id: string): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (!session) return { success: false, error: 'Not authenticated' }

        const idSchema = z.string().refine(isMongoId, {
            message: 'Invalid id provided',
        })

        const validId = idSchema.parse(id)

        const note = await prisma.note.findUnique({
            where: {
                id: validId,
            },
            include: {
                ...nestedChildrenLoop(20),
            },
        })

        if (!note) return { success: false, error: 'Note not found' }

        if (note.isFolder) {
            const deleteFolderAndChildren = async (noteId: string) => {
                const folder = await prisma.note.findUnique({
                    where: { id: noteId },
                    include: { children: true },
                })

                if (!folder) return

                for (const child of folder.children) {
                    await deleteFolderAndChildren(child.id)
                }

                await prisma.note.delete({
                    where: { id: noteId },
                })
            }

            await deleteFolderAndChildren(id)
        } else {
            await prisma.note.delete({
                where: {
                    id: validId,
                },
            })
        }

        revalidateTag('user-notes')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}

export const saveNote = async (data: SaveNoteSchema) => {
    try {
        const session = await getServerAuthSession()
        if (!session) return { success: false, error: 'Not authenticated' }

        const { id, content } = saveNoteSchema.parse(data)

        await prisma.note.update({
            where: {
                id,
                isFolder: false,
                userId: session.user.id,
            },
            data: {
                content,
            },
        })

        revalidateTag('user-notes')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error),
        }
    }
}
