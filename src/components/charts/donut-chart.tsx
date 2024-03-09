'use client'

import { useMounted } from '@/hooks/use-mounted'
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts'

type DonutChartProps = {
    data: {
        name: string
        value: number
        percent: number
    }[]
}

export const DonutChart = ({ data }: DonutChartProps) => {
    const { mounted } = useMounted()
    if (!mounted) return null

    return (
        <div className='flex w-full items-center justify-center'>
            <PieChart width={330} height={230}>
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
                <Legend />
            </PieChart>
        </div>
    )
}
