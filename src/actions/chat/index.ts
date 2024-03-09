'use server'

import { getServerAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import {
    type InitializeCourseChatSchema,
    initializeCourseChatSchema,
} from './schema'
import { ReturnValue } from '@/types'
import { getErrorMessage } from '@/lib/utils'

export const initializeCourseChat = async ({
    courseId,
}: InitializeCourseChatSchema): Promise<ReturnValue> => {
    try {
        const validData = initializeCourseChatSchema.parse({ courseId })

        const session = await getServerAuthSession()
        if (!session) {
            return {
                success: false,
                error: 'Not authenticated',
            }
        }

        await prisma.chat.create({
            data: {
                courseId: validData.courseId,
                users: {
                    connect: {
                        id: session.user.id,
                    },
                },
            },
        })

        return {
            success: true,
        }
    } catch (error) {
        return {
            success: false,
            error: getErrorMessage(error, {
                P2002: 'Chat already exists for this course.',
            }),
        }
    }
}
