'use client'

import { type RegisterSchema, registerSchema } from '@/actions/user/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import React from 'react'
import { useForm } from 'react-hook-form'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import Link from 'next/link'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Role } from '@prisma/client'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { createNewUser } from '@/actions/user'

export const RegisterForm = () => {
    const router = useRouter()
    const role = useSearchParams().get('role')
    const form = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
            name: '',
            confirmPassword: '',
            role:
                role == null
                    ? Role.STUDENT
                    : role === Role.STUDENT
                      ? Role.STUDENT
                      : role === Role.TEACHER
                        ? Role.TEACHER
                        : Role.STUDENT,
        },
    })

    const onSubmit = async (data: RegisterSchema) => {
        const status = await createNewUser(data)

        if (!status.success) {
            toast.error(status.error)
            return
        }

        await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false,
        })

        toast.success('Account created successfully!')
        router.replace('/dashboard')
    }

    return (
        <div className='w-full'>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='grid gap-x-10 gap-y-9 pb-8 md:grid-cols-2'
                >
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='p-2 text-sm font-medium text-gray-200'>
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type='text'
                                        placeholder='Name'
                                        className='rounded-l-none border-0 bg-muted-green'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className='text-red' />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='p-2 text-sm font-medium text-gray-200'>
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type='email'
                                        placeholder='email@email.com'
                                        className='rounded-l-none border-0 bg-muted-green'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className='text-red' />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='password'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='p-2 text-sm font-medium text-gray-200'>
                                    Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type='password'
                                        placeholder='********'
                                        className='rounded-l-none border-0 bg-muted-green'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className='text-red' />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='confirmPassword'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='p-2 text-sm font-medium text-gray-200'>
                                    Confirm Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type='password'
                                        placeholder='********'
                                        className='rounded-l-none border-0 bg-muted-green'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className='text-red' />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='role'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='p-2 text-sm font-medium text-gray-200'>
                                    What are you?
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className='flex flex-col gap-4'
                                    >
                                        <FormItem className='flex items-center space-x-3 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem
                                                    value={Role.STUDENT}
                                                    className={cn({
                                                        'border-turq-600':
                                                            field.value ===
                                                            Role.STUDENT,
                                                    })}
                                                />
                                            </FormControl>
                                            <FormLabel className='text-sm font-medium text-black'>
                                                Student
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className='flex items-center space-x-3 space-y-0'>
                                            <FormControl>
                                                <RadioGroupItem
                                                    value={Role.TEACHER}
                                                    className={cn({
                                                        'border-turq-600':
                                                            field.value ===
                                                            Role.TEACHER,
                                                    })}
                                                />
                                            </FormControl>
                                            <FormLabel className='text-sm font-medium text-black'>
                                                Teacher
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage className='text-red' />
                            </FormItem>
                        )}
                    />

                    <div className='col-span-full pt-7'>
                        <Button
                            type='submit'
                            variant={'primary'}
                            className='flex w-full items-center gap-2'
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting && (
                                <Loader2 className='animate-spin' />
                            )}
                            <span className='text-xl font-bold'>Register</span>
                        </Button>

                        <div className='text-center'>
                            <span className='text-sm text-gray-200'>
                                {`Already have an account? `}
                                <Link
                                    href='/login'
                                    className='text-sm text-black'
                                >
                                    Log In
                                </Link>
                            </span>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
