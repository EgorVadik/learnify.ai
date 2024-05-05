import React from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { Handlers, Question } from '@/types'

export const LongAnswer = ({
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
            <Textarea
                name='answer'
                className='w-full border-gray-200'
                placeholder='Long Answer'
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
