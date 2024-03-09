import { TeacherSideNav } from '@/components/nav/teacher-side-nav'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Learnify.ai - Teacher',
    description: 'Learnify.ai',
}

export default function TeacherLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className='relative flex min-h-screen bg-white'>
            <TeacherSideNav />
            <div className='flex-1 p-10'>{children}</div>
        </div>
    )
}
