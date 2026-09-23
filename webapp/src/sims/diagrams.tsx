import { useEffect, useState, type ReactNode } from 'react'
import Reveal from '../components/Reveal.tsx'

/* All diagrams are lightweight animated SVGs that trigger on scroll (Reveal). */

/** Lesson 1 — DES event-jump clock: the clock only moves when events happen. */
export function EventClockDiagram() {
  const events = [
    { t: 0, label: 'arrival' },
    { t: 18, label: 'service done' },
    { t: 24, label: 'arrival' },
    { t: 47, label: 'arrival' },
    { t: 55, label: 'service done' },
    { t: 78, label: 'service done' },
    { t: 86, label: 'arrival' },
  ]
  const W = 700
  const x = (t: number) => 40 + (t / 100) * (W - 80)
  return (
    <Reveal className="diagram">
      <svg viewBox={`0 0 ${W} 150`} className="diagram__svg">
        <line x1="40" y1="90" x2={W - 40} y2="90" className="dg-axis" />
        {events.map((e, i) => (
          <g key={i} className="dg-event" style={{ animationDelay: `${i * 0.45}s` }}>
            <line x1={x(e.t)} y1="90" x2={x(e.t)} y2="58" className="dg-tick" />
            <circle cx={x(e.t)} cy="90" r="6" className="dg-dot" />
            <text x={x(e.t)} y="48" textAnchor="middle" className="dg-label">
              {e.label}
            </text>
            <text x={x(e.t)} y="112" textAnchor="middle" className="dg-time">
              {`t=${e.t}`}
            </text>
          </g>
        ))}
        <text x={W / 2} y="138" textAnchor="middle" className="dg-caption">
          Clock JUMPS between events — nothing happens in between (discrete-event simulation)
        </text>
      </svg>
      <div className="diagram__caption">Animated: the DES event clock</div>
    </Reveal>
  )
}

/** Lesson 1 — the 8-stage simulation lifecycle. */
export function LifecycleDiagram() {
  const steps = ['Problem', 'Conceptual model', 'Data', 'Build', 'Verify', 'Validate', 'Experiment', 'Report']
  const [active, setActive] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setActive((a) => (a + 1) % steps.length), 900)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Reveal className="diagram">
      <div className="lifecycle">
        {steps.map((s, i) => (
          <div key={s} className={`lifecycle__step ${i === active ? 'lifecycle__step--on' : ''}`}>
            <span className="lifecycle__num">{i + 1}</span>
            <span>{s}</span>
            {i < steps.length - 1 && <span className="lifecycle__arrow">→</span>}
          </div>
        ))}
      </div>
      <div className="diagram__caption">The simulation project lifecycle (stages light up in order)</div>
    </Reveal>
  )
}

/** Lesson 2 — stylized Arena window map. */
export function InterfaceDiagram() {
  return (
    <Reveal className="diagram">
      <svg viewBox="0 0 700 300" className="diagram__svg dg-fade-seq">
        <rect x="10" y="10" width="680" height="30" rx="6" className="dg-box dg-box--menu" />
        <text x="24" y="30" className="dg-label">
          File · Edit · View · Run · Reports …
        </text>

        <rect x="10" y="48" width="680" height="24" rx="6" className="dg-box dg-box--toolbar" />
        <text x="24" y="65" className="dg-label">
          ▶ Run controls & views
        </text>

        <rect x="10" y="80" width="170" height="180" rx="6" className="dg-box dg-box--panel" />
        <text x="95" y="104" textAnchor="middle" className="dg-label">
          PROJECT BAR
        </text>
        <text x="95" y="128" textAnchor="middle" className="dg-sub">
          BasicProcess ▾
        </text>
        <text x="95" y="150" textAnchor="middle" className="dg-sub">
          Create Process
        </text>
        <text x="95" y="170" textAnchor="middle" className="dg-sub">
          Decide Dispose …
        </text>
        <text x="95" y="200" textAnchor="middle" className="dg-sub">
          Resource Queue
        </text>
        <text x="95" y="220" textAnchor="middle" className="dg-sub">
          (data modules)
        </text>

        <rect x="190" y="80" width="500" height="180" rx="6" className="dg-box dg-box--canvas" />
        <text x="440" y="104" textAnchor="middle" className="dg-label">
          MODEL CANVAS — drag, connect, double-click
        </text>
        <g className="dg-flow">
          <rect x="230" y="140" width="90" height="46" rx="10" className="dg-mod dg-mod--create" />
          <text x="275" y="167" textAnchor="middle" className="dg-sub">
            Create
          </text>
          <rect x="370" y="140" width="90" height="46" rx="10" className="dg-mod dg-mod--process" />
          <text x="415" y="167" textAnchor="middle" className="dg-sub">
            Process
          </text>
          <rect x="540" y="140" width="90" height="46" rx="10" className="dg-mod dg-mod--dispose" />
          <text x="585" y="167" textAnchor="middle" className="dg-sub">
            Dispose
          </text>
          <line x1="320" y1="163" x2="368" y2="163" className="dg-conn" />
          <line x1="460" y1="163" x2="538" y2="163" className="dg-conn" />
          <circle r="6" className="dg-moving-dot">
            <animateMotion dur="3s" repeatCount="indefinite" path="M320,163 L538,163" />
          </circle>
        </g>
        <rect x="10" y="268" width="680" height="24" rx="6" className="dg-box dg-box--status" />
        <text x="24" y="285" className="dg-label">
          status bar: sim time · run state
        </text>
      </svg>
      <div className="diagram__caption">
        The Arena window: project bar, canvas, run controls (an entity flows!)
      </div>
    </Reveal>
  )
}

