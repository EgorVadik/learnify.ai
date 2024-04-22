import { LANDING_PAGE_NAV } from '@/lib/constants'
import { Logo } from '@/components/logo'
import Link from 'next/link'
import { cn } from '@/lib/utils'
// import { roboto } from '@/app/layout'
import { AuthButton } from '@/components/buttons/auth-button'

export const LandingNavbar = () => {
    return (
        <nav className='flex items-center justify-between bg-white px-8 py-4'>
            <div>
                <Logo />
            </div>
            <ul className='flex items-center gap-10'>
                {LANDING_PAGE_NAV.map((navItem, index) => (
                    <li key={index} className='hidden lg:block'>
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

                <div className={'ml-12 hidden items-center gap-4 sm:flex'}>
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
