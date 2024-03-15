'use client'

import { STUDENT_DASHBOARD_NAV, TEACHER_DASHBOARD_NAV } from '@/lib/constants'
import type { Session } from 'next-auth'
import { Logo } from '../logo'
import { SideNavItem } from './side-nav-item'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { LogoutButton } from '../buttons/logout-button'
import { cn, getUsernameFallback } from '@/lib/utils'
import { useState } from 'react'
import { useMediaQuery, useTimeout } from '@mantine/hooks'

type ClientSideNavProps = {
    session: Session
    navItems: typeof TEACHER_DASHBOARD_NAV | typeof STUDENT_DASHBOARD_NAV
    profileHref: '/dashboard/teacher/profile' | '/dashboard/student/profile'
}

export const ClientSideNav = ({
    session,
    navItems,
    profileHref,
}: ClientSideNavProps) => {
    const [isNavOpen, setIsNavOpen] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const matches = useMediaQuery('(max-width: 1280px)')
    const { start, clear } = useTimeout(() => {
        setIsAnimating(false)
    }, 500)

    return (
        <>
            <aside
                className={cn(
                    'w-0 min-w-0 max-w-sm shrink grow-0 bg-blue-100 duration-500 max-xl:overflow-hidden xl:w-full xl:shrink-0 xl:grow',
                    {
                        'fixed bottom-0 left-0 top-0 w-full':
                            matches && isNavOpen,
                    },
                    { fixed: matches && isAnimating && !isNavOpen },
                )}
            >
                <nav className='sticky top-0'>
                    <ul className='flex min-h-screen flex-col items-center justify-center'>
                        <li className='py-10'>
                            <Logo />
                        </li>
                        {navItems.map((navItem) => (
                            <SideNavItem
                                key={navItem.href + navItem.title}
                                href={navItem.href}
                                title={navItem.title}
                            />
                        ))}
                        <li className='mt-auto flex w-full flex-col gap-[0.625rem] px-20 py-8'>
                            <Avatar className='h-[4.5rem] w-[4.5rem]'>
                                <AvatarImage
                                    src={session?.user.image ?? undefined}
                                />
                                <AvatarFallback>
                                    {getUsernameFallback(session?.user.name!)}
                                </AvatarFallback>
                            </Avatar>
                            <span className='truncate text-2xl font-bold'>
                                {session?.user?.name}
                            </span>
                            <Link
                                href={profileHref}
                                className={buttonVariants({
                                    variant: 'primary',
                                })}
                            >
                                <span className='text-2xl font-bold text-blue-100'>
                                    View Profile
                                </span>
                            </Link>
                            <LogoutButton />
                        </li>
                    </ul>
                </nav>
            </aside>

            <button
                className='fixed right-4 top-4 z-50 rounded-full bg-blue-100 p-4 shadow-lg xl:hidden'
                onClick={() => {
                    setIsNavOpen(!isNavOpen)
                    setIsAnimating(true)
                    if (isNavOpen) {
                        start()
                    } else {
                        clear()
                    }
                }}
            >
                <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-8 w-8 text-blue-900'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                >
                    {isNavOpen ? (
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                        />
                    ) : (
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M4 6h16M4 12h16m-7 6h7'
                        />
                    )}
                </svg>
            </button>
        </>
    )
}
