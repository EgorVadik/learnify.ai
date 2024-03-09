import React from 'react'
import { Calendar as CalendarUi } from '@/components/ui/calendar'

export const Calender = () => {
    return (
        <CalendarUi
            mode='single'
            selected={new Date()}
            className='rounded-2xl bg-blue-100 text-xs font-medium shadow-shadow-2 [&_.rdp-vhidden]:hidden'
            captionLayout='dropdown-buttons'
            classNames={{
                day_selected:
                    'rounded-[100%] border-2 border-turq-600 text-turq-600',
                dropdown: 'text-sm text-turq-600 w-fit bg-transparent',
                caption_dropdowns: 'flex gap-2',
                dropdown_month: 'flex text-turq-600 underline',
                dropdown_year: 'flex text-turq-600 underline',
            }}
            fromYear={new Date().getFullYear() - 10}
            toYear={new Date().getFullYear() + 10}
        />
    )
}
