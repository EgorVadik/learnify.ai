import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '../ui/button'
import { getUserInvitations } from '@/actions/course'
import { formatDate } from '@/lib/utils'

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
                    <TableHead className='text-[1.375rem] text-black'>
                        Course Name
                    </TableHead>
                    <TableHead className='text-[1.375rem] text-black'>
                        Sent By
                    </TableHead>
                    <TableHead className='text-[1.375rem] text-black'>
                        Date
                    </TableHead>
                    <TableHead className='w-fit'></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invitations.map((invitation) => (
                    <TableRow key={invitation.id}>
                        <TableCell className='text-[1.375rem] text-black'>
                            {invitation.course.name}
                        </TableCell>
                        <TableCell className='text-[1.375rem] text-black'>
                            {invitation.sender.name}
                        </TableCell>
                        <TableCell className='text-[1.375rem] text-black'>
                            {formatDate(invitation.createdAt)}
                        </TableCell>
                        <TableCell className='flex justify-end text-right'>
                            <div className='flex items-center gap-5'>
                                <Button variant={'primary'}>
                                    <span className='text-xl font-bold'>
                                        Accept
                                    </span>
                                </Button>
                                <Button
                                    variant={'outline'}
                                    className='border-red-primary text-red-primary'
                                >
                                    <span className='text-xl font-bold'>
                                        Decline
                                    </span>
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
