import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Handlers, HandlersTrueFalse, Question } from '@/types'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export const TrueOrFalse = ({
    id,
    handleAnswerChange,
    handleChange,
    question,
    answer,
    handleDelete,
}: Question & HandlersTrueFalse & Handlers) => {
    return (
        <div className='flex w-full flex-col gap-2 border p-2'>
            <Input
                name='question'
                className='w-full border-gray-200'
                placeholder='Question'
                value={question}
                onChange={handleChange}
            />
            <RadioGroup
                value={answer}
                onValueChange={handleAnswerChange}
                className='flex flex-col gap-2'
            >
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem id={id + '-true'} value='true' />
                    <Label htmlFor={id + '-true'}>True</Label>
                </div>
                <div className='flex items-center space-x-2'>
                    <RadioGroupItem id={id + '-false'} value='false' />
                    <Label htmlFor={id + '-false'}>False</Label>
                </div>
            </RadioGroup>
            <div className='flex items-center justify-end gap-2'>
                <Button variant={'destructive'} onClick={handleDelete}>
                    Delete
                </Button>
            </div>
        </div>
    )
}
