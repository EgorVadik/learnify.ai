import Link from 'next/link'
import React from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
// import { merriweather, montserrat, raleway } from '@/app/layout'
import { Logo } from '../logo'
import { Icons } from '../icons'

export const Footer = () => {
    return (
        <footer className='bg-blue-400 pb-28 pt-24'>
            <div className='container'>
                <div className='space-y-8'>
                    <h2
                        className={cn(
                            'text-center text-4xl font-extrabold text-white',
                            // montserrat.className,
                        )}
                    >
                        Learn. Adapt. Thrive.
                    </h2>
                    <p
                        className={cn(
                            'text-balance text-center text-sm text-white opacity-80',
                            // merriweather.className,
                        )}
                    >
                        Learn with personalized exams, adapt through AI-driven
                        assessments, and thrive in collaborative environments.
                        Join <br className='hidden lg:flex' />
                        Learnify.ai for a dynamic and empowering educational
                        journey.
                    </p>
                </div>
                <div className='grid items-center gap-4 pb-16 pt-12 sm:grid-cols-2 sm:gap-8 md:pb-24 md:pt-16'>
                    <div className='sm:justify-self-end'>
                        <Link
                            href='/register?role=student'
                            className={buttonVariants({
                                variant: 'outline',
                                size: 'lg',
                                className: cn(
                                    'w-full px-8 sm:w-fit',
                                    // raleway.className,
                                ),
                            })}
                        >
                            <span className='text-2xl font-bold'>
                                {`I'm`} a student
                            </span>
                        </Link>
                    </div>
                    <div>
                        <Link
                            href='/register?role=teacher'
                            className={buttonVariants({
                                variant: 'primary',
                                size: 'lg',
                                className: cn(
                                    'w-full px-8 sm:w-fit',
                                    // raleway.className,
                                ),
                            })}
                        >
                            <span className='text-2xl font-bold'>
                                {`I'm`} a teacher
                            </span>
                        </Link>
                    </div>
                </div>
                <div className='grid justify-center gap-4 text-center md:flex md:items-end md:justify-between md:gap-0 md:text-left'>
                    <div>
                        <Logo className='text-white' />
                    </div>
                    <span
                        className={cn(
                            'text-sm text-white',
                            // merriweather.className,
                        )}
                    >
                        © 2024 Learnify.ai. All Rights Reserved.
                    </span>
                    <Icons.Socials className='mx-auto md:mx-0' />
                </div>
            </div>
        </footer>
    )
}
