'use client'

import { SimpleUser } from '@/types'
import React, { useState } from 'react'
import { SingleImageDropzone } from '@/components/uploads/single-image-upload'
import { useEdgeStore } from '@/lib/edgestore'
import { Progress } from '@/components/ui/progress'
import { getEdgeStoreErrorMessage } from '@/lib/utils'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    type UpdateProfileSchema,
    updateProfileSchema,
} from '@/actions/user/schema'
import { editUserProfile } from '@/actions/user'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import Link from 'next/link'

type EditProfileProps = {
    user: SimpleUser
}

export const EditProfile = ({ user }: EditProfileProps) => {
    const { update } = useSession()
    const { edgestore } = useEdgeStore()
    const [image, setImage] = useState<string | undefined>(
        user.image ?? undefined,
    )
    const [progress, setProgress] = useState<number | undefined>(undefined)

    const form = useForm<UpdateProfileSchema>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            image: user.image ?? undefined,
        },
    })

    const onSubmit = async (data: UpdateProfileSchema) => {
        if (data.image === user.image || !data.image)
            return toast.info('No changes made')
        const res = await editUserProfile(data)
        if (res.success) {
            update({
                user: {
                    image: image,
                },
            })
            toast.success('Profile updated')
            return
        }

        toast.error(res.error)
    }

    return (
        <div className='flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-2'>
            <SingleImageDropzone
                height={200}
                width={200}
                className='rounded-full'
                imgClassName='rounded-full'
                value={image}
                dropzoneOptions={{
                    maxSize: 1024 * 1024 * 4, // 4MB
                }}
                onChange={async (file) => {
                    if (!file) {
                        setImage(user.image ?? undefined)
                        return
                    }

                    setImage(URL.createObjectURL(file))
                    try {
                        const res = await edgestore.profileImages.upload({
                            file,
                            options: {
                                temporary: true,
                            },
                            onProgressChange(progress) {
                                setProgress(progress)
                            },
                        })

                        setImage(res.url)
                        form.setValue('image', res.url)
                    } catch (error) {
                        const msg = getEdgeStoreErrorMessage(error)
                        toast.error(msg)
                    } finally {
                        setProgress(undefined)
                    }
                }}
            />

            {progress !== undefined && (
                <Progress value={progress} className='max-w-xs bg-gray-200' />
            )}

            <div className='text-4xl font-medium text-black'>{user.name}</div>

            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='w-full max-w-[39rem] space-y-8'
            >
                <div className='space-y-2'>
                    <Label
                        htmlFor='name'
                        className='text-sm font-medium text-gray-200'
                    >
                        Name
                    </Label>
                    <Input
                        id='name'
                        type='name'
                        disabled
                        value={user.name}
                        placeholder='Name'
                        className='w-full max-w-xs border-0 bg-muted-green'
                    />
                </div>

                <div className='space-y-2'>
                    <Label
                        htmlFor='email'
                        className='text-sm font-medium text-gray-200'
                    >
                        Email
                    </Label>
                    <Input
                        id='email'
                        type='email'
                        disabled
                        value={user.email}
                        placeholder='Email'
                        className='w-full max-w-xs border-0 bg-muted-green'
                    />
                </div>

                <div className='space-y-2'>
                    <Label className='text-sm font-medium text-gray-200'>
                        What are you?
                    </Label>
                    <RadioGroup
                        defaultValue={user.role}
                        value={user.role}
                        disabled
                    >
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='STUDENT' id='STUDENT' />
                            <Label htmlFor='STUDENT'>Student</Label>
                        </div>
                        <div className='flex items-center space-x-2'>
                            <RadioGroupItem value='TEACHER' id='TEACHER' />
                            <Label htmlFor='TEACHER'>Teacher</Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className='flex items-center justify-end gap-5'>
                    <Button
                        type='submit'
                        variant='primary'
                        disabled={
                            form.formState.isSubmitting ||
                            progress !== undefined
                        }
                    >
                        {form.formState.isSubmitting && (
                            <Loader2 className='mr-2 animate-spin' />
                        )}
                        <span className='px-3 text-xl font-bold text-white'>
                            Save
                        </span>
                    </Button>

                    <Link
                        href={'.'}
                        className={buttonVariants({
                            variant: 'outline',
                        })}
                    >
                        <span className='px-3 text-xl font-bold'>Cancel</span>
                    </Link>
                </div>
            </form>
        </div>
    )
}
