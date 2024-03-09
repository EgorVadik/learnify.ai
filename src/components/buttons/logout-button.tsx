'use client'

import { signOut } from 'next-auth/react'
import { Button } from '../ui/button'
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
            className='text-red-muted h-fit text-xl font-bold underline'
        >
            Logout
        </Button>
    )
}
