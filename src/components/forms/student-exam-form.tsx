'use client'

import { type QuestionsSchema, questionsSchema } from '@/actions/exam/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { useLocalStorage } from '@mantine/hooks'
import { toast } from 'sonner'
import { submitStudentAnswers } from '@/actions/exam'
import { useState } from 'react'
import { Icons } from '../icons'
import { useRouter } from 'next/navigation'

type StudentExamFormProps = {
    questions: QuestionsSchema
    taskId: string
    courseId: string
}

export const StudentExamForm = ({
    questions,
    taskId,
    courseId,
}: StudentExamFormProps) => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [questionsState, setQuestionsState, removeValue] = useLocalStorage({
        key: `student-answers-${taskId}`,
        defaultValue: questions,
    })

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const parsedQuestion = questionsSchema.safeParse(questionsState)

            if (!parsedQuestion.success) {
                return toast.error('Please answer all questions')
            }

            router.replace(`/dashboard/student/courses/${courseId}`)
            toast.success('Exam is currently being graded in the background.')

            const res = await submitStudentAnswers({
                answers: parsedQuestion.data,
                taskId,
            })

            if (!res.success) {
                return toast.error(res.error)
            }

            removeValue()
            toast.success('Exam graded successfully')
            router.refresh()
        } catch (error) {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const setAnswer = (questionId: string, answer: string) => {
        setQuestionsState((prev) => {
            return prev.map((question) => {
                if (question.id === questionId) {
                    return { ...question, answer }
                }
                return question
            })
        })
    }

    return (
        <form onSubmit={onSubmit} className='space-y-8'>
            {questionsState.map((question, index) => {
                switch (question.type) {
                    case 'LONG_ANSWER':
                        return (
                            <LongAnswerQuestion
                                key={question.id}
                                question={question}
                                setAnswer={setAnswer}
                                index={index}
                            />
                        )
                    case 'SHORT_ANSWER':
                        return (
                            <ShortAnswerQuestion
                                key={question.id}
                                question={question}
                                setAnswer={setAnswer}
                                index={index}
                            />
                        )
                    case 'MULTIPLE_CHOICE':
                        return (
                            <MultipleChoiceQuestion
                                key={question.id}
                                question={question}
                                setAnswer={setAnswer}
                                index={index}
                            />
                        )
                    case 'TRUE_FALSE':
                        return (
                            <TrueFalseQuestion
                                key={question.id}
                                question={question}
                                setAnswer={setAnswer}
                                index={index}
                            />
                        )

                    default:
                        break
                }
            })}

            <div className='flex items-end justify-end'>
                <Button
                    type='submit'
                    variant={'primary'}
                    size={'lg'}
                    disabled={loading}
                >
                    {loading && <Icons.Spinner />}
                    <span className='text-base font-bold'>Submit</span>
                </Button>
            </div>
        </form>
    )
}

type QuestionProps = {
    question: QuestionsSchema[number]
    setAnswer: (questionId: string, answer: string) => void
    index: number
}

const LongAnswerQuestion = ({ question, setAnswer, index }: QuestionProps) => {
    return (
        <div>
            <Label htmlFor={question.id}>
                {index + 1}- {question.question}
            </Label>
            <Textarea
                id={question.id}
                value={question.answer}
                className='w-full border-gray-200'
                placeholder='Answer'
                onChange={(e) => setAnswer(question.id, e.target.value)}
            />
        </div>
    )
}

const ShortAnswerQuestion = ({ question, setAnswer, index }: QuestionProps) => {
    return (
        <div className='space-y-2'>
            <Label htmlFor={question.id}>
                {index + 1}- {question.question}
            </Label>
            <Input
                id={question.id}
                value={question.answer}
                placeholder='Answer'
                className='w-full border-gray-200'
                onChange={(e) => setAnswer(question.id, e.target.value)}
            />
        </div>
    )
}

const MultipleChoiceQuestion = ({
    question,
    setAnswer,
    index,
}: QuestionProps) => {
    return (
        <div className='space-y-2'>
            <Label>
                {index + 1}- {question.question}
            </Label>
            <div className='space-y-1'>
                {question.options?.map((option, optionIndex) => (
                    <div key={`${option}-${optionIndex}`}>
                        <RadioGroup
                            value={question.answer}
                            onValueChange={(value) =>
                                setAnswer(question.id, value)
                            }
                        >
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem
                                    id={`${option}-${optionIndex}`}
                                    value={option}
                                />
                                <Label htmlFor={`${option}-${optionIndex}`}>
                                    {option}
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                ))}
            </div>
        </div>
    )
}

const TrueFalseQuestion = ({ question, setAnswer, index }: QuestionProps) => {
    return (
        <div className='space-y-2'>
            <Label>
                {index + 1}- {question.question}
            </Label>
            <div className='space-y-1'>
                <RadioGroup
                    value={question.answer}
                    onValueChange={(value) => setAnswer(question.id, value)}
                >
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem id='true' value='true' />
                        <Label htmlFor='true'>True</Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <RadioGroupItem id='false' value='false' />
                        <Label htmlFor='false'>False</Label>
                    </div>
                </RadioGroup>
            </div>
        </div>
    )
}
