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
    courses: (Course & {
        courseStatuses: CourseStatus[]
    })[]
}

export const PreviousCourseRows = ({ courses }: PreviousCourseRowsProps) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className='text-[1.375rem] text-black'>
                        Course Name
                    </TableHead>
                    <TableHead className='text-[1.375rem] text-black'>
                        Date Joined
                    </TableHead>
                    <TableHead className='text-[1.375rem] text-black'>
                        Date Left
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {courses.map((course) => (
                    <TableRow key={course.id}>
                        <TableCell className='text-[1.375rem] text-black'>
                            {course.name}
                        </TableCell>
                        <TableCell className='text-[1.375rem] text-black'>
                            {formatDate(course.createdAt)}
                        </TableCell>
                        <TableCell className='text-[1.375rem] text-black'>
                            {formatDate(course.createdAt)}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
