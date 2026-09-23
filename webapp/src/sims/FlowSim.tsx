import { useEffect, useRef, useState } from 'react'

interface Config {
  interarrival: number
  service: number
  servers: number
  running: boolean
  resetKey: number
}

interface SimServer {
  freeAt: number
}

interface SimState {
  t: number
  nextArrival: number
  queue: { id: number; enqueuedAt: number }[]
  servers: SimServer[]
  out: number
  waitSum: number
  waitCount: number
  busySum: number
  nextId: number
  arrived: number
}

interface Snapshot {
  queue: { id: number; enqueuedAt: number }[]
  servers: { busy: boolean }[]
  out: number
  util: number
  avgWait: number
  t: number
  arrived: number
}

const exp = (mean: number): number => -Math.log(Math.random()) * mean

function Stat({ label, value, hot }: { label: string; value: string | number; hot?: boolean }) {
  return (
    <div className={`stat ${hot ? 'stat--hot' : ''}`}>
      <div className="stat__value">{value}</div>
      <div className="stat__label">{label}</div>
    </div>
  )
}

/**
 * FlowSim — a real (tiny) discrete-event simulation running in the browser.
 * Create → Queue → Servers → Dispose, with live stats and controls.
 * Demonstrates: arrivals, queues, servers, utilization, and how
 * variability + utilization ⇒ waiting.
 */
