'use client'

import React from 'react'
import { Button } from '../ui/button'
import { MenuSquare } from 'lucide-react'
import { isNavOpenAtom } from '@/atoms'
import { useSetAtom } from 'jotai'

export const NavToggle = () => {
    const setIsNavOpen = useSetAtom(isNavOpenAtom)

    return (
        <Button
            size={'icon'}
            variant={'ghost'}
            className='shrink-0 hover:bg-gray-100 xl:hidden'
            onClick={() => setIsNavOpen(true)}
        >
            <MenuSquare />
        </Button>
    )
}
