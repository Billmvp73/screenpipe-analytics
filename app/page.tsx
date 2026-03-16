'use client'

import { useState } from 'react'
import { format, addDays, subDays, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTimelineData } from '@/hooks/useTimelineData'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { TimelineChart } from '@/components/timeline/TimelineChart'
import { Top5Apps } from '@/components/timeline/Top5Apps'
import { PeriodPieChart } from '@/components/timeline/PeriodPieChart'

function DateNav({
  date,
  onPrev,
  onNext,
}: {
  date: Date
  onPrev: () => void
  onNext: () => void
}) {
  const canGoNext = !isToday(date)

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        aria-label="前一天"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="min-w-[110px] text-center text-sm font-medium text-zinc-200">
        {format(date, 'yyyy-MM-dd')}
        {isToday(date) && (
          <span className="ml-1.5 text-xs text-zinc-500">今天</span>
        )}
      </span>
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="后一天"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-14 animate-pulse rounded bg-zinc-800" />
      <div className="h-7 flex-1 animate-pulse rounded bg-zinc-800" />
    </div>
  )
}

export default function HomePage() {
  const [date, setDate] = useState<Date>(new Date())
  const { data: buckets, isLoading } = useTimelineData(date)

  const safeData = buckets ?? []

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-100">时间轴视图</h1>
        <DateNav
          date={date}
          onPrev={() => setDate((d) => subDays(d, 1))}
          onNext={() => setDate((d) => addDays(d, 1))}
        />
      </div>

      {/* Offline banner */}
      <OfflineBanner />

      {/* Timeline chart */}
      {isLoading ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-1">
          <div className="mb-3 h-4 w-32 animate-pulse rounded bg-zinc-800" />
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : (
        <TimelineChart buckets={safeData} />
      )}

      {/* Bottom two columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {isLoading ? (
          <>
            <div className="h-40 animate-pulse rounded-lg bg-zinc-900" />
            <div className="h-40 animate-pulse rounded-lg bg-zinc-900" />
          </>
        ) : (
          <>
            <Top5Apps buckets={safeData} />
            <PeriodPieChart buckets={safeData} />
          </>
        )}
      </div>
    </div>
  )
}
