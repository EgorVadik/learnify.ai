import { Bell, Settings } from 'lucide-react'
import React from 'react'

type HeaderProps = {
    title: string
}

export const Header = ({ title }: HeaderProps) => {
    return (
        <div className='flex items-center justify-between'>
            <h1 className='pb-12 text-4xl font-medium text-black'>{title}</h1>

            <div className='gap- flex items-center gap-3'>
                <Bell />
                <Settings />
            </div>
        </div>
    )
}
