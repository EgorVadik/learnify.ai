import { LandingNavbar } from '@/components/nav/landing-navbar'

export default function LandingLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            <LandingNavbar />
            {children}
        </>
    )
}
