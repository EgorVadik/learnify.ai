'use client'

import React, { useEffect } from 'react'
import { DndContext } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { randomId, useLocalStorage } from '@mantine/hooks'
import { toast } from 'sonner'
import { SortableContext } from '@dnd-kit/sortable'
import { TOOLBOX_ITEMS } from '@/lib/constants'
import { type CreateExamSchema, questionsSchema } from '@/actions/exam/schema'
import type { Question } from '@/types'
import { QuestionsWrapper } from '@/components/online-exam/questions-wrapper'
import { SortableWrapper } from '@/components/online-exam/sortable-wrapper'
import { MultipleChoice } from '@/components/online-exam/multiple-choice'
import { ShortAnswer } from '@/components/online-exam/short-answer'
import { LongAnswer } from '@/components/online-exam/long-answer'
import { TrueOrFalse } from '@/components/online-exam/true-or-false'
import { ToolboxCard } from '@/components/online-exam/toolbox-card'
import { ExamDetailsForm } from '@/components/online-exam/exam-details-form'
import { cn } from '@/lib/utils'

type MainWrapperProps = {
    courseId: string
    defaultQuestions?: Question[]
    defaultExamDetails?: Omit<CreateExamSchema, 'courseId'>
    examId?: string
}

export const MainWrapper = ({
    courseId,
    defaultExamDetails,
    defaultQuestions,
    examId,
}: MainWrapperProps) => {
    const [editingQuestions, setEditingQuestions] = React.useState(true)
    const [questions, setQuestions] = useLocalStorage<Question[]>({
        key: 'questions',
        defaultValue: [],
    })

    useEffect(() => {
        if (defaultQuestions) {
            setQuestions(defaultQuestions)
        }

        return () => {
            if (defaultQuestions) setQuestions([])
        }
    }, [defaultQuestions, setQuestions])

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        questionId: string,
    ) => {
        const { name, value } = e.target
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId
                    ? {
                          ...q,
                          [name]: value,
                      }
                    : q,
            ),
        )
    }

    const handleDelete = (questionId: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId))
    }

    const handleSave = () => {
        const parsedQuestions = questionsSchema.safeParse(questions)

        if (!parsedQuestions.success) {
            const firstError = parsedQuestions.error.errors.at(0)
            return toast.error(
                firstError != null &&
                    firstError.message ===
                        'You must have at least one question.'
                    ? firstError.message
                    : 'Please fill all the fields correctly.',
            )
        }

        setEditingQuestions(false)
    }

    return (
        <>
            <div className={cn(editingQuestions && 'hidden')}>
                <ExamDetailsForm
                    courseId={courseId}
                    questions={questions}
                    setEditingQuestions={setEditingQuestions}
                    setQuestions={setQuestions}
                    defaultValues={defaultExamDetails}
                    examId={examId}
                />
            </div>
            <div
                className={cn(
                    'flex flex-1 flex-col-reverse gap-4 rounded-md border p-2 lg:flex-row',
                    !editingQuestions && 'hidden',
                )}
            >
                <DndContext
                    onDragEnd={(event) => {
                        const { over, active } = event
                        if (!over) return
                        if (over.id.toString().includes('mantine')) {
                            const activeId = active.id
                            const destinationId = over.id
                            const activeIndex = questions.findIndex(
                                (q) => q.id === activeId,
                            )
                            const destinationIndex = questions.findIndex(
                                (q) => q.id === destinationId,
                            )
                            const question = TOOLBOX_ITEMS.find(
                                (item) => item.type === activeId,
                            )
                            const newQuestions =
                                question == null
                                    ? [...questions]
                                    : [
                                          ...questions,
                                          {
                                              id: randomId(),
                                              type: question.type,
                                              answer: '',
                                              options: [],
                                              question: '',
                                          },
                                      ]
                            const [removed] = newQuestions.splice(
                                question == null
                                    ? activeIndex
                                    : questions.length,
                                1,
                            )
                            newQuestions.splice(destinationIndex, 0, removed)
                            setQuestions(newQuestions)
                            return
                        }
                        if (over.id !== 'droppable') return
                        const id = active.id
                        const question = TOOLBOX_ITEMS.find(
                            (item) => item.type === id,
                        )
                        if (!question) return
                        setQuestions((prev) => [
                            ...prev,
                            {
                                id: randomId(),
                                type: question.type,
                                answer: '',
                                options: [],
                                question: '',
                            },
                        ])
                    }}
                >
                    <QuestionsWrapper>
                        <div className='space-y-2'>
                            <h2 className='text-xl font-bold'>Questions</h2>
                            <SortableContext items={questions}>
                                {questions.map((question) => {
                                    switch (question.type) {
                                        case 'MULTIPLE_CHOICE':
                                            return (
                                                <SortableWrapper
                                                    id={question.id}
                                                    key={question.id}
                                                >
                                                    <MultipleChoice
                                                        {...question}
                                                        handleAnswerChange={(
                                                            ans,
                                                        ) => {
                                                            setQuestions(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (q) =>
                                                                            q.id ===
                                                                            question.id
                                                                                ? {
                                                                                      ...q,
                                                                                      answer: ans,
                                                                                  }
                                                                                : q,
                                                                    ),
                                                            )
                                                        }}
                                                        handleAddOption={() =>
                                                            setQuestions(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (q) =>
                                                                            q.id ===
                                                                            question.id
                                                                                ? {
                                                                                      ...q,
                                                                                      options:
                                                                                          [
                                                                                              ...(q.options ||
                                                                                                  []),
                                                                                              '',
                                                                                          ],
                                                                                  }
                                                                                : q,
                                                                    ),
                                                            )
                                                        }
                                                        handleDeleteOption={(
                                                            index,
                                                        ) => {
                                                            setQuestions(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (q) =>
                                                                            q.id ===
                                                                            question.id
                                                                                ? {
                                                                                      ...q,
                                                                                      options:
                                                                                          q.options?.filter(
                                                                                              (
                                                                                                  _,
                                                                                                  i,
                                                                                              ) =>
                                                                                                  i !==
                                                                                                  index,
                                                                                          ),
                                                                                  }
                                                                                : q,
                                                                    ),
                                                            )
                                                        }}
                                                        handleChange={(e) =>
                                                            handleChange(
                                                                e,
                                                                question.id,
                                                            )
                                                        }
                                                        handleDelete={() =>
                                                            handleDelete(
                                                                question.id,
                                                            )
                                                        }
                                                        handleOptionChange={(
                                                            e,
                                                            index,
                                                        ) =>
                                                            setQuestions(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (q) =>
                                                                            q.id ===
                                                                            question.id
                                                                                ? {
                                                                                      ...q,
                                                                                      options:
                                                                                          q.options?.map(
                                                                                              (
                                                                                                  o,
                                                                                                  i,
                                                                                              ) =>
                                                                                                  i ===
                                                                                                  index
                                                                                                      ? e
                                                                                                            .target
                                                                                                            .value
                                                                                                      : o,
                                                                                          ),
                                                                                  }
                                                                                : q,
                                                                    ),
                                                            )
                                                        }
                                                        options={
                                                            question.options
                                                        }
                                                    />
                                                </SortableWrapper>
                                            )
                                        case 'SHORT_ANSWER':
                                            return (
                                                <SortableWrapper
                                                    id={question.id}
                                                    key={question.id}
                                                >
                                                    <ShortAnswer
                                                        {...question}
                                                        handleChange={(e) =>
                                                            handleChange(
                                                                e,
                                                                question.id,
                                                            )
                                                        }
                                                        handleDelete={() =>
                                                            handleDelete(
                                                                question.id,
                                                            )
                                                        }
                                                    />
                                                </SortableWrapper>
                                            )
                                        case 'LONG_ANSWER':
                                            return (
                                                <SortableWrapper
                                                    id={question.id}
                                                    key={question.id}
                                                >
                                                    <LongAnswer
                                                        {...question}
                                                        handleChange={(e) =>
                                                            handleChange(
                                                                e,
                                                                question.id,
                                                            )
                                                        }
                                                        handleDelete={() =>
                                                            handleDelete(
                                                                question.id,
                                                            )
                                                        }
                                                    />
                                                </SortableWrapper>
                                            )
                                        case 'TRUE_FALSE':
                                            return (
                                                <SortableWrapper
                                                    id={question.id}
                                                    key={question.id}
                                                >
                                                    <TrueOrFalse
                                                        {...question}
                                                        handleChange={(e) =>
                                                            handleChange(
                                                                e,
                                                                question.id,
                                                            )
                                                        }
                                                        handleDelete={() =>
                                                            handleDelete(
                                                                question.id,
                                                            )
                                                        }
                                                        handleAnswerChange={(
                                                            ans,
                                                        ) => {
                                                            setQuestions(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (q) =>
                                                                            q.id ===
                                                                            question.id
                                                                                ? {
                                                                                      ...q,
                                                                                      answer: ans,
                                                                                  }
                                                                                : q,
                                                                    ),
                                                            )
                                                        }}
                                                    />
                                                </SortableWrapper>
                                            )
                                        default:
                                            return null
                                    }
                                })}
                            </SortableContext>
                        </div>
                        <Button
                            className='mt-auto flex w-full items-center justify-center'
                            onClick={handleSave}
                            variant={'primary'}
                        >
                            <span className='text-base font-bold'>
                                Continue
                            </span>
                        </Button>
                    </QuestionsWrapper>
                    <div className='w-full grow rounded-md border p-2 lg:max-w-xs'>
                        <div className='sticky top-5 space-y-2'>
                            <h2 className='pb-2 text-center text-xl font-bold'>
                                Toolbox
                            </h2>
                            {TOOLBOX_ITEMS.map((item) => (
                                <ToolboxCard
                                    key={item.type}
                                    type={item.type}
                                    title={item.title}
                                    icon={<item.icon />}
                                />
                            ))}
                        </div>
                    </div>
                </DndContext>
            </div>
        </>
    )
}
