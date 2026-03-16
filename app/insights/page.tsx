"use client"

import { useState } from "react"
import { useInsightsData } from "@/hooks/useInsightsData"
import { InsightsChart } from "@/components/insights/InsightsChart"
import type { InsightsPeriod } from "@/types/screenpipe"

const tabs: { label: string; value: InsightsPeriod }[] = [
  { label: "今天", value: "day" },
  { label: "本周", value: "week" },
  { label: "本月", value: "month" },
]

export default function InsightsPage() {
  const [period, setPeriod] = useState<InsightsPeriod>("week")
  const { data, isLoading } = useInsightsData(period)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <h1 className="text-xl font-semibold text-zinc-100">统计分析</h1>

      <div className="flex items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPeriod(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              period === tab.value
                ? "bg-amber-400 text-zinc-950"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 rounded-md bg-zinc-800 animate-pulse"
            />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <InsightsChart data={data} />
      ) : (
        <div>
          <p className="text-zinc-500">暂无数据</p>
          <p className="text-zinc-600 text-sm mt-1">当前时段没有使用记录</p>
        </div>
      )}
    </div>
  )
}
