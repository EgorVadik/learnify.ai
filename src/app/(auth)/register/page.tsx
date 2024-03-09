import { RegisterForm } from '@/components/forms/register-form'
import { Logo } from '@/components/logo'
import { AuthFormWrapper } from '@/components/wrappers/auth-form-wrapper'
import React, { Suspense } from 'react'

export default function page() {
    return (
        <AuthFormWrapper>
            <div className='flex flex-col lg:flex-row'>
                <div className='bg-register-bg relative grid w-full place-content-center bg-cover bg-no-repeat max-lg:py-10 lg:max-w-lg'>
                    <div
                        className={
                            'max-w-md text-balance text-center text-[#FFF]'
                        }
                    >
                        <h2 className='text-3xl'>Welcome to Learnify.ai</h2>
                        <p className='text-[0.9375rem'>
                            Your Gateway to Intelligent Learning!
                        </p>
                    </div>
                </div>
                <div className='flex w-full flex-col items-center justify-center gap-14 bg-white px-10 py-16 sm:px-20'>
                    <div className='self-end'>
                        <Logo />
                    </div>

                    <Suspense>
                        <RegisterForm />
                    </Suspense>
                </div>
            </div>
        </AuthFormWrapper>
    )
}
