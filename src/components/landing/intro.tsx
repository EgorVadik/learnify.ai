import LandingSvgLeft1 from '@/../public/svgs/landing-left-1.svg'
import LandingSvgRight1 from '@/../public/svgs/landing-right-1.svg'
import LandingComputers from '@/../public/svgs/landing-computers.svg'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
// import { merriweather, montserrat, raleway } from '@/app/layout'

export const Intro = () => {
    return (
        <section
            id='intro'
            className='relative flex items-center justify-center bg-white px-8'
            style={{
                minHeight: LandingSvgLeft1.height + 56,
            }}
        >
            <Image
                src={LandingSvgLeft1}
                alt='LandingSvgLeft1'
                className='absolute left-0 top-0 hidden 2xl:flex'
            />
            <Image
                src={LandingSvgRight1}
                alt='LandingSvgRight1'
                className='absolute bottom-0 right-0 hidden 2xl:flex'
            />

            <div
                className={cn(
                    'relative z-10 grid items-end pb-10 lg:grid-cols-2 lg:gap-10 lg:pb-0',
                    // montserrat.className,
                )}
            >
                <div className='row-start-2 max-w-xl space-y-9 lg:row-start-auto'>
                    <h2 className='text-4xl'>
                        Learnify.ai: <br /> Unleashing Intelligent Learning
                    </h2>
                    <p className='text-[1.375rem]'>
                        Empower your education with Learnify.ai - where
                        artificial intelligence meets personalized learning for
                        a smarter, more engaging future
                    </p>

                    <span
                        className={cn(
                            'block text-[1.375rem] text-black',
                            // merriweather.className,
                        )}
                    >
                        Sign up now
                    </span>
                    <div className='grid items-center gap-4 sm:grid-cols-2 sm:gap-8 '>
                        <Link
                            href='/register?role=student'
                            className={buttonVariants({
                                variant: 'outline',
                                size: 'lg',
                                // className: cn('px-8', raleway.className),
                            })}
                        >
                            <span className='text-2xl font-bold'>
                                As a student
                            </span>
                        </Link>
                        <Link
                            href='/register?role=teacher'
                            className={buttonVariants({
                                variant: 'primary',
                                size: 'lg',
                                // className: cn('px-8', raleway.className),
                            })}
                        >
                            <span className='text-2xl font-bold'>
                                As a teacher
                            </span>
                        </Link>
                    </div>
                </div>

                <div>
                    <Image src={LandingComputers} alt='LandingComputers' />
                </div>
            </div>
        </section>
    )
}
