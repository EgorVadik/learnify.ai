import { CustomErrorMessages } from '@/types'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { EdgeStoreApiClientError } from '@edgestore/react/shared'
import { isSameDay, formatRelative } from 'date-fns'

const hexadecimal = /^(0x0h)?[0-9A-F]+$/i

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function isMongoId(val: string) {
    return val.length === 24 && hexadecimal.test(val)
}

export function getErrorMessage(
    error: unknown,
    messages: CustomErrorMessages = {
        P2002: 'This action has already been performed.',
        P2025: 'The information provided was not valid.',
        ZodError: undefined,
        Error: 'Something went wrong. Please try again.',
    },
) {
    if (error instanceof z.ZodError) {
        return (
            messages.ZodError ?? error.errors.map((e) => e.message).join(', ')
        )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
            return messages.P2002 as string
        }

        if (error.code === 'P2025') {
            return messages.P2025 as string
        }
    }

    if (error instanceof Error) {
        return error.message
    }

    return messages.Error as string
}

export function getUsernameFallback(name: string) {
    const fullName = name.split(' ')
    const firstName = fullName[0]
    const lastName = fullName.length > 1 ? fullName[1] : firstName.charAt(1)
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function getEdgeStoreErrorMessage(
    error: unknown,
    maxFileSize: number = 1024 * 1024 * 4,
) {
    if (error instanceof EdgeStoreApiClientError) {
        switch (error.data.code) {
            case 'FILE_TOO_LARGE':
                return `The file is too large. The maximum file size is ${maxFileSize / 1024 / 1024}MB.`
            case 'MIME_TYPE_NOT_ALLOWED':
                return 'The file type is not allowed.'
            case 'UPLOAD_NOT_ALLOWED':
                return 'You are not allowed to upload files.'
            case 'UNAUTHORIZED':
                return 'You must be logged in to upload files.'
            case 'SERVER_ERROR':
                return 'An error occurred while uploading the file.'
            case 'BAD_REQUEST':
                return 'Invalid request. Please try again.'
            case 'DELETE_NOT_ALLOWED':
                return 'You are not allowed to delete files.'
        }
    }

    return getErrorMessage(error)
}

export function formatDate(
    date: string | Date,
    options?: Intl.DateTimeFormatOptions,
) {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'short',
        ...options,
    }).format(new Date(date))
}

export function checkIfSameDay(date1: Date, date2: Date) {
    return isSameDay(date1, date2)
}

export function formatDateSeparator(date: Date) {
    return formatRelative(date, new Date())
}

export function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function pluralize(count: number, text: string) {
    return count === 1 ? text : `${text}s`
}

export function getDefaultTabView(view: string | undefined | null) {
    if (view == null) return 'announcements'
    if (view === 'announcements' || view === 'tasks' || view === 'material')
        return view

    return 'announcements'
}

export function getDefaultChatTabView(view: string | undefined | null) {
    if (view == null) return 'courses'
    if (view === 'courses' || view === 'private') return view

    return 'courses'
}
