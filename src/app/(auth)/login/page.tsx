import { LoginForm } from '@/components/forms/login-form'
import { Logo } from '@/components/logo'
import { AuthFormWrapper } from '@/components/wrappers/auth-form-wrapper'
import { cn } from '@/lib/utils'
import React, { Suspense } from 'react'

export default function page() {
    return (
        <AuthFormWrapper>
            <div className='flex flex-col-reverse xl:flex-row'>
                <div className='flex w-full flex-col items-center justify-center gap-14 bg-white py-5 xl:max-w-sm'>
                    <div>
                        <Logo />
                    </div>

                    <div className='px-4 sm:px-0'>
                        <Suspense>
                            <LoginForm />
                        </Suspense>
                    </div>
                </div>
                <div className='relative grid w-full place-content-center bg-login-bg bg-cover bg-no-repeat max-xl:px-4 max-xl:py-10'>
                    <div
                        className={cn(
                            'max-w-md grow text-balance text-center text-3xl text-[#FFF]',
                            // merriweather.className,
                        )}
                    >
                        Transforming Education with AI: Learnify.ai - Your
                        All-Encompassing Solution for Seamless Learning II
                    </div>
                </div>
            </div>
        </AuthFormWrapper>
    )
}
