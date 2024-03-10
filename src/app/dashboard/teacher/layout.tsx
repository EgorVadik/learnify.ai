import { TeacherSideNav } from '@/components/nav/teacher-side-nav'
import { PaddingWrapper } from '@/components/wrappers/padding-wrapper'
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
            <PaddingWrapper>{children}</PaddingWrapper>
        </div>
    )
}
