import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { cn } from '@/lib/utils'
import { Providers } from '@/lib/providers'
import { TopNav } from '@/components/layout/TopNav'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Screenpipe Analytics',
  description: 'Visualize your screen time with Screenpipe',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh" className="dark">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'min-h-screen bg-zinc-950 font-[family-name:var(--font-geist-sans)] text-zinc-100 antialiased'
        )}
      >
        <Providers>
          <TopNav />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
