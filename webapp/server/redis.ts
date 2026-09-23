/**
 * Minimal Upstash Redis REST client — zero dependencies.
 * Works with Vercel Marketplace "Upstash for Redis" or a free upstash.com DB
 * (set UPSTASH_REDIS_REST_* env vars; KV_REST_API_* is accepted as an alias).
 */
const KV_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const KV_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN

export function kvConfigured(): boolean {
  return !!KV_URL && !!KV_TOKEN
}

async function rest(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${KV_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KV_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`KV error ${res.status}: ${await res.text()}`)
  const json = (await res.json()) as { result?: unknown }
  return json.result
}

/** Run a single command, e.g. kvCommand(['SADD', 'key', 'member']). */
export async function kvCommand(cmd: (string | number)[]): Promise<unknown> {
  return rest('', [cmd])
}

/**
 * Run commands in one round trip. Upstash pipeline returns [{result}, ...].
 * Returns just the results.
 */
export async function kvPipeline(cmds: (string | number)[][]): Promise<unknown[]> {
  const result = (await rest('/pipeline', cmds)) as { result: unknown }[]
  return result.map((r) => r.result)
}
