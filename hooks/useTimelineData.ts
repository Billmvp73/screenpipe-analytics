'use client'

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { format } from 'date-fns'
import { fetchTimelineData } from '@/lib/screenpipe'
import type { HourlyBucket } from '@/types/screenpipe'

export function useTimelineData(date: Date) {
  const dateKey = format(date, 'yyyy-MM-dd')

  return useQuery<HourlyBucket[]>({
    queryKey: ['timeline', dateKey],
    queryFn: () => fetchTimelineData(date),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    placeholderData: keepPreviousData,
  })
}
