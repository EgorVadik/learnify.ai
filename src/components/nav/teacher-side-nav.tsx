import { TEACHER_DASHBOARD_NAV } from '@/lib/constants'
import { getServerAuthSession } from '@/server/auth'
import { ClientSideNav } from './client-side-nav'

export const TeacherSideNav = async () => {
    const session = await getServerAuthSession()
    return (
        <ClientSideNav
            session={session!}
            navItems={TEACHER_DASHBOARD_NAV}
            profileHref='/dashboard/teacher/profile'
        />
    )
}
