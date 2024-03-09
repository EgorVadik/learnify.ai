import { z } from 'zod'
import { Role } from '@prisma/client'

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
})

export const registerSchema = z
    .object({
        email: z.string().email(),
        password: z.string().min(6).max(100),
        name: z.string().min(2).max(100),
        confirmPassword: z.string().min(6).max(100),
        role: z.enum([Role.STUDENT, Role.TEACHER]),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>

export const updateProfileSchema = z.object({
    image: z.string().url().optional(),
})

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>
