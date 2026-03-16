'use client'

import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatDuration, generateAppColorMap } from '@/lib/screenpipe'
import type { HourlyBucket } from '@/types/screenpipe'

interface PeriodPieChartProps {
  buckets: HourlyBucket[]
}

export function PeriodPieChart({ buckets }: PeriodPieChartProps) {
  const data = useMemo(() => {
    // Aggregate total time per app across all buckets
    const appTotals: Record<string, number> = {}
    for (const bucket of buckets) {
      for (const app of bucket.apps) {
        appTotals[app.appName] = (appTotals[app.appName] ?? 0) + app.durationMs
      }
    }

    const sorted = Object.entries(appTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)

    const colorMap = generateAppColorMap(sorted.map(([name]) => name))
    return sorted.map(([name, value]) => ({ name, value, color: colorMap[name] }))
  }, [buckets])

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="flex h-full flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-300">应用分布</h3>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-zinc-600">暂无数据</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-300">应用分布</h3>
      <ResponsiveContainer width="100%" height={200}>
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
            formatter={(value, name) => [formatDuration(Number(value ?? 0)), name]}
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
