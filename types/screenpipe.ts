export interface ScreenpipeSearchResponse {
  data: ContentItem[]
  pagination: {
    limit: number
    offset: number
    total: number
  }
}

export interface ContentItem {
  type: 'OCR' | 'Audio' | 'UI'
  content: OCRContent | AudioContent | UIContent
}

export interface OCRContent {
  frame_id: number
  text: string
  timestamp: string
  file_path: string
  offset_index: number
  app_name: string
  window_name: string
  tags: string[]
  frame?: string
}

export interface AudioContent {
  chunk_id: number
  transcription: string
  timestamp: string
  file_path: string
  offset_index: number
  tags: string[]
  device_name: string
  device_type: string
  speaker_id?: number
}

export interface UIContent {
  id: number
  text: string
  timestamp: string
  app_name: string
  window_name: string
  initial_traversal_at: string
  file_path: string
  offset_index: number
}

export interface AppUsage {
  appName: string
  durationMs: number
  color: string
}

export interface HourlyBucket {
  hour: number // 0-23
  apps: AppUsage[]
  totalMs: number
}

export interface HealthResponse {
  status: 'ok' | 'degraded'
  screenpipe_online: boolean
  timestamp: string
}

export type InsightsPeriod = "day" | "week" | "month"

export interface AppUsageSummary {
  appName: string
  totalMs: number
  color: string
  percentage: number
}