/** Lesson 3 — the canonical Create → Process → Dispose pipeline. */
export function PipelineDiagram() {
  return (
    <Reveal className="diagram">
      <svg viewBox="0 0 700 140" className="diagram__svg">
        <defs>
          <marker
            id="pd-arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" className="dg-arrow" />
          </marker>
        </defs>
        <rect x="30" y="45" width="140" height="54" rx="12" className="dg-mod dg-mod--create" />
        <text x="100" y="70" textAnchor="middle" className="dg-label">
          CREATE
        </text>
        <text x="100" y="88" textAnchor="middle" className="dg-sub">
          entities born here
        </text>

        <rect x="270" y="35" width="170" height="74" rx="12" className="dg-mod dg-mod--process" />
        <text x="355" y="60" textAnchor="middle" className="dg-label">
          PROCESS
        </text>
        <text x="355" y="78" textAnchor="middle" className="dg-sub">
          seize · delay · release
        </text>
        <rect x="300" y="88" width="110" height="14" rx="7" className="dg-queue-bg" />
        <circle cx="312" cy="95" r="5" className="dg-dot" />
        <circle cx="326" cy="95" r="5" className="dg-dot" />
        <circle cx="340" cy="95" r="5" className="dg-dot" />
        <text x="368" y="99" className="dg-sub">
          queue
        </text>

        <rect x="530" y="45" width="140" height="54" rx="12" className="dg-mod dg-mod--dispose" />
        <text x="600" y="70" textAnchor="middle" className="dg-label">
          DISPOSE
        </text>
        <text x="600" y="88" textAnchor="middle" className="dg-sub">
          exit + stats
        </text>

        <line x1="170" y1="72" x2="268" y2="72" className="dg-conn" markerEnd="url(#pd-arrow)" />
        <line x1="440" y1="72" x2="528" y2="72" className="dg-conn" markerEnd="url(#pd-arrow)" />
        <circle r="7" className="dg-moving-dot">
          <animateMotion dur="4s" repeatCount="indefinite" path="M170,72 L528,72" />
          <animate attributeName="opacity" values="0;1;1;0" dur="4s" repeatCount="indefinite" />
        </circle>
      </svg>
      <div className="diagram__caption">Every Arena model starts as Create → Process → Dispose</div>
    </Reveal>
  )
}

/** Lesson 4 — FIFO vs priority queue. */
export function QueueRankDiagram() {
  const [vip, setVip] = useState(false)
  useEffect(() => {
    const id = window.setInterval(() => setVip((v) => !v), 2600)
    return () => window.clearInterval(id)
  }, [])
  // regular customers (blue) arrive first; VIP (gold) jumps ahead when vip=true
  const order = vip ? ['r', 'v', 'r', 'r', 'r'] : ['r', 'r', 'v', 'r', 'r']
  return (
    <Reveal className="diagram">
      <svg viewBox="0 0 700 130" className="diagram__svg">
        <text x="40" y="30" className="dg-label">
          {vip
            ? 'Queue ranking: Lowest-attribute-first → VIP served next ✅'
            : 'FIFO → arrival order (VIP waits behind)'}
        </text>
        <rect x="40" y="48" width="440" height="44" rx="10" className="dg-queue-bg" />
        {order.map((kind, i) => (
          <g key={i} className="dg-qprio" style={{ transitionDelay: `${i * 40}ms` }}>
            <circle
              cx={70 + i * 62}
              cy={70}
              r="15"
              className={`dg-dot ${kind === 'v' ? 'dg-dot--vip' : ''}`}
            />
            <text x={70 + i * 62} y={75} textAnchor="middle" className="dg-dot-label">
              {kind === 'v' ? 'VIP' : i + 1}
            </text>
          </g>
        ))}
        <rect x="520" y="44" width="120" height="52" rx="10" className="dg-mod dg-mod--process" />
        <text x="580" y="68" textAnchor="middle" className="dg-label">
          SERVER
        </text>
        <text x="580" y="86" textAnchor="middle" className="dg-sub">
          frees… who's next?
        </text>
        <line x1="484" y1="70" x2="518" y2="70" className="dg-conn" markerEnd="url(#pd-arrow)" />
      </svg>
      <div className="diagram__caption">Queue ranking decides who waits less — capacity stays the same</div>
    </Reveal>
  )
}

