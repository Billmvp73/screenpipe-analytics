"use client"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { startOfDay, startOfWeek, startOfMonth } from "date-fns"
import { fetchInsightsData } from "@/lib/screenpipe"
import type { AppUsageSummary, InsightsPeriod } from "@/types/screenpipe"

export function useInsightsData(period: InsightsPeriod) {
  const now = new Date()
  const today = startOfDay(now)

  let startDate: Date
  if (period === "day") startDate = today
  else if (period === "week") startDate = startOfWeek(now, { weekStartsOn: 1 }) // Monday
  else startDate = startOfMonth(now)

  const endDate = now

  return useQuery<AppUsageSummary[]>({
    queryKey: ["insights", period],
    queryFn: () => fetchInsightsData(startDate, endDate),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  })
}
