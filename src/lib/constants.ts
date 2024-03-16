import { Icons } from '@/components/icons'

export const NO_NEED_AUTH_ROUTES = ['/register', '/login', '/']

export const LANDING_PAGE_NAV = [
    {
        title: 'Home',
        href: '#intro',
    },
    {
        title: 'About',
        href: '#about',
    },
    {
        title: 'Contact',
        href: '#contact',
    },
] as const

export const STUDENT_DASHBOARD_NAV = [
    {
        title: 'Dashboard',
        href: '/dashboard/student',
    },
    {
        title: 'Courses',
        href: '/dashboard/student/courses',
    },
    {
        title: 'Chat',
        href: '/dashboard/student/chat',
    },
    {
        title: 'Notes',
        href: '/dashboard/student/notes',
    },
    {
        title: 'Previous Courses',
        href: '/dashboard/student/previous-courses',
    },
] as const

export const TEACHER_DASHBOARD_NAV = [
    {
        title: 'Dashboard',
        href: '/dashboard/teacher',
    },
    {
        title: 'Courses',
        href: '/dashboard/teacher/courses',
    },
    {
        title: 'Chat',
        href: '/dashboard/teacher/chat',
    },
    {
        title: 'Previous Courses',
        href: '/dashboard/teacher/previous-courses',
    },
] as const

export const LANDING_PAGE_SERVICES = [
    {
        title: 'Real-time Feedback',
        icon: Icons.Realtime,
    },
    {
        title: 'AI - Enhanced Teaching',
        icon: Icons.ArtificialIntelligence,
    },
    {
        title: 'Smart Analytics',
        icon: Icons.Analytics,
    },
    {
        title: '24/7 Learning Access',
        icon: Icons.TwentyFourSeven,
    },
    {
        title: 'Easy Communication',
        icon: Icons.Chat,
    },
] as const

export const nestedChildrenLoop = (depth: number) => {
    let result: Record<string, any> = {
        children: true,
    }

    for (let i = 0; i < depth; i++) {
        result = { children: { include: result } }
    }

    return result as {
        children: {
            include: {
                children: true
            }
        }
    }
}
