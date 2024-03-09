import LandingPeople from '@/../public/svgs/landing-people.svg'
import { cn } from '@/lib/utils'
import Image from 'next/image'
// import { montserrat, roboto } from '@/app/layout'

export const About = () => {
    return (
        <section id='about' className='relative z-10 bg-blue-400'>
            <div className='mx-auto grid max-w-[1700px] gap-10 px-8 py-12 text-white xl:grid-cols-2 xl:gap-40'>
                <div className='row-start-2 space-y-16 xl:row-start-auto'>
                    <h2
                        className={cn(
                            'text-4xl font-normal',
                            // montserrat.className,
                        )}
                    >
                        About Us
                    </h2>

                    <p className={cn('text-2xl')}>
                        {/* <p className={cn('text-2xl', roboto.className)}> */}
                        <span>
                            At Learnify.ai, {`we're`} passionate about reshaping
                            the future of education. By harnessing the power of
                            artificial intelligence, we aim to make learning a
                            personalized, accessible, and enriching experience.
                            Whether {`you're`} a student embarking on your
                            educational journey or an educator seeking
                            innovative tools, Learnify.ai is your dedicated
                            partner.
                        </span>
                        <br />
                        <br />
                        <span>
                            Join us as we strive to empower minds and inspire
                            the next generation of learners with cutting-edge
                            technology and a commitment to educational
                            excellence
                        </span>
                    </p>
                </div>

                <div>
                    <Image
                        src={LandingPeople}
                        alt='LandingPeople'
                        className='mx-auto xl:mx-0'
                    />
                </div>
            </div>
        </section>
    )
}
