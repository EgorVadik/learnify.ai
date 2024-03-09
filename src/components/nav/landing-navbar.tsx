import { LANDING_PAGE_NAV } from '@/lib/constants'
import { Logo } from '../logo'
import Link from 'next/link'
import { cn } from '@/lib/utils'
// import { roboto } from '@/app/layout'
import { AuthButton } from '../buttons/auth-button'

export const LandingNavbar = () => {
    return (
        <nav className='flex items-center justify-between bg-white px-8 py-4'>
            <div>
                <Logo />
            </div>
            <ul className='hidden items-center gap-10 lg:flex'>
                {LANDING_PAGE_NAV.map((navItem, index) => (
                    <li key={index}>
                        <Link
                            href={navItem.href}
                            className={cn(
                                'text-lg text-black',
                                // roboto.className,
                            )}
                        >
                            {navItem.title}
                        </Link>
                    </li>
                ))}

                <div className={'ml-12 flex items-center gap-4'}>
                    <li>
                        <AuthButton text='Sign Up' href='/register' />
                    </li>
                    <li>
                        <AuthButton text='Log In' href='/login' />
                    </li>
                </div>
            </ul>
        </nav>
    )
}
