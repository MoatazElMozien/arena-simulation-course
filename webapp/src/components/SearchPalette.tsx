import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchDocs, type SearchResult } from '../content.ts'

export default function SearchPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const results = useMemo<SearchResult[]>(() => searchDocs(query), [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const go = (route: string) => {
    navigate('/' + route)
    onClose()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    }
    if (e.key === 'Enter' && results[selected]) go(results[selected].doc.route)
  }

  return (
    <div className="palette-backdrop" onClick={onClose}>
      <div className="palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected(0)
          }}
          onKeyDown={onKeyDown}
          placeholder="Search the course… (lessons, concepts, quizzes)"
        />
        <div className="palette-results">
          {query.trim().length >= 2 && results.length === 0 && (
            <div className="palette-empty">No matches for “{query}”</div>
          )}
          {results.map((r, i) => (
            <button
              key={r.doc.route}
              className={`palette-item ${i === selected ? 'palette-item--sel' : ''}`}
              onMouseEnter={() => setSelected(i)}
              onClick={() => go(r.doc.route)}
            >
              <span className="palette-title">{r.doc.title}</span>
              <span className="palette-snippet">{highlight(r.snippet, query)}</span>
            </button>
          ))}
          {query.trim().length < 2 && (
            <div className="palette-hint">
              Type at least 2 characters — try “queue”, “warm-up”, “Batch”…
            </div>
          )}
        </div>
        <div className="palette-footer">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  )
}

function highlight(text: string, q: string): ReactNode {
  const needle = q.trim()
  const idx = text.toLowerCase().indexOf(needle.toLowerCase())
  if (idx === -1 || !needle) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + needle.length)}</mark>
      {text.slice(idx + needle.length)}
    </>
  )
}
