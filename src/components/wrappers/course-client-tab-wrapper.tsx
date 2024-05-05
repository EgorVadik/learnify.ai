'use client'

import { Tabs } from '@/components/ui/tabs'
import { useLocalStorage, useMediaQuery } from '@mantine/hooks'
import { getDefaultTabView } from '@/lib/utils'
import { useEffect } from 'react'

type CourseClientTabWrapperProps = {
    children: React.ReactNode
    type?: string
}

export const CourseClientTabWrapper = ({
    children,
    type,
}: CourseClientTabWrapperProps) => {
    const match = useMediaQuery('(min-width: 640px)')
    const [tab, setTab] = useLocalStorage<
        'announcements' | 'tasks' | 'material' | undefined
    >({
        key: 'course-tab',
        defaultValue: 'announcements',
    })

    useEffect(() => {
        if (type != null) {
            setTab(getDefaultTabView(type))
        }
    }, [setTab, type])

    return (
        <Tabs
            value={tab}
            onValueChange={(value) => {
                setTab(getDefaultTabView(value))
            }}
            className='w-full'
            orientation={match ? 'horizontal' : 'vertical'}
        >
            {children}
        </Tabs>
    )
}
