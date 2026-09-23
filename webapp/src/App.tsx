import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Layout from './components/Layout.tsx'
import SearchPalette from './components/SearchPalette.tsx'
import Markdown from './components/Markdown.tsx'
import { getDoc, home } from './content.ts'
import { heroFor } from './sims/diagrams.tsx'
import FlowSim from './sims/FlowSim.tsx'
import Reveal from './components/Reveal.tsx'
import { useStore } from './store.tsx'
import Landing from './pages/Landing.tsx'

function DocPage({ route }: { route: string }) {
  const doc = getDoc(route)
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route])

  if (!doc) {
    return (
      <div className="missing">
        <h1>Page not found</h1>
        <p>
          No lesson matches <code>/{route}</code>.
        </p>
        <button className="pill-btn" onClick={() => navigate('/readme')}>
          ← Back to course home
        </button>
      </div>
    )
  }

  const hero = heroFor(doc.route)

  return (
    <article className="doc" key={doc.route}>
      {hero && <div className="doc__hero">{hero}</div>}
      <Markdown source={doc.raw} />
      {doc.route === '03-basic-modeling' && (
        <Reveal className="doc__sim">
          <FlowSim />
        </Reveal>
      )}
      <FooterNav route={doc.route} />
    </article>
  )
}

const ORDER = [
  'readme',
  '01-what-is-simulation',
  '02-arena-interface',
  '03-basic-modeling',
  '04-resources-queues',
  '05-flow-control',
  '06-expressions-logic',
  '07-running-models',
  '08-verification-validation',
  '09-projects',
  'exercises/README',
  'exercises/quiz-basics',
  'exercises/quiz-modeling',
  'exercises/practice-problems',
]

function FooterNav({ route }: { route: string }) {
  const navigate = useNavigate()
  const idx = ORDER.findIndex((r) => r.toLowerCase() === route.toLowerCase())
  const prev = idx > 0 ? ORDER[idx - 1] : null
  const next = idx >= 0 && idx < ORDER.length - 1 ? ORDER[idx + 1] : null
  return (
    <nav className="footer-nav">
      {prev ? (
        <button className="footer-nav__btn" onClick={() => navigate('/' + prev)}>
          ← Previous
        </button>
      ) : (
        <span />
      )}
      {next ? (
        <button className="footer-nav__btn footer-nav__btn--next" onClick={() => navigate('/' + next)}>
          Next →
        </button>
      ) : (
        <span />
      )}
    </nav>
  )
}

/** Course home: rendered README + interactive demo. */
function HomePage() {
  if (!home) return null
  return (
    <article className="doc doc--home">
      <Markdown source={home.raw} />
      <Reveal className="doc__sim">
        <h2 className="demo-title">🎮 Interactive demo — try it right here</h2>
        <FlowSim />
      </Reveal>
      <FooterNav route="readme" />
    </article>
  )
}

/** Wraps Layout for course pages (everything except the landing page). */
function CourseLayout() {
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && (e.key === 'k' || e.key === '/')) || (e.metaKey && e.key === 'k')) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const route = location.pathname.replace(/^\//, '')

  return (
    <>
      <Layout onOpenSearch={() => setSearchOpen(true)}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exercises/:slug" element={<DocRoute prefix="exercises/" />} />
          <Route path="/:slug" element={<DocRoute />} />
          <Route path="*" element={<DocPage route={route} />} />
        </Routes>
      </Layout>
      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </>
  )
}

export default function App() {
  const location = useLocation()
  const { theme } = useStore()

  // theme application on first paint
  useEffect(() => {
    if (theme) document.documentElement.dataset.theme = theme
  }, [theme])

  // Landing page at "/"; everything else renders the course shell
  const isLanding = location.pathname === '/' || location.pathname === ''

  return isLanding ? <Landing /> : <CourseLayout />
}

function DocRoute({ prefix = '' }: { prefix?: string }) {
  const location = useLocation()
  const parts = location.pathname.split('/').filter(Boolean)
  const slug = parts[parts.length - 1] || ''
  return <DocPage route={(prefix + slug).toLowerCase()} />
}
