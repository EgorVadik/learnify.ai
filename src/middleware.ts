import { Role } from '@prisma/client'
import { getToken } from 'next-auth/jwt'
import { NO_NEED_AUTH_ROUTES } from '@/lib/constants'
import type { JWT } from 'next-auth'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
    const token = (await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET!,
    })) as JWT | null

    const { pathname } = req.nextUrl
    const user = token?.user
    const isAuthenticated = !!user
    const isAdmin = user?.role === Role.ADMIN
    const isStudent = user?.role === Role.STUDENT
    const isTeacher = user?.role === Role.TEACHER

    const isProtectedRoute = pathname.includes('/dashboard')
    const isStudentRoute = pathname.includes('/dashboard/student')
    const isTeacherRoute = pathname.includes('/dashboard/teacher')
    const isAdminRoute = pathname.includes('/dashboard/admin')

    // return NextResponse.next()

    if (
        (NO_NEED_AUTH_ROUTES.includes(pathname) || pathname === '/dashboard') &&
        isAuthenticated
    ) {
        switch (true) {
            case isAdmin:
                return NextResponse.redirect(
                    new URL('/dashboard/admin', req.url),
                )
            case isStudent:
                return NextResponse.redirect(
                    new URL('/dashboard/student', req.url),
                )
            case isTeacher:
                return NextResponse.redirect(
                    new URL('/dashboard/teacher', req.url),
                )

            default:
                return NextResponse.rewrite(new URL('/not-found', req.url), {
                    status: 404,
                })
        }
    }

    if (isProtectedRoute && !isAuthenticated) {
        return NextResponse.redirect(
            new URL(`/login?callbackUrl=${pathname}`, req.url),
        )
    }

    if (isProtectedRoute && isAuthenticated) {
        if (isStudent && isStudentRoute) {
            return NextResponse.next()
        }
        if (isTeacher && isTeacherRoute) {
            return NextResponse.next()
        }
        if (isAdmin && isAdminRoute) {
            return NextResponse.next()
        }

        return NextResponse.rewrite(new URL('/not-found', req.url), {
            status: 404,
        })
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
