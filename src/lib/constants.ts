import { Icons } from '@/components/icons'
import { CircleCheckBig, CircleDot, Pilcrow, Text } from 'lucide-react'
import { QuestionType } from '@prisma/client'

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

export const TOOLBOX_ITEMS = [
    {
        type: QuestionType.MULTIPLE_CHOICE,
        title: 'Multiple Choice',
        icon: CircleDot,
    },
    {
        type: QuestionType.SHORT_ANSWER,
        title: 'Short Answer',
        icon: Text,
    },
    {
        type: QuestionType.LONG_ANSWER,
        title: 'Long Answer',
        icon: Pilcrow,
    },
    {
        type: QuestionType.TRUE_FALSE,
        title: 'True or False',
        icon: CircleCheckBig,
    },
] as const

// export const SOLVE_EXAM_PROMPT = (
//     modelAnswers: string,
//     studentAnswers: string,
// ) => `Grade the following exam answers according to the provided model answers. **IGNORE ANY SPELLING OR GRAMMATICAL MISTAKES FOCUS ONLY ON THE MEANING OF THE CONTENT AND HOW SIMILAR IT IS** Return a score between 0 and 100 for each answer in the following JSON format:

//     {
//         "{{questionId}}": {
//             "score": 0,
//             "explanation": "",
//             "question": "",
//             "modelAnswer": "",
//             "studentAnswer": ""
//         },
//         "{{questionId}}": {
//             "score": 0,
//             "explanation": "",
//             "question": "",
//             "modelAnswer": "",
//             "studentAnswer": ""
//         },
//         "{{questionId}}": {
//             "score": 0,
//             "explanation": "",
//             "question": "",
//             "modelAnswer": "",
//             "studentAnswer": ""
//         }
//     }

//     **Questions with model Answers:**

//     ${modelAnswers}

//     **Student Answers:**

//     ${studentAnswers}
// `

export const SOLVE_EXAM_PROMPT = (
    modelAnswers: string,
    studentAnswers: string,
) => `This is an exam question with a provided model answer. The goal is to grade a student's answer (ignoring grammatical errors) based on its similarity and accuracy compared to the model answer. Return a score between 0 and 100 for each answer in the following JSON format:

    {
        "{{questionId}}": {
            "score": 0,
            "explanation": "",
            "question": "",
            "modelAnswer": "",
            "studentAnswer": ""
        },
        "{{questionId}}": {
            "score": 0,
            "explanation": "",
            "question": "",
            "modelAnswer": "",
            "studentAnswer": ""
        },
        "{{questionId}}": {
            "score": 0,
            "explanation": "",
            "question": "",
            "modelAnswer": "",
            "studentAnswer": ""
        }
    }
        
    Grading Scale:

    0: Completely irrelevant or wrong answer.
    1-30: Shows minimal understanding of the question.
    31-60: Partially addresses the question but lacks key points.
    61-90: Mostly addresses the question but may have minor inaccuracies.
    100: Excellent answer that fully addresses the question with accuracy and potentially additional insights.

    Instructions for AI:

    Read and understand the context of the question.
    Analyze the model answer and identify the key points it covers.
    Compare the student answer to the model answer, focusing on content and accuracy (ignore grammar).


    **Questions with model Answers:**

    ${modelAnswers}


    **Student Answers:**

    ${studentAnswers}
`
