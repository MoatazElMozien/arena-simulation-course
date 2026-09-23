import type { VercelRequest, VercelResponse } from '@vercel/node'
import { timingSafeEqual } from 'node:crypto'

/**
 * GET /api/stats?token=…  (or Authorization: Bearer …)
 * Returns totals + the last 14 days of unique visitors / page views.
 * Protected by the ADMIN_TOKEN env var — timing-safe comparison.
 *
 * The Redis helper is intentionally inlined (no relative imports) so the
 * serverless bundle has zero cross-file resolution risks under Node ESM.
 */

const KV_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

async function kvPipeline(cmds: (string | number)[][]): Promise<unknown[]> {
  const base = (KV_URL || '').replace(/\/+$/, '')
  const res = await fetch(`${base}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${KV_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
  })
  if (!res.ok) throw new Error(`KV error ${res.status}: ${await res.text()}`)
  // Upstash /pipeline returns a top-level ARRAY of {result,error}; a single
  // command returns {result}. Handle both — and never swallow command errors.
  const data: unknown = await res.json()
  const items = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { result?: unknown[] }).result)
      ? (data as { result: unknown[] }).result
      : null
  if (!items) throw new Error('Unexpected KV pipeline response shape')
  for (const it of items) {
    const err = (it as { error?: unknown } | null)?.error
    if (err) throw new Error(`KV command error: ${String(err)}`)
  }
  return items.map((it) => (it && typeof it === 'object' && 'result' in it ? (it as { result: unknown }).result : null))
}

interface DayStat {
  date: string
  unique: number
  views: number
}

interface StatsResponse {
  ok: true
  totalUnique: number
  totalViews: number
  days: DayStat[]
  updatedAt: string
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return timingSafeEqual(ba, bb)
}

function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(new Date(Date.now() - i * 86400_000).toISOString().slice(0, 10))
  }
  return days
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'GET only' })
    return
  }

  const expected = process.env.ADMIN_TOKEN
  if (!expected) {
    res.status(503).json({ error: 'ADMIN_TOKEN not configured' })
    return
  }
  if (!KV_URL || !KV_TOKEN) {
    res.status(503).json({ error: 'analytics storage not configured' })
    return
  }

  const bearer = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  const provided = bearer || (typeof req.query.token === 'string' ? req.query.token : '')
  if (!provided || !safeEqual(provided, expected)) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const days = lastNDays(14)
  try {
    const cmds: (string | number)[][] = [['SCARD', 'ac:uv:all'], ['GET', 'ac:pv:all']]
    for (const d of days) {
      cmds.push(['SCARD', `ac:uv:${d}`])
      cmds.push(['GET', `ac:pv:${d}`])
    }
    const r = await kvPipeline(cmds)

    const toNum = (v: unknown): number => (v == null ? 0 : Number(v))
    const dayStats: DayStat[] = days.map((d, i) => ({
      date: d,
      unique: toNum(r[2 + i * 2]),
      views: toNum(r[3 + i * 2]),
    }))

    const body: StatsResponse = {
      ok: true,
      totalUnique: toNum(r[0]),
      totalViews: toNum(r[1]),
      days: dayStats,
      updatedAt: new Date().toISOString(),
    }
    res.status(200).json(body)
  } catch (err) {
    console.error('stats failed', err)
    res.status(500).json({ error: 'storage-error' })
  }
}
