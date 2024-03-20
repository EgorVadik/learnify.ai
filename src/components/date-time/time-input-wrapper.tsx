// import * as React from 'react'
// import { Clock } from 'lucide-react'
// import { Label } from '@/components/ui/label'
// import { TimePickerInput } from './time-picker-input'

// interface TimeInputWrapperProps {
//     date: Date | undefined
//     setDate: (date: Date | undefined) => void
// }

// export const TimeInputWrapper = ({ date, setDate }: TimeInputWrapperProps) => {
//     const minuteRef = React.useRef<HTMLInputElement>(null)
//     const hourRef = React.useRef<HTMLInputElement>(null)
//     const secondRef = React.useRef<HTMLInputElement>(null)

//     return (
//         <div className='flex items-end gap-2'>
//             <div className='grid gap-1 text-center'>
//                 <Label htmlFor='hours' className='text-xs'>
//                     Hours
//                 </Label>
//                 <TimePickerInput
//                     picker='hours'
//                     date={date}
//                     setDate={setDate}
//                     ref={hourRef}
//                     onRightFocus={() => minuteRef.current?.focus()}
//                 />
//             </div>
//             <div className='grid gap-1 text-center'>
//                 <Label htmlFor='minutes' className='text-xs'>
//                     Minutes
//                 </Label>
//                 <TimePickerInput
//                     picker='minutes'
//                     date={date}
//                     setDate={setDate}
//                     ref={minuteRef}
//                     onLeftFocus={() => hourRef.current?.focus()}
//                     onRightFocus={() => secondRef.current?.focus()}
//                 />
//             </div>
//             <div className='grid gap-1 text-center'>
//                 <Label htmlFor='seconds' className='text-xs'>
//                     Seconds
//                 </Label>
//                 <TimePickerInput
//                     picker='seconds'
//                     date={date}
//                     setDate={setDate}
//                     ref={secondRef}
//                     onLeftFocus={() => minuteRef.current?.focus()}
//                 />
//             </div>
//             <div className='flex h-10 items-center'>
//                 <Clock className='ml-2 h-4 w-4' />
//             </div>
//         </div>
//     )
// }

import * as React from 'react'
import { Label } from '@/components/ui/label'
import { TimePickerInput } from './time-picker-input'
import { TimePeriodSelect } from './period-select'
import { Period } from '@/lib/time-picker-utils'

interface TimeInputWrapperProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
}

export function TimeInputWrapper({ date, setDate }: TimeInputWrapperProps) {
    const [period, setPeriod] = React.useState<Period>('PM')

    const minuteRef = React.useRef<HTMLInputElement>(null)
    const hourRef = React.useRef<HTMLInputElement>(null)
    const secondRef = React.useRef<HTMLInputElement>(null)
    const periodRef = React.useRef<HTMLButtonElement>(null)

    return (
        <div className='flex items-end gap-2'>
            <div className='grid gap-1 text-center'>
                <Label htmlFor='hours' className='text-xs'>
                    Hours
                </Label>
                <TimePickerInput
                    picker='12hours'
                    period={period}
                    date={date}
                    setDate={(date) => {
                        console.log(date)
                        setDate(date)
                    }}
                    ref={hourRef}
                    onRightFocus={() => minuteRef.current?.focus()}
                />
            </div>
            <div className='grid gap-1 text-center'>
                <Label htmlFor='minutes' className='text-xs'>
                    Minutes
                </Label>
                <TimePickerInput
                    picker='minutes'
                    date={date}
                    setDate={setDate}
                    ref={minuteRef}
                    onLeftFocus={() => hourRef.current?.focus()}
                    onRightFocus={() => secondRef.current?.focus()}
                />
            </div>
            <div className='grid gap-1 text-center'>
                <Label htmlFor='seconds' className='text-xs'>
                    Seconds
                </Label>
                <TimePickerInput
                    picker='seconds'
                    date={date}
                    setDate={setDate}
                    ref={secondRef}
                    onLeftFocus={() => minuteRef.current?.focus()}
                    onRightFocus={() => periodRef.current?.focus()}
                />
            </div>
            <div className='grid gap-1 text-center'>
                <Label htmlFor='period' className='text-xs'>
                    Period
                </Label>
                <TimePeriodSelect
                    period={period}
                    setPeriod={setPeriod}
                    date={date}
                    setDate={setDate}
                    ref={periodRef}
                    onLeftFocus={() => secondRef.current?.focus()}
                />
            </div>
        </div>
    )
}
