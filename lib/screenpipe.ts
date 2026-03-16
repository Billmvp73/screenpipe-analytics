import { format } from 'date-fns'
import type {
  ScreenpipeSearchResponse,
  ContentItem,
  OCRContent,
  HourlyBucket,
  AppUsage,
} from '@/types/screenpipe'

// A fixed palette for app color assignment
const COLOR_PALETTE = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f97316', // orange
  '#14b8a6', // teal
  '#ec4899', // pink
  '#84cc16', // lime
]

export function generateAppColorMap(appNames: string[]): Record<string, string> {
  const map: Record<string, string> = {}
  appNames.forEach((name, i) => {
    map[name] = COLOR_PALETTE[i % COLOR_PALETTE.length]
  })
  return map
}

export async function fetchTimelineData(date: Date): Promise<HourlyBucket[]> {
  const dateStr = format(date, 'yyyy-MM-dd')
  // Use local time range — Screenpipe stores with local timezone
  const startTime = `${dateStr}T00:00:00`
  const endTime = `${dateStr}T23:59:59`

  let allItems: ContentItem[] = []
  const limit = 500
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const params = new URLSearchParams({
      content_type: 'ocr',
      limit: String(limit),
      offset: String(offset),
      start_time: startTime,
      end_time: endTime,
    })

    try {
      const response = await fetch(`/api/screenpipe/search?${params}`)
      if (!response.ok) {
        // If screenpipe is offline, return empty buckets
        break
      }
      const data: ScreenpipeSearchResponse = await response.json()

      // Check for offline indicator
      if ('screenpipe_offline' in data) {
        break
      }

      allItems = allItems.concat(data.data ?? [])
      const items = data.data ?? []

      if (items.length < limit || allItems.length >= data.pagination.total) {
        hasMore = false
      } else {
        offset += limit
        // Cap at 2000 items for performance
        if (allItems.length >= 2000) hasMore = false
      }
    } catch {
      break
    }
  }

  return aggregateByHour(allItems)
}

export function aggregateByHour(items: ContentItem[]): HourlyBucket[] {
  // Initialize 24 hourly buckets
  const buckets: Map<number, Map<string, number>> = new Map()
  for (let h = 0; h < 24; h++) {
    buckets.set(h, new Map())
  }

  // Assume each OCR frame represents ~5 seconds of usage
  const MS_PER_FRAME = 5_000

  for (const item of items) {
    if (item.type !== 'OCR') continue
    const content = item.content as OCRContent

    const ts = new Date(content.timestamp)
    const hour = ts.getHours()
    const appName = content.app_name || 'Unknown'

    const bucket = buckets.get(hour)!
    const current = bucket.get(appName) ?? 0
    bucket.set(appName, current + MS_PER_FRAME)
  }

  // Collect all app names and assign colors
  const allApps = new Set<string>()
  buckets.forEach((appMap) => {
    appMap.forEach((_, name) => allApps.add(name))
  })

  // Sort by total usage for consistent color assignment
  const appTotals: Record<string, number> = {}
  buckets.forEach((appMap) => {
    appMap.forEach((ms, name) => {
      appTotals[name] = (appTotals[name] ?? 0) + ms
    })
  })
  const sortedApps = Array.from(allApps).sort(
    (a, b) => (appTotals[b] ?? 0) - (appTotals[a] ?? 0)
  )
  const colorMap = generateAppColorMap(sortedApps)

  // Convert to HourlyBucket[]
  const result: HourlyBucket[] = []
  for (let h = 0; h < 24; h++) {
    const appMap = buckets.get(h)!
    const apps: AppUsage[] = []
    appMap.forEach((durationMs, appName) => {
      apps.push({
        appName,
        durationMs,
        color: colorMap[appName] ?? '#6b7280',
      })
    })
    // Sort apps by duration descending
    apps.sort((a, b) => b.durationMs - a.durationMs)
    const totalMs = apps.reduce((sum, a) => sum + a.durationMs, 0)
    result.push({ hour: h, apps, totalMs })
  }

  return result
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m`
  return '<1m'
}
