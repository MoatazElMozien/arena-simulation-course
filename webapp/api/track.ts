import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createHash } from 'node:crypto'

/**
 * POST /api/track — records one visit.
 * Privacy-friendly unique ID: sha256(IP + user-agent) — no cookies, no raw IPs stored.
 * (Behind corporate NAT, several people may count as one "unique" — a standard,
 * privacy-first approximation.)
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

const utcDay = (): string => new Date().toISOString().slice(0, 10)

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'POST only' })
    return
  }
  if (!KV_URL || !KV_TOKEN) {
    // Not configured yet — tell the client quietly so it stops retrying.
    res.status(200).json({ ok: false, reason: 'analytics-not-configured' })
    return
  }

  const fwd = req.headers['x-forwarded-for']
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
  const ua = req.headers['user-agent'] || 'unknown'
  const visitorId = createHash('sha256').update(`${ip}|${ua}`).digest('hex').slice(0, 32)
  const day = utcDay()

  try {
    await kvPipeline([
      ['SADD', 'ac:uv:all', visitorId],
      ['SADD', `ac:uv:${day}`, visitorId],
      ['INCR', 'ac:pv:all'],
      ['INCR', `ac:pv:${day}`],
      ['SADD', 'ac:days', day],
    ])
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('track failed', err)
    res.status(500).json({ ok: false, error: 'storage-error' })
  }
}
