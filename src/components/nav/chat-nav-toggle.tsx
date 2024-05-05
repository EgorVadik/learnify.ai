'use client'

import React from 'react'
import { Button } from '../ui/button'
import { MessageSquareText } from 'lucide-react'
import { isChatNavOpenAtom } from '@/atoms'
import { useSetAtom } from 'jotai'

export const ChatNavToggle = () => {
    const setIsChatNavOpen = useSetAtom(isChatNavOpenAtom)

    return (
        <Button
            size={'icon'}
            variant={'ghost'}
            className='hover:bg-gray-100 md:hidden'
            onClick={() => setIsChatNavOpen(true)}
        >
            <MessageSquareText />
        </Button>
    )
}
