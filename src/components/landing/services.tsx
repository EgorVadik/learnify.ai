'use client'

import LandingSvgLeft2 from '@/../public/svgs/landing-left-2.svg'
import LandingSvgRight2 from '@/../public/svgs/landing-right-2.svg'
import Image from 'next/image'
import { LANDING_PAGE_SERVICES } from '@/lib/constants'
import ScrollContainer from 'react-indiana-drag-scroll'

export const Services = () => {
    return (
        <section id='services' className='relative bg-white py-40'>
            <Image
                src={LandingSvgLeft2}
                alt='LandingSvgLeft2'
                className='absolute bottom-0 left-0'
            />

            <Image
                src={LandingSvgRight2}
                alt='LandingSvgRight2'
                className='absolute bottom-0 right-0'
            />
            <ScrollContainer
                className='hidden-scrollbar container relative z-10 flex w-full items-center gap-16'
                hideScrollbars={false}
            >
                {LANDING_PAGE_SERVICES.map((service, index) => (
                    <div
                        key={index}
                        className='flex flex-col items-center justify-center gap-4'
                    >
                        <div className='grid h-28 w-28 place-content-center rounded-full bg-blue-400 p-6'>
                            {service.icon()}
                        </div>
                        <h3 className='whitespace-nowrap text-[1.375rem]'>
                            {service.title}
                        </h3>
                    </div>
                ))}
            </ScrollContainer>
        </section>
    )
}