/** Lesson 5 — chance decide: 20% fail branch. */
export function DecideDiagram() {
  const parts = [0, 1, 2, 3, 4, 5, 6, 7]
  const failing = new Set([2, 5])
  return (
    <Reveal className="diagram">
      <svg viewBox="0 0 700 200" className="diagram__svg">
        <rect x="30" y="80" width="110" height="46" rx="12" className="dg-mod dg-mod--process" />
        <text x="85" y="100" textAnchor="middle" className="dg-label">
          PROCESS
        </text>
        <text x="85" y="118" textAnchor="middle" className="dg-sub">
          inspect
        </text>

        <polygon points="230,60 310,103 230,146 150,103" className="dg-decide" />
        <text x="230" y="100" textAnchor="middle" className="dg-label">
          DECIDE
        </text>
        <text x="230" y="118" textAnchor="middle" className="dg-sub">
          chance 20%
        </text>

        <rect x="420" y="30" width="140" height="46" rx="12" className="dg-mod dg-mod--fail" />
        <text x="490" y="50" textAnchor="middle" className="dg-label">
          REWORK
        </text>
        <text x="490" y="68" textAnchor="middle" className="dg-sub">
          True (20%)
        </text>

        <rect x="420" y="130" width="140" height="46" rx="12" className="dg-mod dg-mod--ok" />
        <text x="490" y="150" textAnchor="middle" className="dg-label">
          PASS
        </text>
        <text x="490" y="168" textAnchor="middle" className="dg-sub">
          False (80%)
        </text>

        <line x1="140" y1="103" x2="148" y2="103" className="dg-conn" />
        <line x1="310" y1="103" x2="418" y2="55" className="dg-conn" />
        <line x1="310" y1="103" x2="418" y2="150" className="dg-conn" />

        {parts.map((p) => {
          const fail = failing.has(p)
          const path = fail ? 'M140,103 L418,55' : 'M140,103 L418,150'
          return (
            <circle key={p} r="6" className={`dg-moving-dot ${fail ? 'dg-dot--fail' : 'dg-dot--pass'}`}>
              <animateMotion begin={`${p * 0.5}s`} dur="2.5s" repeatCount="indefinite" path={path} />
              <animate
                attributeName="opacity"
                values="0;1;1;0"
                dur="2.5s"
                begin={`${p * 0.5}s`}
                repeatCount="indefinite"
              />
            </circle>
          )
        })}
        <text x="350" y="192" textAnchor="middle" className="dg-caption">
          Each entity flips its own coin — watch green particles pass, red particles rework
        </text>
      </svg>
      <div className="diagram__caption">Decide (Chance): randomness routes entities</div>
    </Reveal>
  )
}

/** Lesson 7 — transient / warm-up curve, draws itself on scroll. */
export function WarmupCurve() {
  const pts: [number, number][] = []
  for (let t = 0; t <= 100; t++) {
    const base = 14 + 9 * (1 - Math.exp(-t / 18))
    const noise = Math.sin(t * 0.9) * 1.6 + Math.sin(t * 2.3) * 0.9
    pts.push([40 + t * 6.2, 160 - (base + noise) * 4.4])
  }
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  return (
    <Reveal className="diagram">
      <svg viewBox="0 0 680 210" className="diagram__svg">
        <rect x="40" y="20" width="180" height="150" className="dg-warmzone" />
        <text x="130" y="36" textAnchor="middle" className="dg-label">
          warm-up (discard!)
        </text>
        <line x1="40" y1="170" x2="660" y2="170" className="dg-axis" />
        <line x1="40" y1="20" x2="40" y2="170" className="dg-axis" />
        <path d={d} className="dg-curve" pathLength={1} />
        <line x1="220" y1="20" x2="220" y2="170" className="dg-warmline" />
        <text x="440" y="196" textAnchor="middle" className="dg-caption">
          simulated time →
        </text>
        <text x="440" y="42" textAnchor="middle" className="dg-label">
          steady state — the statistics you report
        </text>
      </svg>
      <div className="diagram__caption">Why warm-up matters: the system fills up before it settles</div>
    </Reveal>
  )
}

