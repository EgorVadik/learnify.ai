import type { Config } from 'tailwindcss'

const config = {
    darkMode: ['class'],
    content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            screens: {
                xs: '480px',
            },
            fontSize: {
                heading: '2rem',
            },
            colors: {
                black: 'var(--black-1a)',
                white: 'var(--white-f0)',
                'white-full': '#ffffff',
                'black-full': '#000000',
                'black-muted': 'rgba(0, 0, 0, 0.80)',
                'muted-green': 'rgba(8, 131, 149, 0.05)',
                'dark-green': 'rgba(8, 131, 149, 0.30)',
                'muted-gray': 'rgba(128, 128, 128, 0.50)',
                blue: {
                    100: 'var(--blue-100)',
                    200: 'var(--blue-200)',
                    300: 'var(--blue-300)',
                    400: 'var(--blue-400)',
                },
                gray: {
                    100: 'var(--gray-100)',
                    200: 'var(--gray-200)',
                },
                red: {
                    primary: 'var(--red)',
                    muted: 'rgba(179, 0, 0, 0.80)',
                },
                turq: {
                    100: 'var(--turq-100)',
                    200: 'var(--turq-200)',
                    300: 'var(--turq-300)',
                    600: 'var(--turq-600)',
                    muted: 'rgba(100, 204, 197, 0.25)',
                },
                yellow: {
                    100: 'var(--yellow-100)',
                    200: 'var(--yellow-200)',
                    300: 'var(--yellow-300)',
                },
            },
            backgroundImage: {
                'login-bg': 'url("/images/login-bg.jpg")',
                'register-bg': 'url("/images/register-bg.jpg")',
            },
            boxShadow: {
                shadow: 'var(--shadow)',
                'shadow-2': 'var(--shadow-2)',
                big: '0px 0px 30px 1px rgba(0, 0, 0, 0.25)',
                'calendar-shadow': '0px 16px 32px 0px #4E515314',
            },
            gridTemplateColumns: {
                'auto-20': 'repeat(auto-fill, minmax(20rem, 20rem))',
            },
            borderRadius: {
                10: '0.625rem',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
        },
    },
    plugins: [
        require('tailwindcss-animate'),
        require('@tailwindcss/typography'),
    ],
} satisfies Config

export default config
