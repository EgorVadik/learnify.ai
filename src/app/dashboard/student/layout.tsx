import type { Metadata } from 'next'
import { StudentSideNav } from '@/components/nav/student-side-nav'

export const metadata: Metadata = {
    title: 'Learnify.ai - Student',
    description: 'Learnify.ai',
}

export default function StudentLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className='relative flex min-h-screen items-stretch bg-white'>
            <StudentSideNav />
            <div className='flex w-full items-stretch'>{children}</div>
        </div>
    )
}
