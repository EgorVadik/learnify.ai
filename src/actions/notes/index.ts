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
import { revalidatePath } from 'next/cache'
import { nestedChildrenLoop } from '@/lib/constants'
import { z } from 'zod'
import { backendClient } from '@/lib/edgestore-server'

const URL_REGEX =
    /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/g

export const getNotes = async () => {
    const session = await getServerAuthSession()
    if (!session || session.user.role !== 'STUDENT') return []

    const student = await prisma.student.findUnique({
        where: {
            userId: session.user.id,
        },
    })

    if (!student) return { success: false, error: 'Student not found' }

    const notes = await prisma.note.findMany({
        where: {
            studentId: student.id,
        },
        include: {
            ...nestedChildrenLoop(20),
        },
    })

    return notes
}

export const createNewFolder = async (
    data: FileSchema,
): Promise<ReturnValue> => {
    try {
        const session = await getServerAuthSession()
        if (!session || session.user.role !== 'STUDENT')
            return { success: false, error: 'Not authenticated' }

        const { parentId, title } = fileSchema.parse(data)

        const student = await prisma.student.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (!student) return { success: false, error: 'Student not found' }

        await prisma.note.create({
            data: {
                title,
                studentId: student.id,
                parentId,
            },
        })

        revalidatePath('/dashboard/student/notes')

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
        if (!session || session.user.role !== 'STUDENT')
            return { success: false, error: 'Not authenticated' }

        const { parentId, title } = fileSchema.parse(data)

        const student = await prisma.student.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (!student) return { success: false, error: 'Student not found' }

        await prisma.note.create({
            data: {
                title,
                studentId: student.id,
                isFolder: false,
                parentId,
            },
        })

        revalidatePath('/dashboard/student/notes')

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
        if (!session || session.user.role !== 'STUDENT')
            return { success: false, error: 'Not authenticated' }

        const { id, parentId } = moveFileSchema.parse(data)

        const student = await prisma.student.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (!student) return { success: false, error: 'Student not found' }

        await prisma.note.update({
            where: {
                id,
            },
            data: {
                parentId,
            },
        })

        revalidatePath('/dashboard/student/notes')

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
        if (!session || session.user.role !== 'STUDENT')
            return { success: false, error: 'Not authenticated' }

        const idSchema = z.string().refine(isMongoId, {
            message: 'Invalid id provided',
        })

        const validId = idSchema.parse(id)

        const student = await prisma.student.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (!student) return { success: false, error: 'Student not found' }

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

                if (!folder.isFolder) {
                    const urls = folder.content?.match(URL_REGEX)
                    if (urls != null && urls.length > 0) {
                        for (const url of urls) {
                            if (url.includes('files.edgestore.dev'))
                                await backendClient.notes.deleteFile({
                                    url,
                                })
                        }
                    }
                }

                await prisma.note.delete({
                    where: { id: noteId },
                })
            }

            await deleteFolderAndChildren(id)
        } else {
            const urls = note.content?.match(URL_REGEX)
            if (urls != null && urls.length > 0) {
                for (const url of urls) {
                    if (url.includes('files.edgestore.dev'))
                        await backendClient.notes.deleteFile({
                            url,
                        })
                }
            }
            await prisma.note.delete({
                where: {
                    id: validId,
                },
            })
        }

        revalidatePath('/dashboard/student/notes')

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
        if (!session || session.user.role !== 'STUDENT')
            return { success: false, error: 'Not authenticated' }

        const { id, content } = saveNoteSchema.parse(data)

        const student = await prisma.student.findUnique({
            where: {
                userId: session.user.id,
            },
        })

        if (!student) return { success: false, error: 'Student not found' }

        await prisma.note.update({
            where: {
                id,
                isFolder: false,
                studentId: student.id,
            },
            data: {
                content,
            },
        })

        revalidatePath('/dashboard/student/notes')

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2025: 'You do not have permission to edit this note',
            }),
        }
    }
}
