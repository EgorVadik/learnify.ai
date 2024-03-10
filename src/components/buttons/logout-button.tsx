'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export const LogoutButton = () => {
    const router = useRouter()

    return (
        <Button
            onClick={async () => {
                await signOut({
                    callbackUrl: '/',
                    redirect: true,
                })
                router.refresh()
            }}
            variant={'link'}
            size={'sm'}
            className='h-fit text-xl font-bold text-red-muted underline'
        >
            Logout
        </Button>
    )
}
