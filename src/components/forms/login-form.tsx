'use client'

import { cn } from '@/lib/utils'
import { type LoginSchema, loginSchema } from '@/actions/user/schema'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export const LoginForm = () => {
    const callbackUrl = useSearchParams().get('callbackUrl')
    const router = useRouter()
    const form = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    const onSubmit = async (data: LoginSchema) => {
        const res = await signIn('credentials', {
            email: data.email,
            password: data.password,
            redirect: false,
        })

        if (res?.error) {
            toast.error(res.error)
            return
        }

        toast.success('Logged in successfully!')
        router.replace(callbackUrl ?? '/dashboard')
    }

    return (
        <div className='relative left-0 z-10 mb-28 w-full max-w-sm bg-white px-11 py-9 shadow-big xl:left-1/2'>
            <h1
                className={cn(
                    'text-3xl font-semibold text-black',
                    // montserrat.className,
                )}
            >
                Log In
            </h1>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='mt-2 space-y-3 pb-8'
                >
                    <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='p-2 text-sm font-medium text-gray-200'>
                                    Email
                                </FormLabel>
                                <FormControl>
                                    <div className='flex items-stretch'>
                                        <div className='grid place-content-center rounded-l-md border-r border-dark-green bg-muted-green px-[0.625rem]'>
                                            <Icons.Mail />
                                        </div>
                                        <Input
                                            type='email'
                                            placeholder='email@email.com'
                                            className='rounded-l-none border-0 bg-muted-green'
                                            {...field}
                                        />
                                    </div>
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
                                    <div className='flex items-stretch'>
                                        <div className='grid place-content-center rounded-l-md border-r border-dark-green bg-muted-green px-[0.625rem]'>
                                            <Icons.PassKey />
                                        </div>
                                        <Input
                                            type='password'
                                            placeholder='********'
                                            className='rounded-l-none border-0 bg-muted-green'
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage className='text-red' />
                            </FormItem>
                        )}
                    />

                    <div className='pt-7'>
                        <Button
                            type='submit'
                            variant={'primary'}
                            className='flex w-full items-center gap-2'
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting && (
                                <Loader2 className='animate-spin' />
                            )}
                            <span className='text-xl font-bold'>Log In</span>
                        </Button>

                        <div className='text-center'>
                            <span className='text-sm text-gray-200'>
                                {`Don't have an account? `}
                                <Link
                                    href='/register'
                                    className='text-sm text-black'
                                >
                                    Sign Up
                                </Link>
                            </span>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
