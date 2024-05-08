import { Header } from '@/components/nav/header'
import React from 'react'

export default function SubmissionsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header title='Submissions' />
            <main>{children}</main>
        </>
    )
}
