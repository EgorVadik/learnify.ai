'use client'

import { useMounted } from '@/hooks/use-mounted'
import { useMediaQuery } from '@mantine/hooks'
import {
    PieChart,
    Pie,
    Tooltip,
    Legend,
    Cell,
    ResponsiveContainer,
} from 'recharts'

type DonutChartProps = {
    data: {
        name: string
        value: number
    }[]
}

export const DonutChart = ({ data }: DonutChartProps) => {
    const { mounted } = useMounted()
    const matches = useMediaQuery('(min-width: 640px)')
    if (!mounted) return null

    return (
        <div className='flex w-full items-center justify-center'>
            <ResponsiveContainer width={matches ? 330 : 230} height={230}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey='value'
                        nameKey='name'
                        cx='50%'
                        cy='50%'
                        innerRadius={50}
                        outerRadius={80}
                    >
                        {data.map((entry) => (
                            <Cell
                                key={entry.name}
                                fill={
                                    entry.name === 'Teachers'
                                        ? '#213555'
                                        : '#088395'
                                }
                            />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend className={matches ? 'text-base' : 'text-xs'} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
