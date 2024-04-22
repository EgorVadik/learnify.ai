'use client'

import { Tabs } from '@/components/ui/tabs'
import { useLocalStorage, useMediaQuery } from '@mantine/hooks'
import { getDefaultTabView } from '@/lib/utils'

type CourseClientTabWrapperProps = {
    children: React.ReactNode
}

export const CourseClientTabWrapper = ({
    children,
}: CourseClientTabWrapperProps) => {
    const match = useMediaQuery('(min-width: 640px)')
    const [tab, setTab] = useLocalStorage<
        'announcements' | 'tasks' | 'material' | undefined
    >({
        key: 'course-tab',
        defaultValue: 'announcements',
    })

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
