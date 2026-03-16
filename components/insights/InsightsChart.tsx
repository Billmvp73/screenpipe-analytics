"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { formatDuration } from "@/lib/screenpipe"
import type { AppUsageSummary } from "@/types/screenpipe"

interface InsightsChartProps {
  data: AppUsageSummary[]
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: AppUsageSummary }[]
}) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm shadow-lg">
      <p className="font-medium text-zinc-100">{item.appName}</p>
      <p className="text-zinc-400">
        {formatDuration(item.totalMs)} · {item.percentage.toFixed(1)}%
      </p>
    </div>
  )
}

export function InsightsChart({ data }: InsightsChartProps) {
  const height = Math.max(300, data.length * 48)

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 24 }}>
          <XAxis
            type="number"
            tickFormatter={(ms: number) => formatDuration(ms)}
            stroke="#71717a"
            fontSize={12}
          />
          <YAxis
            type="category"
            dataKey="appName"
            width={140}
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="totalMs" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