/** Lesson 8 — verification vs validation. */
export function VVDiagram() {
  return (
    <Reveal className="diagram">
      <svg viewBox="0 0 700 220" className="diagram__svg">
        <rect x="40" y="70" width="180" height="80" rx="12" className="dg-mod dg-mod--process" />
        <text x="130" y="104" textAnchor="middle" className="dg-label">
          YOUR MODEL
        </text>
        <text x="130" y="126" textAnchor="middle" className="dg-sub">
          behaves somehow…
        </text>

        <rect x="480" y="20" width="180" height="70" rx="12" className="dg-mod dg-mod--spec" />
        <text x="570" y="48" textAnchor="middle" className="dg-label">
          SPECIFICATION
        </text>
        <text x="570" y="68" textAnchor="middle" className="dg-sub">
          "what I meant to build"
        </text>

        <rect x="480" y="130" width="180" height="70" rx="12" className="dg-mod dg-mod--real" />
        <text x="570" y="158" textAnchor="middle" className="dg-label">
          REAL WORLD
        </text>
        <text x="570" y="178" textAnchor="middle" className="dg-sub">
          "what actually happens"
        </text>

        <line x1="222" y1="90" x2="478" y2="55" className="dg-conn dg-conn--vv" />
        <text x="350" y="58" textAnchor="middle" className="dg-label dg-label--hl">
          VERIFICATION ✓
        </text>
        <text x="350" y="76" textAnchor="middle" className="dg-sub">
          "built it right?"
        </text>

        <line x1="222" y1="130" x2="478" y2="165" className="dg-conn dg-conn--vv" />
        <text x="350" y="160" textAnchor="middle" className="dg-label dg-label--hl">
          VALIDATION ✓
        </text>
        <text x="350" y="178" textAnchor="middle" className="dg-sub">
          "built the right thing?"
        </text>
      </svg>
      <div className="diagram__caption">Verification compares to your spec; validation compares to reality</div>
    </Reveal>
  )
}

/** Lesson 7 — interactive Little's Law calculator. */
export function LittlesLaw() {
  const [lambda, setLambda] = useState(6) // per hour
  const [wq, setWq] = useState(12) // minutes
  const L = lambda * (wq / 60)
  return (
    <Reveal className="diagram littleslaw">
      <div className="ll-title">
        🧮 Little's Law calculator — <code>L = λ × W</code>
      </div>
      <div className="ll-controls">
        <label>
          Arrival rate λ: <b>{lambda}/hr</b>
          <input
            type="range"
            min="1"
            max="20"
            value={lambda}
            onChange={(e) => setLambda(+e.target.value)}
          />
        </label>
        <label>
          Avg wait W: <b>{wq} min</b>
          <input type="range" min="1" max="60" value={wq} onChange={(e) => setWq(+e.target.value)} />
        </label>
      </div>
      <div className="ll-result">
        <span className="ll-eq">{`${lambda}/hr × ${(wq / 60).toFixed(2)} hr =`}</span>
        <span className="ll-L">{L.toFixed(2)}</span>
        <span className="ll-unit">entities in the queue on average</span>
      </div>
      <div className="diagram__caption">
        Cross-check your Arena report: if the queue report disagrees with this, something's wrong —
        it's a free correctness test!
      </div>
    </Reveal>
  )
}

/** Per-lesson hero diagram mapping. */
export const heroFor = (route: string): ReactNode => {
  const map: Record<string, ReactNode> = {
    '01-what-is-simulation': (
      <>
        <EventClockDiagram />
        <LifecycleDiagram />
      </>
    ),
    '02-arena-interface': <InterfaceDiagram />,
    '03-basic-modeling': <PipelineDiagram />,
    '04-resources-queues': <QueueRankDiagram />,
    '05-flow-control': <DecideDiagram />,
    '07-running-models': (
      <>
        <WarmupCurve />
        <LittlesLaw />
      </>
    ),
    '08-verification-validation': <VVDiagram />,
  }
  return map[route] || null
}
