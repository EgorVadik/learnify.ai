'use client'

import { MaterialsWithUsers } from '@/types'
import { Session } from 'next-auth'
import React, { useState } from 'react'
import { CardWrapper } from '@/components/wrappers/card-wrapper'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { MarkAsCompleteButton } from '@/components/buttons/mark-as-complete-button'
import { updateMaterialCompletion } from '@/actions/course'
import { UploadMaterialForm } from '../forms/upload-material-form'
import { AttachmentsDownload } from '../buttons/attachments-download'

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
                    <AttachmentsDownload attachments={material.attachments} />
                </div>
            </div>
        </CardWrapper>
    )
}
