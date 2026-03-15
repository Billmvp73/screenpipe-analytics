'use client'

import { useMemo } from 'react'
import { formatDuration } from '@/lib/screenpipe'
import type { HourlyBucket } from '@/types/screenpipe'

interface Top5AppsProps {
  buckets: HourlyBucket[]
}

export function Top5Apps({ buckets }: Top5AppsProps) {
  const top5 = useMemo(() => {
    const totals: Record<string, { durationMs: number; color: string }> = {}

    for (const bucket of buckets) {
      for (const app of bucket.apps) {
        if (!totals[app.appName]) {
          totals[app.appName] = { durationMs: 0, color: app.color }
        }
        totals[app.appName].durationMs += app.durationMs
      }
    }

    return Object.entries(totals)
      .sort((a, b) => b[1].durationMs - a[1].durationMs)
      .slice(0, 5)
  }, [buckets])

  if (top5.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="mb-3 text-sm font-semibold text-zinc-300">Top 5 应用（今天）</h3>
        <p className="text-xs text-zinc-600">暂无数据</p>
      </div>
    )
  }

  const maxMs = top5[0]?.[1].durationMs ?? 1

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-zinc-300">Top 5 应用（今天）</h3>
      <div className="space-y-2">
        {top5.map(([appName, { durationMs, color }], idx) => (
          <div key={appName} className="flex items-center gap-2">
            <span className="w-4 shrink-0 text-xs text-zinc-600">{idx + 1}.</span>
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="min-w-0 flex-1 truncate text-xs text-zinc-300">{appName}</span>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-16 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(durationMs / maxMs) * 100}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span className="w-14 text-right text-xs text-zinc-400">
                {formatDuration(durationMs)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
