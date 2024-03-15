import type { Metadata } from 'next'
import { StudentSideNav } from '@/components/nav/student-side-nav'
import { PaddingWrapper } from '@/components/wrappers/padding-wrapper'

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
        <div className='relative flex min-h-screen bg-white'>
            <StudentSideNav />
            <PaddingWrapper>{children}</PaddingWrapper>
        </div>
    )
}
