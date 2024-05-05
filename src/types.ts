import type {
    User,
    Note,
    Announcement,
    Task,
    Material,
    Question as PrismaQuestion,
} from '@prisma/client'
import { OptionalFileSchema } from './actions/course/schema'

export type CustomErrorMessages = {
    P2002?: string
    P2025?: string
    ZodError?: string
    Error?: string
}

export type ReturnValue =
    | {
          success: true
      }
    | {
          success: false
          error: string
      }

export type ReturnValueWithData<T> =
    | {
          success: true
          data: T
      }
    | {
          success: false
          error: string
      }

export type SimpleUser = Pick<User, 'id' | 'name' | 'email' | 'image' | 'role'>

export type Folder = Note & {
    children: Folder[]
}

export type CourseUsers = {
    course: {
        courseAdminId: string
        users: Pick<User, 'id' | 'role'>[]
    }
}

export type AnnouncementsWithUsers = Announcement & CourseUsers

export type TasksWithUsers = Task &
    CourseUsers & {
        exam: {
            duration: number
        } | null
    }

export type MaterialsWithUsers = Material & CourseUsers

export type Handlers = {
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void
    handleDelete: () => void
}

export type HandlersWithOptions = {
    handleAddOption: () => void
    handleDeleteOption: (index: number) => void
    handleOptionChange: (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number,
    ) => void
    handleAnswerChange: (answer: string) => void
}

export type HandlersTrueFalse = Pick<HandlersWithOptions, 'handleAnswerChange'>

export type Question = Omit<PrismaQuestion, 'examId'>

export type ExamWithDuration = Task & {
    exam: {
        duration: string
    }
}

export type EditFile<T> =
    | (Omit<T, 'courseId'> & {
          files: OptionalFileSchema
      })
    | null
