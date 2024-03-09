import type { User, Note, Announcement, Task, Material } from '@prisma/client'

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

export type TasksWithUsers = Task & CourseUsers

export type MaterialsWithUsers = Material & CourseUsers
