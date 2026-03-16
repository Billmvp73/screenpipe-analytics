const SCREENPIPE_URL = process.env.SCREENPIPE_URL ?? 'http://localhost:3030'

export async function GET() {
  let screenpipe_online = false

  try {
    const response = await fetch(`${SCREENPIPE_URL}/health`, {
      signal: AbortSignal.timeout(3_000),
    })
    screenpipe_online = response.ok
  } catch {
    screenpipe_online = false
  }

  return Response.json(
    {
      status: screenpipe_online ? 'ok' : 'degraded',
      screenpipe_online,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
