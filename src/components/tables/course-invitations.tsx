import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getUserInvitations } from '@/actions/course'
import { formatDate } from '@/lib/utils'
import { AcceptCourseInvitationButton } from '../buttons/accept-course-invitation-button'
import { DeclineCourseInvitationButton } from '../buttons/decline-course-invitation-button'

export const CourseInvitations = async () => {
    const invitations = await getUserInvitations()

    if (invitations.length === 0) {
        return (
            <div className='text-center text-[1.375rem] font-medium text-black-full'>
                No course invitations found.
            </div>
        )
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                        Course Name
                    </TableHead>
                    <TableHead className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                        Sent By
                    </TableHead>
                    <TableHead className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                        Date
                    </TableHead>
                    <TableHead className='w-fit'></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                        <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                            {invitation.course.name}
                        </TableCell>
                        <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                            {invitation.sender.name}
                        </TableCell>
                        <TableCell className='whitespace-nowrap text-base text-black sm:text-[1.375rem]'>
                            {formatDate(invitation.createdAt)}
                        </TableCell>
                        <TableCell className='flex justify-end text-right'>
                            <div className='flex items-center gap-5'>
                                <AcceptCourseInvitationButton
                                    courseId={invitation.courseId}
                                />
                                <DeclineCourseInvitationButton
                                    courseId={invitation.courseId}
                                />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
