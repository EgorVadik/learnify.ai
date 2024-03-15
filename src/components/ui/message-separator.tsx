import { checkIfSameDay, formatDateSeparator } from '@/lib/utils'

type Props = {
    date1: Date
    date2: Date
}

export const MessageSeparator = ({ date1, date2 }: Props) => {
    return !checkIfSameDay(date1, date2) ? (
        <div className='flex items-center gap-6 py-4'>
            <div className='bg-muted-gray h-[1px] w-full'></div>
            <p className='text-muted-gray whitespace-nowrap text-xs font-semibold'>
                {formatDateSeparator(date1)}
            </p>
            <div className='bg-muted-gray h-[1px] w-full'></div>
        </div>
    ) : null
}
