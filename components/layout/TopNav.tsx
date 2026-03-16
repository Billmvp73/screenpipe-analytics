'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useScreenpipeHealth } from '@/hooks/useScreenpipeHealth'

export function TopNav() {
  const { data: health, isLoading } = useScreenpipeHealth()
  const pathname = usePathname()

  const isOnline = health?.screenpipe_online ?? false

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">🕐 Screenpipe Analytics</span>
          <nav className="flex items-center gap-4 text-sm ml-6">
            <Link href="/" className={`transition-colors ${pathname === "/" ? "text-amber-400" : "text-zinc-400 hover:text-zinc-100"}`}>
              时间轴
            </Link>
            <Link href="/insights" className={`transition-colors ${pathname === "/insights" ? "text-amber-400" : "text-zinc-400 hover:text-zinc-100"}`}>
              统计分析
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isLoading ? (
            <span className="text-zinc-500">Checking...</span>
          ) : (
            <>
              <span
                className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-500'}`}
              />
              <span className={isOnline ? 'text-emerald-400' : 'text-red-400'}>
                {isOnline ? 'Screenpipe 在线' : 'Screenpipe 离线'}
              </span>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
