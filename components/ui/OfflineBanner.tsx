'use client'

import { useScreenpipeHealth } from '@/hooks/useScreenpipeHealth'

export function OfflineBanner() {
  const { data: health } = useScreenpipeHealth()

  if (!health || health.screenpipe_online) {
    return null
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
      <span className="text-base">⚠️</span>
      <span>Screenpipe 离线 — 无法加载实时数据。请确认 Screenpipe 已在 localhost:3030 运行。</span>
    </div>
  )
}
