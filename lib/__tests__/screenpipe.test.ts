import { aggregateByHour, formatDuration } from '@/lib/screenpipe'
import type { ContentItem } from '@/types/screenpipe'

// Helper to build an OCR ContentItem
function makeOCR(appName: string | null, timestamp: string): ContentItem {
  return {
    type: 'OCR',
    content: {
      text: 'sample',
      timestamp,
      app_name: appName ?? '',
      window_name: '',
      focused: false,
    },
  } as unknown as ContentItem
}

// Helper to build a UI ContentItem (non-OCR)
function makeUI(appName: string, timestamp: string): ContentItem {
  return {
    type: 'UI',
    content: {
      text: 'sample',
      timestamp,
      app_name: appName,
      window_name: '',
      focused: false,
    },
  } as unknown as ContentItem
}

// ─── aggregateByHour tests ────────────────────────────────────────────────────

describe('aggregateByHour', () => {
  it('empty input: returns 24 buckets, all empty', () => {
    const result = aggregateByHour([])
    expect(result).toHaveLength(24)
    result.forEach((bucket) => {
      expect(bucket.apps).toEqual([])
      expect(bucket.totalMs).toBe(0)
    })
  })

  it('single OCR frame → correct hour bucket', () => {
    // '2026-03-15T10:30:00' — local time, no Z
    const result = aggregateByHour([makeOCR('Chrome', '2026-03-15T10:30:00')])
    const bucket = result[10]
    expect(bucket.hour).toBe(10)
    const chrome = bucket.apps.find((a) => a.appName === 'Chrome')
    expect(chrome).toBeDefined()
    expect(chrome!.durationMs).toBe(5000)
  })

  it('multiple apps in same hour: Chrome gets more time, sorted descending', () => {
    const items: ContentItem[] = [
      makeOCR('Chrome', '2026-03-15T14:00:00'),
      makeOCR('Chrome', '2026-03-15T14:05:00'),
      makeOCR('Finder', '2026-03-15T14:10:00'),
    ]
    const result = aggregateByHour(items)
    const bucket = result[14]
    const chrome = bucket.apps.find((a) => a.appName === 'Chrome')
    const finder = bucket.apps.find((a) => a.appName === 'Finder')
    expect(chrome!.durationMs).toBe(10000)
    expect(finder!.durationMs).toBe(5000)
    // Apps should be sorted descending
    expect(bucket.apps[0].appName).toBe('Chrome')
    expect(bucket.apps[1].appName).toBe('Finder')
  })

  it('cross-hour: data in hour 9 and hour 15, others empty', () => {
    const items: ContentItem[] = [
      makeOCR('Safari', '2026-03-15T09:00:00'),
      makeOCR('Slack', '2026-03-15T15:30:00'),
    ]
    const result = aggregateByHour(items)
    expect(result[9].apps).toHaveLength(1)
    expect(result[9].apps[0].appName).toBe('Safari')
    expect(result[15].apps).toHaveLength(1)
    expect(result[15].apps[0].appName).toBe('Slack')
    // All other hours should be empty
    result.forEach((b, i) => {
      if (i !== 9 && i !== 15) {
        expect(b.apps).toEqual([])
      }
    })
  })

  it('non-OCR type items are ignored', () => {
    const items: ContentItem[] = [
      makeUI('Finder', '2026-03-15T10:00:00'),
      makeUI('Chrome', '2026-03-15T12:00:00'),
    ]
    const result = aggregateByHour(items)
    result.forEach((bucket) => {
      expect(bucket.apps).toEqual([])
    })
  })

  it('null app_name falls back to "Unknown"', () => {
    const result = aggregateByHour([makeOCR(null, '2026-03-15T08:00:00')])
    const bucket = result[8]
    expect(bucket.apps[0].appName).toBe('Unknown')
    expect(bucket.apps[0].durationMs).toBe(5000)
  })

  it('empty string app_name falls back to "Unknown"', () => {
    const result = aggregateByHour([makeOCR('', '2026-03-15T08:00:00')])
    const bucket = result[8]
    expect(bucket.apps[0].appName).toBe('Unknown')
  })

  it('large input: 240 frames, 10 per hour, sums correctly', () => {
    const items: ContentItem[] = []
    for (let h = 0; h < 24; h++) {
      const hh = String(h).padStart(2, '0')
      for (let m = 0; m < 10; m++) {
        const mm = String(m * 5).padStart(2, '0')
        items.push(makeOCR('TestApp', `2026-03-15T${hh}:${mm}:00`))
      }
    }
    const result = aggregateByHour(items)
    expect(result).toHaveLength(24)
    result.forEach((bucket) => {
      expect(bucket.totalMs).toBe(50000) // 10 frames × 5000ms
    })
    const grandTotal = result.reduce((sum, b) => sum + b.totalMs, 0)
    expect(grandTotal).toBe(1200000)
  })

  it('apps within bucket are sorted by durationMs descending', () => {
    const items: ContentItem[] = [
      makeOCR('AppA', '2026-03-15T11:00:00'), // 1 frame = 5000ms
      makeOCR('AppB', '2026-03-15T11:01:00'),
      makeOCR('AppB', '2026-03-15T11:02:00'), // 2 frames = 10000ms
      makeOCR('AppC', '2026-03-15T11:03:00'),
      makeOCR('AppC', '2026-03-15T11:04:00'),
      makeOCR('AppC', '2026-03-15T11:05:00'), // 3 frames = 15000ms
    ]
    const bucket = aggregateByHour(items)[11]
    expect(bucket.apps[0].appName).toBe('AppC')
    expect(bucket.apps[1].appName).toBe('AppB')
    expect(bucket.apps[2].appName).toBe('AppA')
  })

  it('every AppUsage.color is a non-empty string', () => {
    const items: ContentItem[] = [
      makeOCR('Chrome', '2026-03-15T10:00:00'),
      makeOCR('Finder', '2026-03-15T10:01:00'),
      makeOCR('Slack', '2026-03-15T11:00:00'),
    ]
    const result = aggregateByHour(items)
    result.forEach((bucket) => {
      bucket.apps.forEach((app) => {
        expect(app.color.length).toBeGreaterThan(0)
      })
    })
  })
})

// ─── formatDuration tests ─────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('0ms → "<1m"', () => {
    expect(formatDuration(0)).toBe('<1m')
  })

  it('30000ms (30s) → "<1m"', () => {
    expect(formatDuration(30000)).toBe('<1m')
  })

  it('59999ms → "<1m"', () => {
    expect(formatDuration(59999)).toBe('<1m')
  })

  it('60000ms (1 min) → "1m"', () => {
    expect(formatDuration(60000)).toBe('1m')
  })

  it('90000ms (1m30s) → "1m"', () => {
    expect(formatDuration(90000)).toBe('1m')
  })

  it('3600000ms (1 hour) → "1h 0m"', () => {
    expect(formatDuration(3600000)).toBe('1h 0m')
  })

  it('3660000ms (1h1m) → "1h 1m"', () => {
    expect(formatDuration(3660000)).toBe('1h 1m')
  })

  it('7322000ms (2h2m2s) → "2h 2m"', () => {
    expect(formatDuration(7322000)).toBe('2h 2m')
  })

  it('negative or NaN: does not throw', () => {
    expect(() => formatDuration(-1000)).not.toThrow()
    expect(() => formatDuration(NaN)).not.toThrow()
  })
})
