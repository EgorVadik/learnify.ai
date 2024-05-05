'use client'

import { MaterialsWithUsers } from '@/types'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn, formatAttachmentName, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Icons } from '@/components/icons'
import { saveAs } from 'file-saver'
import { MarkAsCompleteButton } from '@/components/buttons/mark-as-complete-button'
import { updateMaterialCompletion } from '@/actions/course'
import { UploadMaterialForm } from '../forms/upload-material-form'

type MaterialCardProps = {
    material: MaterialsWithUsers
    session: Session
    isComplete: boolean
}

export const MaterialCard = ({
    material,
    session,
    isComplete,
}: MaterialCardProps) => {
    const [isEditing, setIsEditing] = useState(false)

    if (isEditing) {
        return (
            <UploadMaterialForm
                courseId={material.courseId}
                defaultValues={{
                    title: material.title,
                    content: material.content,
                    files: material.attachments,
                }}
                handleCancel={() => setIsEditing(false)}
                materialId={material.id}
            />
        )
    }

    return (
        <CardWrapper className='rounded-lg shadow-none'>
            <div
                id={material.id}
                className='flex flex-col items-start gap-4 sm:flex-row sm:gap-10'
            >
                <MarkAsCompleteButton
                    isComplete={isComplete}
                    onClick={async () =>
                        updateMaterialCompletion({
                            itemId: material.id,
                            completed: !isComplete,
                        })
                    }
                />
                <div className='w-full space-y-2'>
                    <div className='flex flex-col-reverse items-start justify-between md:flex-row md:gap-4'>
                        <div className='flex flex-wrap items-center gap-3'>
                            <h3 className='text-heading leading-none'>
                                {material.title}
                            </h3>
                            {session.user.role === 'TEACHER' && (
                                <>
                                    <Button
                                        className={
                                            'h-fit w-fit px-0 py-0 text-gray-200 underline'
                                        }
                                        variant={'link'}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <span className='text-xl font-bold'>
                                            Edit
                                        </span>
                                    </Button>
                                </>
                            )}
                        </div>
                        <p className='text-xl text-gray-200 max-md:self-end'>
                            {formatDate(material.createdAt)}
                        </p>
                    </div>
                    <p className='text-lg'>{material.content}</p>
                    {material.attachments.length > 0 && (
                        <div className='flex flex-col items-start'>
                            {material.attachments.map((attachment) => (
                                <Button
                                    variant={'link'}
                                    className='px-0 py-0'
                                    key={attachment.url}
                                    onClick={() => {
                                        saveAs(attachment.url, attachment.name)
                                    }}
                                >
                                    <span className='flex items-center gap-2 text-sm font-medium'>
                                        <Icons.Attachment />
                                        {formatAttachmentName(attachment.name)}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </CardWrapper>
    )
}
