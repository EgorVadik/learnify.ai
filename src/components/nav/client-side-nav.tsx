'use client'

import { STUDENT_DASHBOARD_NAV, TEACHER_DASHBOARD_NAV } from '@/lib/constants'
import type { Session } from 'next-auth'
import { Logo } from '@/components/logo'
import { SideNavItem } from './side-nav-item'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { LogoutButton } from '@/components/buttons/logout-button'
import { cn, getUsernameFallback } from '@/lib/utils'
import { useMediaQuery } from '@mantine/hooks'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { isNavOpenAtom } from '@/atoms'
import { useAtom } from 'jotai'

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
    const [isNavOpen, setIsNavOpen] = useAtom(isNavOpenAtom)
    const matches = useMediaQuery('(max-width: 1280px)')

    if (matches) {
        return (
            <>
                <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
                    <SheetContent
                        side={'left'}
                        className='min-h-dvh overflow-y-auto bg-blue-100 p-0'
                    >
                        <ul className='flex min-h-dvh flex-col items-center justify-center'>
                            <li className='py-10'>
                                <Logo />
                            </li>
                            {navItems.map((navItem) => (
                                <SideNavItem
                                    key={navItem.href + navItem.title}
                                    href={navItem.href}
                                    title={navItem.title}
                                    onClick={() => setIsNavOpen(false)}
                                />
                            ))}
                            <li className='mt-auto flex w-full flex-col gap-[0.625rem] px-10 py-8 sm:px-20'>
                                <Avatar className='h-[4.5rem] w-[4.5rem]'>
                                    <AvatarImage
                                        src={session?.user.image ?? undefined}
                                    />
                                    <AvatarFallback>
                                        {getUsernameFallback(
                                            session?.user.name!,
                                        )}
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
                                    onClick={() => setIsNavOpen(false)}
                                >
                                    <span className='text-2xl font-bold text-blue-100'>
                                        View Profile
                                    </span>
                                </Link>
                                <LogoutButton />
                            </li>
                        </ul>
                    </SheetContent>
                </Sheet>
            </>
        )
    }

    return (
        <aside
            className={cn(
                'w-full max-w-sm shrink-0 grow bg-blue-100 max-xl:hidden',
                {
                    hidden: matches,
                },
            )}
        >
            <nav className='sticky top-0'>
                <ul className='flex h-dvh flex-col items-center justify-center'>
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
    )
}
