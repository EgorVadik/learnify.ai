'use client'

import React from 'react'
import { Logo } from '../logo'
import { STUDENT_DASHBOARD_NAV } from '@/lib/constants'
import { SideNavItem } from './side-nav-item'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Button, buttonVariants } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export const StudentSideNav = () => {
    const router = useRouter()

    return (
        <div className='w-full max-w-sm shrink-0 grow bg-blue-100'>
            <nav className='sticky top-0'>
                <ul className='flex min-h-screen flex-col items-center justify-center'>
                    <li className='py-10'>
                        <Logo />
                    </li>
                    {STUDENT_DASHBOARD_NAV.map((navItem) => (
                        <SideNavItem
                            key={navItem.href}
                            href={navItem.href}
                            title={navItem.title}
                        />
                    ))}
                    <li className='mt-auto flex w-full flex-col gap-[0.625rem] px-20 py-8'>
                        <Avatar className='h-[4.5rem] w-[4.5rem]'>
                            <AvatarImage src='https://github.com/shadcn.png' />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <span className='text-2xl font-bold'>Student Name</span>
                        <Link
                            href={'/dashboard/student/profile'}
                            className={buttonVariants({
                                variant: 'primary',
                            })}
                        >
                            <span className='text-2xl font-bold text-blue-100'>
                                View Profile
                            </span>
                        </Link>
                    </li>
                    <li>
                        <Button
                            onClick={async () => {
                                await signOut({
                                    callbackUrl: '/',
                                    redirect: true,
                                })
                                router.refresh()
                            }}
                            variant={'destructive'}
                            size={'lg'}
                        >
                            Logout
                        </Button>
                    </li>
                </ul>
            </nav>
        </div>
    )
}
