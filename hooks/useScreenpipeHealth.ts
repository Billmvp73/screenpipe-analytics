'use client'

import { useQuery } from '@tanstack/react-query'
import type { HealthResponse } from '@/types/screenpipe'

async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health')
  if (!response.ok) {
    throw new Error('Health check failed')
  }
  return response.json()
}

export function useScreenpipeHealth() {
  return useQuery<HealthResponse>({
    queryKey: ['screenpipe-health'],
    queryFn: fetchHealth,
    refetchInterval: 30_000,
    retry: false,
  })
}
