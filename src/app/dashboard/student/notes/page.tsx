import { NotificationAPIButton } from '@/components/buttons/notification-api-button'
import { NavToggle } from '@/components/nav/nav-toggle'
import { getServerAuthSession } from '@/server/auth'

export default async function page() {
    const session = await getServerAuthSession()

    return (
        <main className='relative flex h-dvh w-full items-center justify-center text-balance px-5 text-center text-3xl font-bold text-gray-200'>
            Select a note to view or edit
            <div className='absolute right-10 top-10 flex items-center gap-2'>
                <NotificationAPIButton userId={session?.user.id || 'user-id'} />
                <NavToggle />
            </div>
        </main>
    )
}
