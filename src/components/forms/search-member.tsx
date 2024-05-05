'use client'

import { useDebouncedState } from '@mantine/hooks'
import { Input } from '../ui/input'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export const SearchMember = ({
    courseId,
    defaultValue,
}: {
    courseId: string
    defaultValue: string
}) => {
    const router = useRouter()
    const [search, setSearch] = useDebouncedState(defaultValue, 400)

    useEffect(() => {
        if (search.trim() === '') {
            return router.push(`/dashboard/teacher/courses/${courseId}`)
        }

        router.push(`?search=${search.trim()}`)
    }, [courseId, router, search])

    return (
        <Input
            className='mt-3 rounded-10 border-0 bg-[rgba(8,131,149,0.15)]'
            placeholder={'Search...'}
            defaultValue={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
        />
    )
}
