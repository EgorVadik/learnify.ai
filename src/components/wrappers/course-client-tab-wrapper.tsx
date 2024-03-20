'use client'

import { Tabs } from '../ui/tabs'
import { useLocalStorage } from '@mantine/hooks'
import { getDefaultTabView } from '@/lib/utils'

type CourseClientTabWrapperProps = {
    children: React.ReactNode
}

export const CourseClientTabWrapper = ({
    children,
}: CourseClientTabWrapperProps) => {
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
        >
            {children}
        </Tabs>
    )
}
