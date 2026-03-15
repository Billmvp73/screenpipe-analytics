'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatDuration } from '@/lib/screenpipe'
import type { HourlyBucket } from '@/types/screenpipe'

interface PeriodPieChartProps {
  buckets: HourlyBucket[]
}

const PERIODS = [
  { label: '上午', range: [6, 12], color: '#f59e0b' },
  { label: '下午', range: [12, 18], color: '#6366f1' },
  { label: '晚上', range: [18, 24], color: '#8b5cf6' },
]

export function PeriodPieChart({ buckets }: PeriodPieChartProps) {
  const data = useMemo(() => {
    return PERIODS.map(({ label, range, color }) => {
      const ms = buckets
        .filter((b) => b.hour >= range[0] && b.hour < range[1])
        .reduce((sum, b) => sum + b.totalMs, 0)
      return { name: label, value: ms, color }
    }).filter((d) => d.value > 0)
  }, [buckets])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-300">时段分布</h3>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-zinc-600">暂无数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-300">时段分布</h3>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatDuration(Number(value ?? 0)), '']}
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #3f3f46',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#d4d4d8',
            }}
          />
          <Legend
            iconSize={8}
            iconType="circle"
            formatter={(value) => (
              <span style={{ color: '#a1a1aa', fontSize: '11px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
