'use client'

import { useMemo } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatDuration } from '@/lib/screenpipe'
import type { HourlyBucket } from '@/types/screenpipe'

interface TimelineChartProps {
  buckets: HourlyBucket[]
}

const DISPLAY_HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 06-23

export function TimelineChart({ buckets }: TimelineChartProps) {
  const bucketMap = useMemo(() => {
    const map: Record<number, HourlyBucket> = {}
    for (const b of buckets) {
      map[b.hour] = b
    }
    return map
  }, [buckets])

  return (
    <TooltipProvider delay={200}>
      <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <div className="min-w-[600px]">
          {/* Legend row */}
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-zinc-400">
            <span className="font-medium text-zinc-300">应用使用时间轴</span>
            <span className="ml-auto text-zinc-600">每行 = 1小时，色块宽度 ∝ 使用时长</span>
          </div>

          {/* Timeline rows */}
          <div className="space-y-1">
            {DISPLAY_HOURS.map((hour) => {
              const bucket = bucketMap[hour]
              const apps = bucket?.apps ?? []
              const totalMs = bucket?.totalMs ?? 0

              return (
                <div key={hour} className="flex items-center gap-2">
                  {/* Hour label */}
                  <span className="w-14 shrink-0 text-right text-xs text-zinc-500">
                    {String(hour).padStart(2, '0')}:00
                  </span>

                  {/* Bar area */}
                  <div className="relative flex h-7 flex-1 overflow-hidden rounded bg-zinc-800">
                    {apps.length === 0 ? (
                      <div className="flex w-full items-center px-2">
                        <span className="text-xs text-zinc-600">— 无记录</span>
                      </div>
                    ) : (
                      apps.map((app) => {
                        const widthPct = totalMs > 0 ? (app.durationMs / totalMs) * 100 : 0
                        return (
                          <Tooltip key={app.appName}>
                            <TooltipTrigger
                              render={
                                <div
                                  className="flex h-full cursor-default items-center overflow-hidden px-1 text-xs text-white/90 transition-opacity hover:opacity-90"
                                  style={{
                                    width: `${widthPct}%`,
                                    backgroundColor: app.color,
                                    minWidth: widthPct > 3 ? undefined : '4px',
                                  }}
                                />
                              }
                            >
                              {widthPct > 8 && (
                                <span className="truncate text-[11px]">{app.appName}</span>
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              <div className="font-medium">{app.appName}</div>
                              <div className="text-zinc-400">{formatDuration(app.durationMs)}</div>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
