import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface DayStat {
  date: string
  unique: number
  views: number
}

interface Stats {
  totalUnique: number
  totalViews: number
  days: DayStat[]
  updatedAt: string
}

const TOKEN_KEY = 'ac-admin-token'

/** Private stats panel — hidden route (#/admin), password-gated, API token-checked. */
export default function Admin() {
  const navigate = useNavigate()
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '')
  const [input, setInput] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = useCallback(
    async (tok: string) => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`api/stats?token=${encodeURIComponent(tok)}`)
        const data = (await res.json()) as Stats & { error?: string }
        if (!res.ok) {
          setError(data.error === 'unauthorized' ? 'Wrong password.' : `API error: ${data.error || res.status}`)
          if (data.error === 'unauthorized') {
            sessionStorage.removeItem(TOKEN_KEY)
            setToken('')
          }
          setStats(null)
          return
        }
        setStats(data)
      } catch {
        setError('Could not reach the stats API (not deployed yet, or network issue).')
        setStats(null)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (token) void load(token)
  }, [token, load])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const tok = input.trim()
    if (!tok) return
    sessionStorage.setItem(TOKEN_KEY, tok)
    setToken(tok)
    setInput('')
  }

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken('')
    setStats(null)
  }

  const today = stats?.days[stats.days.length - 1]

  return (
    <div className="admin">
      <header className="admin__bar">
        <button className="icon-btn" onClick={() => navigate('/')} title="Back to site">
          ← Site
        </button>
        <span className="admin__title">🔒 Private stats</span>
        {token && (
          <button className="icon-btn" onClick={logout} title="Forget password">
            Lock
          </button>
        )}
      </header>

      {!token ? (
        <form className="admin__gate" onSubmit={submit}>
          <div className="admin__gate-card">
            <div className="admin__lock">🔐</div>
            <h1>Admin only</h1>
            <p>Enter your secret password to view visitor stats.</p>
            <input
              type="password"
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Secret password"
            />
            <button className="btn btn--primary btn--block" type="submit">
              Unlock
            </button>
            {error && <div className="admin__error">{error}</div>}
          </div>
        </form>
      ) : (
        <main className="admin__body">
          <h1>📊 Visitor stats</h1>
          {error && <div className="admin__error">{error}</div>}
          {loading && !stats && <p>Loading…</p>}

          {stats && (
            <>
              <section className="admin__cards">
                <div className="admin-card">
                  <div className="admin-card__value">{stats.totalUnique}</div>
                  <div className="admin-card__label">Unique visitors (all time)</div>
                </div>
                <div className="admin-card">
                  <div className="admin-card__value">{stats.totalViews}</div>
                  <div className="admin-card__label">Page views (all time)</div>
                </div>
                <div className="admin-card">
                  <div className="admin-card__value">{today?.unique ?? 0}</div>
                  <div className="admin-card__label">Uniques today</div>
                </div>
                <div className="admin-card">
                  <div className="admin-card__value">{today?.views ?? 0}</div>
                  <div className="admin-card__label">Views today</div>
                </div>
              </section>

              <section className="admin__chart-card">
                <div className="admin__chart-head">
                  <h2>Last 14 days</h2>
                  <span className="admin__legend">
                    <i className="lg lg--uv" /> uniques&nbsp;&nbsp;<i className="lg lg--pv" /> views
                  </span>
                </div>
                <BarChart days={stats.days} />
              </section>

              <section className="admin__table-card">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Unique visitors</th>
                      <th>Page views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...stats.days].reverse().map((d) => (
                      <tr key={d.date}>
                        <td>{d.date}</td>
                        <td>{d.unique}</td>
                        <td>{d.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <p className="admin__updated">
                Last updated: {new Date(stats.updatedAt).toLocaleString()}
                <button className="admin__refresh" onClick={() => load(token)} disabled={loading}>
                  {loading ? 'Refreshing…' : '↻ Refresh'}
                </button>
              </p>
            </>
          )}
        </main>
      )}
    </div>
  )
}

/** Pure-SVG grouped bar chart — no chart library needed. */
function BarChart({ days }: { days: DayStat[] }) {
  const W = 760
  const H = 240
  const PAD = { l: 36, r: 10, t: 14, b: 42 }
  const max = Math.max(1, ...days.map((d) => Math.max(d.unique, d.views)))
  const plotW = W - PAD.l - PAD.r
  const plotH = H - PAD.t - PAD.b
  const slot = plotW / days.length
  const barW = Math.min(16, slot / 2.6)

  const niceMax = niceCeil(max)
  const y = (v: number) => PAD.t + plotH - (v / niceMax) * plotH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="admin__chart" role="img" aria-label="Daily visitors chart">
      {/* gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={PAD.l} y1={y(niceMax * f)} x2={W - PAD.r} y2={y(niceMax * f)} className="ag-grid" />
          <text x={PAD.l - 6} y={y(niceMax * f) + 4} textAnchor="end" className="ag-axis">
            {Math.round(niceMax * f)}
          </text>
        </g>
      ))}

      {days.map((d, i) => {
        const cx = PAD.l + i * slot + slot / 2
        const label = d.date.slice(5) // MM-DD
        return (
          <g key={d.date}>
            <title>{`${d.date}: ${d.unique} uniques, ${d.views} views`}</title>
            <rect
              x={cx - barW - 1.5}
              y={y(d.unique)}
              width={barW}
              height={Math.max(0, PAD.t + plotH - y(d.unique))}
              rx="2.5"
              className="ag-bar ag-bar--uv"
            />
            <rect
              x={cx + 1.5}
              y={y(d.views)}
              width={barW}
              height={Math.max(0, PAD.t + plotH - y(d.views))}
              rx="2.5"
              className="ag-bar ag-bar--pv"
            />
            <text x={cx} y={H - PAD.b + 16} textAnchor="middle" className="ag-axis">
              {label.slice(3)}
            </text>
            {i === 0 || label.endsWith('-01') ? (
              <text x={cx} y={H - PAD.b + 32} textAnchor="middle" className="ag-axis ag-axis--month">
                {label.slice(0, 2)}
              </text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

function niceCeil(v: number): number {
  if (v <= 5) return 5
  const mag = Math.pow(10, Math.floor(Math.log10(v)))
  const norm = v / mag
  const nice = norm <= 2 ? 2 : norm <= 5 ? 5 : 10
  return nice * mag
}
