import { Intro } from '@/components/landing/intro'
import { About } from '@/components/landing/about'
import { Services } from '@/components/landing/services'
import { Footer } from '@/components/landing/footer'

export default function page() {
    return (
        <main className='overflow-hidden'>
            <Intro />
            <About />
            <Services />
            <Footer />
        </main>
    )
}
