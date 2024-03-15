import {
    Table,
    TableBody,
    TableRow,
    TableHead,
    TableHeader,
    TableCell,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import type { Course, CourseStatus } from '@prisma/client'

type PreviousCourseRowsProps = {
    courses: Course[]
}

export const PreviousCourseRows = ({ courses }: PreviousCourseRowsProps) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                        Course Name
                    </TableHead>
                    <TableHead className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                        Date Joined
                    </TableHead>
                    <TableHead className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                        Date Left
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {courses.map((course) => (
                    <TableRow key={course.id}>
                        <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                            {course.name}
                        </TableCell>
                        <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                            {formatDate(course.createdAt)}
                        </TableCell>
                        <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                            {formatDate(course.createdAt)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
