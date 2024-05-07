'use client'

import { TasksWithUsers } from '@/types'
import { Session } from 'next-auth'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn, formatAttachmentName, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Icons } from '@/components/icons'
import { saveAs } from 'file-saver'
import { MarkAsCompleteButton } from '@/components/buttons/mark-as-complete-button'
import { updateTaskCompletion, uploadStudentTask } from '@/actions/course'
import { MultiFileDropzone } from '@/components/uploads/multi-file-dropzone'
import { toast } from 'sonner'
import { useMultiFileUpload } from '@/hooks/use-multi-file-upload'
import { useState } from 'react'
import { StartExamDialog } from '@/components/popovers/start-exam-dialog'
import { CreateTaskForm } from '../forms/create-task-form'
import { useRouter } from 'next/navigation'

type TaskCardProps = {
    task: TasksWithUsers
    session: Session
    isComplete: boolean
    examScore?: number
}

export const TaskCard = ({
    task,
    session,
    isComplete,
    examScore,
}: TaskCardProps) => {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const { files, fileStates, handleFilesAdded, isUploading, setFileStates } =
        useMultiFileUpload()

    const onSubmit = async () => {
        setLoading(true)
        try {
            if (files == null)
                return toast.error('You must upload at least 1 file.')
            if (files.length === 0)
                return toast.error('You must upload at least 1 file.')
            if (files.length > 10)
                return toast.error('You can only upload up to 10 files.')

            const res = await uploadStudentTask({
                files,
                taskId: task.id,
            })

            if (!res.success) return toast.error(res.error)
            toast.success('Files uploaded successfully.')
        } catch (error) {
            toast.error('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (isEditing) {
        return (
            <CreateTaskForm
                courseId={task.courseId}
                defaultValues={{
                    title: task.title,
                    content: task.description,
                    dueDate: task.dueDate,
                    files: task.attachments.map((attachment) => ({
                        name: attachment.name,
                        url: attachment.url,
                    })),
                }}
                handleCancel={() => setIsEditing(false)}
                taskId={task.id}
            />
        )
    }

    return (
        <CardWrapper className='rounded-lg shadow-none'>
            <div className='flex flex-col items-start gap-4 sm:flex-row sm:gap-10'>
                <MarkAsCompleteButton
                    isComplete={isComplete}
                    onClick={async () =>
                        updateTaskCompletion({
                            itemId: task.id,
                            completed: !isComplete,
                        })
                    }
                />
                <div className='w-full space-y-2'>
                    <div className='flex flex-col-reverse items-start justify-between md:flex-row md:gap-4'>
                        <div className='flex flex-wrap items-center gap-3'>
                            <div className='flex flex-wrap items-start gap-3'>
                                <div className='text-heading leading-none'>
                                    {task.title}
                                </div>

                                {examScore != null && (
                                    <span className='whitespace-nowrap text-xl font-bold'>
                                        {examScore} / 100
                                    </span>
                                )}
                            </div>
                            {session.user.role === 'TEACHER' && (
                                <>
                                    <Button
                                        className={
                                            'h-fit w-fit px-0 py-0 text-gray-200 underline'
                                        }
                                        variant={'link'}
                                        onClick={() => {
                                            if (task.type === 'ASSIGNMENT')
                                                return setIsEditing(true)

                                            router.push(
                                                `/dashboard/teacher/courses/${task.courseId}/edit-task/${task.id}`,
                                            )
                                        }}
                                    >
                                        <span className='text-xl font-bold'>
                                            Edit
                                        </span>
                                    </Button>
                                    <Link
                                        href={`/dashboard/teacher/courses/${task.courseId}/tasks/${task.id}`}
                                        className={cn(
                                            buttonVariants({
                                                variant: 'link',
                                            }),
                                            'h-fit w-fit px-0 py-0 text-gray-200 underline',
                                        )}
                                    >
                                        <span className='text-xl font-bold'>
                                            View
                                        </span>
                                    </Link>
                                </>
                            )}
                        </div>
                        <p className='text-xl text-gray-200 max-md:self-end'>
                            {formatDate(task.createdAt)}
                        </p>
                    </div>
                    <div className='flex flex-col items-start justify-between gap-3 sm:flex-row'>
                        <div>
                            <p className='text-lg'>{task.description}</p>
                            {task.attachments.length > 0 && (
                                <div className='flex flex-col items-start'>
                                    {task.attachments.map((attachment) => (
                                        <Button
                                            variant={'link'}
                                            className='px-0 py-0'
                                            key={attachment.url}
                                            onClick={() => {
                                                saveAs(
                                                    attachment.url,
                                                    attachment.name,
                                                )
                                            }}
                                        >
                                            <span className='flex items-center gap-2 text-sm font-medium'>
                                                <Icons.Attachment />
                                                {formatAttachmentName(
                                                    attachment.name,
                                                )}
                                            </span>
                                        </Button>
                                    ))}
                                </div>
                            )}
                            {!isComplete &&
                                session.user.role === 'STUDENT' &&
                                (task.type === 'ASSIGNMENT' ? (
                                    <>
                                        <MultiFileDropzone
                                            className='h-8 w-fit'
                                            dropzoneOptions={{
                                                maxSize: 1024 * 1024 * 50,
                                                maxFiles: 10,
                                            }}
                                            value={fileStates}
                                            onChange={(files) => {
                                                setFileStates(files)
                                            }}
                                            onFilesAdded={handleFilesAdded}
                                            uploadText='Upload'
                                        />
                                        {files != null && files.length > 0 && (
                                            <Button
                                                variant={'primary'}
                                                className='mt-2 px-7'
                                                disabled={
                                                    isUploading || loading
                                                }
                                                onClick={onSubmit}
                                            >
                                                {(loading || isUploading) && (
                                                    <Icons.Spinner />
                                                )}
                                                <span className='text-xl font-bold text-blue-100'>
                                                    Upload
                                                </span>
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <StartExamDialog
                                        task={{
                                            id: task.id,
                                            type: task.type,
                                            description: task.description,
                                            dueDate: task.dueDate,
                                            exam: task.exam,
                                            startDate: task.startDate,
                                            title: task.title,
                                            courseId: task.courseId,
                                        }}
                                    >
                                        <Button
                                            className={'h-fit w-fit px-7'}
                                            variant={'primary'}
                                        >
                                            Start
                                        </Button>
                                    </StartExamDialog>
                                ))}
                        </div>
                        {task.type === 'ASSIGNMENT' ? (
                            <DateInfo
                                date={task.dueDate}
                                title='Due:'
                                type='ASSIGNMENT'
                            />
                        ) : (
                            <div className='flex items-center gap-4 self-end'>
                                <DateInfo
                                    date={task.startDate!}
                                    title='Start:'
                                    type='EXAM'
                                />
                                <DateInfo
                                    date={task.dueDate}
                                    title='End:'
                                    type='EXAM'
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CardWrapper>
    )
}

const DateInfo = ({
    date,
    title,
    type,
}: {
    date: Date
    title: string
    type: TasksWithUsers['type']
}) => {
    return (
        <div
            className={cn(
                'flex shrink-0 flex-col text-lg text-gray-200 max-sm:items-end',
                type === 'ASSIGNMENT' && 'max-sm:w-full',
            )}
        >
            <span>{title}</span>
            <span>
                {formatDate(date, {
                    dateStyle: undefined,
                    timeStyle: 'short',
                })}
            </span>
            <span>{formatDate(date)}</span>
        </div>
    )
}
