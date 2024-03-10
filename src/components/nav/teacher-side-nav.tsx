import React from 'react'
import { Logo } from '../logo'
import { TEACHER_DASHBOARD_NAV } from '@/lib/constants'
import { SideNavItem } from './side-nav-item'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { LogoutButton } from '../buttons/logout-button'
import { getServerAuthSession } from '@/server/auth'
import { getUsernameFallback } from '@/lib/utils'

export const TeacherSideNav = async () => {
    const session = await getServerAuthSession()
    return (
        <aside className='w-full max-w-sm shrink-0 grow bg-blue-100'>
            <nav className='sticky top-0'>
                <ul className='flex min-h-screen flex-col items-center justify-center'>
                    <li className='py-10'>
                        <Logo />
                    </li>
                    {TEACHER_DASHBOARD_NAV.map((navItem) => (
                        <SideNavItem
                            key={navItem.href}
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
                            href={'/dashboard/teacher/profile'}
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
