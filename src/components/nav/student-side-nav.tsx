import { STUDENT_DASHBOARD_NAV } from '@/lib/constants'
import { ClientSideNav } from './client-side-nav'
import { getServerAuthSession } from '@/server/auth'

export const StudentSideNav = async () => {
    const session = await getServerAuthSession()
    return (
        <ClientSideNav
            session={session!}
            navItems={STUDENT_DASHBOARD_NAV}
            profileHref='/dashboard/student/profile'
        />
    )
}
