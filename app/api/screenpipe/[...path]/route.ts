import { NextRequest } from 'next/server'

const SCREENPIPE_URL = process.env.SCREENPIPE_URL ?? 'http://localhost:3030'

async function proxyRequest(request: NextRequest, params: { path: string[] }) {
  const targetPath = params.path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${SCREENPIPE_URL}/${targetPath}${searchParams ? `?${searchParams}` : ''}`

  try {
    const isWrite = request.method !== 'GET' && request.method !== 'HEAD'
    const headers: Record<string, string> = {}
    if (isWrite) {
      headers['Content-Type'] = 'application/json'
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10_000)

    const init: RequestInit = {
      method: request.method,
      headers,
      signal: controller.signal,
    }

    if (isWrite) {
      const body = await request.text()
      if (body) init.body = body
    }

    const response = await fetch(url, init)
    clearTimeout(timeoutId)

    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[screenpipe proxy] error:', message, 'url:', url)
    return Response.json(
      { error: 'Screenpipe unavailable', screenpipe_offline: true, detail: message },
      { status: 503 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params
  return proxyRequest(request, resolvedParams)
}
