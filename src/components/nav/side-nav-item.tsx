'use client'

import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export const SideNavItem = ({
    href,
    title,
}: Readonly<{
    href: string
    title: string
}>) => {
    const pathname = usePathname()

    return (
        <li className='w-full'>
            <AnimatePresence>
                <Link
                    href={href}
                    className={cn(
                        'relative block whitespace-nowrap border-transparent p-[0.625rem] text-2xl font-bold duration-200 hover:border-l-turq-600 hover:bg-[#64CCC51A] focus-visible:border-l-turq-600 focus-visible:bg-[#64CCC51A] focus-visible:outline-none',
                    )}
                >
                    {pathname === href && <SideNavActiveState />}
                    <span className='mx-auto block max-w-44 px-2'>{title}</span>
                </Link>
            </AnimatePresence>
        </li>
    )
}

const SideNavActiveState = ({ className }: { className?: string }) => (
    <motion.div
        layoutId='side-nav-item'
        layout
        transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
        }}
        className={cn(
            'absolute inset-0 border-l-4 border-l-turq-600 bg-[#64CCC51A]',
            className,
        )}
    />
)
