import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Handlers, Question } from '@/types'

export const ShortAnswer = ({
    question,
    answer,
    handleChange,
    handleDelete,
}: Question & Handlers) => {
    return (
        <div className='flex w-full flex-col gap-2 border p-2'>
            <Input
                name='question'
                className='w-full border-gray-200'
                placeholder='Question'
                value={question}
                onChange={handleChange}
            />
            <Input
                name='answer'
                className='w-full border-gray-200'
                placeholder='Short Answer'
                value={answer}
                onChange={handleChange}
            />
            <div className='flex items-center justify-end gap-2'>
                <Button variant={'destructive'} onClick={handleDelete}>
                    Delete
                </Button>
            </div>
        </div>
    )
}
