import { NextRequest } from 'next/server'

const SCREENPIPE_URL = process.env.SCREENPIPE_URL ?? 'http://localhost:3030'

async function proxyRequest(request: NextRequest, params: { path: string[] }) {
  const targetPath = params.path.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const url = `${SCREENPIPE_URL}/${targetPath}${searchParams ? `?${searchParams}` : ''}`

  try {
    const init: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10_000),
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.text()
      if (body) {
        init.body = body
      }
    }

    const response = await fetch(url, init)
    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch {
    return Response.json(
      { error: 'Screenpipe unavailable', screenpipe_offline: true },
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
