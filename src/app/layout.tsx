import type { Metadata } from 'next'
// import { Montserrat, Roboto, Raleway, Merriweather } from 'next/font/google'
import { ClientProviders } from '@/components/providers/client-providers'
import { Toaster } from '@/components/ui/sonner'
import { Toaster as NotificationToaster } from '@/components/ui/toaster'
import './globals.css'

// const montserrat = Montserrat({
//     subsets: ['latin'],
//     weight: ['400', '500', '700', '800'],
// })
// const roboto = Roboto({ weight: ['400', '500', '700'], subsets: ['latin'] })
// const raleway = Raleway({ subsets: ['latin'], weight: ['400', '500', '700'] })
// const merriweather = Merriweather({
//     subsets: ['latin'],
//     weight: ['400', '700'],
// })

// export { montserrat, roboto, raleway, merriweather }

export const metadata: Metadata = {
    title: 'Learnify.ai',
    description: 'Learnify.ai',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' className='overscroll-y-none'>
            <body>
                <ClientProviders>
                    {children}
                    <Toaster />
                    <NotificationToaster />
                </ClientProviders>
            </body>
        </html>
    )
}
