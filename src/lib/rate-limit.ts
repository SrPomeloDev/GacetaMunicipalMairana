import { NextResponse } from "next/server"

export type RateLimitOptions = {
  limit: number
  windowMs: number
}

export type RateLimitResult = {
  ok: boolean
  retryAfter: number
}

const hits = new Map<string, number[]>()
const MAX_KEYS = 5000

function pruneExpired(now: number) {
  for (const [key, timestamps] of hits) {
    if (timestamps.length === 0 || timestamps[timestamps.length - 1] + 600000 < now) {
      hits.delete(key)
    }
  }
}

export function checkRateLimit(key: string, { limit, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  if (hits.size > MAX_KEYS) pruneExpired(now)
  const windowStart = now - windowMs
  const timestamps = (hits.get(key) ?? []).filter((t) => t > windowStart)
  if (timestamps.length >= limit) {
    hits.set(key, timestamps)
    return { ok: false, retryAfter: Math.max(Math.ceil((timestamps[0] + windowMs - now) / 1000), 1) }
  }
  timestamps.push(now)
  hits.set(key, timestamps)
  return { ok: true, retryAfter: 0 }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0].trim()
    if (first) return first
  }
  const realIp = request.headers.get("x-real-ip")
  if (realIp && realIp.trim()) return realIp.trim()
  return "unknown"
}

export function rateLimitExceededResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "Demasiadas solicitudes. Inténtalo de nuevo en unos segundos." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  )
}
