import Link from 'next/link'
import { AnchorHTMLAttributes } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
// import { raleway } from '@/app/layout'

type AuthButtonProps = {
    text: 'Log In' | 'Sign Up'
    href: '/login' | '/register'
} & AnchorHTMLAttributes<HTMLAnchorElement>

export const AuthButton = ({ text, href, ...props }: AuthButtonProps) => {
    return (
        <Link
            className={buttonVariants({
                className: cn('w-36'),
                // className: cn('w-36', raleway.className),
                variant: href === '/register' ? 'outline' : 'primary',
            })}
            href={href}
            {...props}
        >
            <span className='text-xl font-bold'>{text}</span>
        </Link>
    )
}