export default function FlowSim() {
  const [cfg, setCfg] = useState<Config>({
    interarrival: 6,
    service: 5,
    servers: 1,
    running: true,
    resetKey: 0,
  })
  const [snap, setSnap] = useState<Snapshot>({
    queue: [],
    servers: [],
    out: 0,
    util: 0,
    avgWait: 0,
    t: 0,
    arrived: 0,
  })

  const sim = useRef<SimState | null>(null)

  // (Re)initialize the simulation when config or reset changes
  useEffect(() => {
    const s: SimState = {
      t: 0,
      nextArrival: exp(cfg.interarrival),
      queue: [],
      servers: Array.from({ length: cfg.servers }, () => ({ freeAt: 0 })),
      out: 0,
      waitSum: 0,
      waitCount: 0,
      busySum: 0,
      nextId: 1,
      arrived: 0,
    }
    sim.current = s
    setSnap({ queue: [], servers: s.servers.map(() => ({ busy: false })), out: 0, util: 0, avgWait: 0, t: 0, arrived: 0 })
  }, [cfg.interarrival, cfg.service, cfg.servers, cfg.resetKey])

  // Simulation loop
  useEffect(() => {
    if (!cfg.running) return
    const DT = 0.1 // sim-minutes per tick
    const TICK_MS = 80
    const id = window.setInterval(() => {
      const s = sim.current
      if (!s) return
      s.t += DT

      // arrivals
      while (s.t >= s.nextArrival) {
        s.queue.push({ id: s.nextId++, enqueuedAt: s.t })
        s.arrived++
        s.nextArrival = s.t + exp(cfg.interarrival)
      }

      // dispatch to free servers (FIFO)
      for (let i = 0; i < s.servers.length && s.queue.length; i++) {
        if (s.t >= s.servers[i].freeAt) {
          const e = s.queue.shift()
          if (e) {
            s.waitSum += s.t - e.enqueuedAt
            s.waitCount++
          }
          s.servers[i].freeAt = s.t + exp(cfg.service)
        }
      }

      // stats
      s.busySum += s.servers.filter((x) => s.t < x.freeAt).length * DT

      setSnap({
        queue: s.queue.slice(0, 14),
        servers: s.servers.map((x) => ({ busy: s.t < x.freeAt })),
        out: s.out,
        util: s.t > 0 ? s.busySum / (s.t * s.servers.length) : 0,
        avgWait: s.waitCount ? s.waitSum / s.waitCount : 0,
        t: s.t,
        arrived: s.arrived,
      })
    }, TICK_MS)
    return () => window.clearInterval(id)
  }, [cfg.running, cfg.interarrival, cfg.service, cfg.servers])

  const rho = cfg.service / cfg.interarrival / cfg.servers

  return (
    <div className="flowsim">
      <div className="flowsim__header">
        <span className="flowsim__title">▶ Live mini-simulation: arrivals → queue → servers</span>
        <button className="pill-btn" onClick={() => setCfg((c) => ({ ...c, running: !c.running }))}>
          {cfg.running ? '⏸ Pause' : '▶ Run'}
        </button>
        <button
          className="pill-btn"
          onClick={() => setCfg((c) => ({ ...c, resetKey: c.resetKey + 1 }))}
          title="Restart the simulation from time 0"
        >
          ↺ Reset
        </button>
      </div>

      <svg
        viewBox="0 0 720 190"
        className="flowsim__svg"
        role="img"
        aria-label="Animation of entities flowing through create, queue, servers and dispose"
      >
        <defs>
          <marker
            id="fs-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" className="fs-arrow" />
          </marker>
        </defs>

        {/* flow lines */}
        <line x1="88" y1="80" x2="140" y2="80" className="fs-flow" markerEnd="url(#fs-arrow)" />
        <line x1="140" y1="80" x2="300" y2="80" className="fs-flow" markerEnd="url(#fs-arrow)" />
        <line
          x1={300 + snap.servers.length * 74}
          y1="80"
          x2="640"
          y2="80"
          className="fs-flow"
          markerEnd="url(#fs-arrow)"
        />

        {/* Create */}
        <g className="fs-node fs-node--create">
          <circle cx="50" cy="80" r="30" />
          <text x="50" y="76" textAnchor="middle" className="fs-node__label">
            CREATE
          </text>
          <text x="50" y="92" textAnchor="middle" className="fs-node__sub">
            {`EXPO(${cfg.interarrival})`}
          </text>
        </g>

        {/* Queue zone */}
        <text x="220" y="34" textAnchor="middle" className="fs-zone-label">
          {`QUEUE · ${snap.queue.length} waiting`}
        </text>
        <rect x="142" y="52" width="156" height="56" rx="8" className="fs-zone" />
        {snap.queue.map((e, i) => (
          <circle
            key={e.id}
            cx={158 + (i % 7) * 21}
            cy={i < 7 ? 70 : 92}
            r="8"
            className="fs-dot fs-dot--queue"
          />
        ))}

        {/* Servers */}
        {snap.servers.map((srv, i) => (
          <g key={i} className="fs-node">
            <rect
              x={310 + i * 74}
              y={48}
              width={64}
              height={64}
              rx="10"
              className={`fs-server ${srv && srv.busy ? 'fs-server--busy' : ''}`}
            />
            <text x={342 + i * 74} y={76} textAnchor="middle" className="fs-node__label">
              SERVER
            </text>
            <text x={342 + i * 74} y={94} textAnchor="middle" className="fs-node__sub">
              {`#${i + 1}`}
            </text>
            {srv?.busy && (
              <circle cx={366 + i * 74} cy={56} r="5" className="fs-busy-dot">
                <animate attributeName="opacity" values="1;0.3;1" dur="0.9s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        ))}

        {/* Dispose */}
        <g className="fs-node fs-node--dispose">
          <circle cx="675" cy="80" r="26" />
          <text x="675" y="77" textAnchor="middle" className="fs-node__label">
            OUT
          </text>
          <text x="675" y="93" textAnchor="middle" className="fs-node__sub">
            {snap.out}
          </text>
        </g>

        {/* ρ meter */}
        <text x="360" y="146" textAnchor="middle" className="fs-rho">
          {`ρ (offered load) ≈ ${rho.toFixed(2)}`}
          {rho >= 1
            ? ' — UNSTABLE, queue grows forever!'
            : rho > 0.85
              ? ' — heavy, expect long waits'
              : ''}
        </text>
        <rect x="180" y="162" width="360" height="10" rx="5" className="fs-meter-bg" />
        <rect
          x="180"
          y="162"
          width={(Math.min(rho, 1.4) / 1.4) * 360}
          height="10"
          rx="5"
          className={`fs-meter-fill ${rho >= 1 ? 'fs-meter-fill--hot' : ''}`}
        />
        <text x="360" y="182" textAnchor="middle" className="fs-meter-caption">
          offered load meter
        </text>
      </svg>

      <div className="flowsim__controls">
        <label>
          Mean interarrival: <b>{cfg.interarrival} min</b>
          <input
            type="range"
            min="1"
            max="14"
            step="0.5"
            value={cfg.interarrival}
            onChange={(e) => setCfg((c) => ({ ...c, interarrival: +e.target.value }))}
          />
        </label>
        <label>
          Mean service: <b>{cfg.service} min</b>
          <input
            type="range"
            min="1"
            max="14"
            step="0.5"
            value={cfg.service}
            onChange={(e) => setCfg((c) => ({ ...c, service: +e.target.value }))}
          />
        </label>
        <label>
          Servers: <b>{cfg.servers}</b>
          <input
            type="range"
            min="1"
            max="3"
            step="1"
            value={cfg.servers}
            onChange={(e) => setCfg((c) => ({ ...c, servers: +e.target.value }))}
          />
        </label>
      </div>

      <div className="flowsim__stats">
        <Stat label="Sim time" value={`${snap.t.toFixed(0)} min`} />
        <Stat label="Arrived" value={snap.arrived} />
        <Stat label="Queue now" value={snap.queue.length} />
        <Stat label="Avg wait" value={`${snap.avgWait.toFixed(1)} min`} />
        <Stat label="Utilization" value={`${Math.round(snap.util * 100)}%`} hot={snap.util > 0.9} />
      </div>

      <p className="flowsim__hint">
        💡 <b>Try it:</b> push <i>service</i> above <i>interarrival</i> (ρ ≥ 1) and watch the queue
        grow without bound. Then add servers. This one insight is the heart of queueing — and of Arena.
      </p>
    </div>
  )
}
