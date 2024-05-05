import React from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Handlers, HandlersWithOptions, Question } from '@/types'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export const MultipleChoice = ({
    question,
    answer,
    handleDelete,
    handleAddOption,
    handleDeleteOption,
    handleChange,
    handleOptionChange,
    handleAnswerChange,
    options,
}: Question & HandlersWithOptions & Handlers) => {
    return (
        <div className='flex w-full flex-col gap-2 border p-2'>
            <Input
                name='question'
                className='w-full border-gray-200'
                placeholder='Question'
                value={question}
                onChange={handleChange}
            />
            <Label>Options</Label>
            <div className='flex flex-col gap-2'>
                {options?.map((option, index) => (
                    <div key={index} className='flex gap-2'>
                        <Input
                            name='option'
                            className='w-full border-gray-200'
                            placeholder='Option'
                            value={option}
                            onChange={(e) => handleOptionChange(e, index)}
                        />
                        <Button
                            variant={'destructive'}
                            onClick={() => handleDeleteOption(index)}
                        >
                            Delete
                        </Button>
                    </div>
                ))}
                <Button onClick={handleAddOption} variant={'outline'}>
                    <span className='text-base font-bold'>Add Option</span>
                </Button>
            </div>

            <RadioGroup
                name='answer'
                value={answer}
                onValueChange={handleAnswerChange}
                className='flex flex-col gap-2'
            >
                {options?.map((option, index) => (
                    <div className='flex items-center space-x-2' key={index}>
                        <RadioGroupItem
                            id={`${option}-${index}`}
                            value={option}
                        />
                        <Label htmlFor={`${option}-${index}`}>{option}</Label>
                    </div>
                ))}
            </RadioGroup>

            <div className='flex items-center justify-end gap-2'>
                <Button variant={'destructive'} onClick={handleDelete}>
                    Delete
                </Button>
            </div>
        </div>
    )
}
