import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { docs, lessons } from '../content.ts'
import { useProgress, QuizScoreBadge, CompleteToggle } from './Badges.tsx'
import { useStore, type Theme } from '../store.tsx'

function ThemeToggle() {
  const { theme, setTheme } = useStore()
  const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
  const effective: Theme = theme || (systemDark ? 'dark' : 'light')

  useEffect(() => {
    document.documentElement.dataset.theme = effective
  }, [effective])

  return (
    <button
      className="icon-btn"
      title="Toggle dark / light mode"
      onClick={() => setTheme(effective === 'dark' ? 'light' : 'dark')}
    >
      {effective === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

export default function Layout({ children, onOpenSearch }: { children: ReactNode; onOpenSearch: () => void }) {
  const location = useLocation()
  const { done, total, ratio } = useProgress()
  const { completed } = useStore()
  const route = location.pathname.replace(/^\//, '')
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => setNavOpen(false), [location.pathname])

  const exerciseDocs = docs.filter((d) => d.route.startsWith('exercises'))
  const shortTitle = (t: string) => t.replace(/^.*?—\s*/, '')

  return (
    <div className="app">
      <header className="topbar">
        <button className="icon-btn topbar__menu" onClick={() => setNavOpen(!navOpen)} title="Menu">
          ☰
        </button>
        <NavLink to="/" className="brand">
          ⚙️ Arena <span className="brand__sub">Zero → Hero</span>
        </NavLink>
        <button className="search-trigger" onClick={onOpenSearch}>
          🔍 Search course… <kbd>Ctrl</kbd>
          <kbd>K</kbd>
        </button>
        <div className="topbar__right">
          {route.startsWith('exercises/quiz') && <QuizScoreBadge route={route} />}
          {route && !route.startsWith('exercises/') && <CompleteToggle route={route} />}
          <ThemeToggle />
        </div>
      </header>

      <div className="shell">
        <aside className={`sidebar ${navOpen ? 'sidebar--open' : ''}`}>
          <div className="progress-card">
            <div className="progress-card__label">
              Course progress <b>{`${done}/${total}`}</b>
            </div>
            <div className="progress-bar">
              <div className="progress-bar__fill" style={{ width: `${Math.round(ratio * 100)}%` }} />
            </div>
          </div>

          <nav>
            <NavLink to="/readme" className="nav-group__title">
              🏠 Course home
            </NavLink>
            <div className="nav-label">Lessons</div>
            {lessons.map((l) => (
              <NavLink
                key={l.route}
                to={'/' + l.route}
                className={`nav-link ${completed[l.route] ? 'nav-link--done' : ''}`}
              >
                <span className="nav-link__check" />
                <span>{shortTitle(l.title)}</span>
              </NavLink>
            ))}
            <div className="nav-label">Exercises</div>
            {exerciseDocs.map((d) => (
              <NavLink key={d.route} to={'/' + d.route} className="nav-link nav-link--sub">
                <span>🧩 {shortTitle(d.title)}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="content">{children}</main>
      </div>
    </div>
  )
}
