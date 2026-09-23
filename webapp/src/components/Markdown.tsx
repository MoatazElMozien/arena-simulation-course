import { useMemo, useState, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function textOf(node: ReactNode): string {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(textOf).join('')
  if (typeof node === 'object' && 'props' in node) return textOf((node as { props: { children?: ReactNode } }).props.children)
  return ''
}

/** Turns internal .md links into router links; external links open in a new tab. */
function MLink({
  href,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()

  if (href && href.endsWith('.md')) {
    const currentDir = location.pathname.split('/').slice(0, -1).join('/')
    let route: string
    if (href.startsWith('../')) route = href.replace('../', '').replace(/\.md$/, '')
    else if (href.startsWith('./')) route = href.replace('./', '').replace(/\.md$/, '')
    else if (href.includes('/')) route = href.replace(/\.md$/, '')
    else route = (currentDir ? currentDir + '/' : '') + href.replace(/\.md$/, '')

    return (
      <a
        href={'#/' + route}
        onClick={(e) => {
          e.preventDefault()
          navigate('/' + route)
        }}
        {...rest}
      >
        {children}
      </a>
    )
  }
  const external = href?.startsWith('http')
  return (
    <a href={href} target={external ? '_blank' : undefined} rel="noreferrer" {...rest}>
      {children}
    </a>
  )
}

/**
 * Collapsible <details> used for quiz answers.
 * On quiz pages, reveals self-scoring buttons (Knew it / Missed) once opened.
 */
function AnswerBlock({ children }: { children?: ReactNode }) {
  const location = useLocation()
  const { quizzes, scoreQuestion } = useStore()
  const route = location.pathname.replace(/^\//, '')
  const isQuiz = route.startsWith('exercises/quiz')
  const index = useDetailsIndex()
  const [isOpen, setIsOpen] = useState(false)
  const score = quizzes[route]?.[String(index)]

  return (
    <details className="answer" open={isOpen} onToggle={(e) => setIsOpen(e.currentTarget.open)}>
      {children}
      {isQuiz && isOpen && (
        <div className="score-row">
          <span className="score-row__label">How did you do?</span>
          <button
            className={`score-btn ${score === 'got' ? 'score-btn--got' : ''}`}
            onClick={() => scoreQuestion(route, index, 'got')}
          >
            ✓ Knew it
          </button>
          <button
            className={`score-btn ${score === 'missed' ? 'score-btn--missed' : ''}`}
            onClick={() => scoreQuestion(route, index, 'missed')}
          >
            ✗ Missed it
          </button>
        </div>
      )}
    </details>
  )
}

/** Stable index per <details> within a document render (details render in order). */
let detailsCounter = 0
function useDetailsIndex(): number {
  const [idx] = useState(() => detailsCounter++)
  return idx
}
function resetDetailsCounter(): void {
  detailsCounter = 0
}

function Heading({ level, children }: { level: number; children?: ReactNode }) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4'
  const id = slugify(textOf(children))
  return (
    <Tag id={id}>
      {level > 1 && (
        <a className="heading-anchor" href={`#${id}`} aria-label="Link to this section">
          #
        </a>
      )}
      {children}
    </Tag>
  )
}

export default function Markdown({ source }: { source: string }) {
  resetDetailsCounter()
  const components = useMemo(
    () =>
      ({
        h1: (p) => <Heading level={1}>{p.children}</Heading>,
        h2: (p) => <Heading level={2}>{p.children}</Heading>,
        h3: (p) => <Heading level={3}>{p.children}</Heading>,
        h4: (p) => <Heading level={4}>{p.children}</Heading>,
        a: MLink,
        details: AnswerBlock,
        table: ({ children }) => (
          <div className="table-wrap">
            <table>{children}</table>
          </div>
        ),
        /**
         * LAYOUT FIX: react-markdown v9 removed the `inline` prop, so plain
         * fenced blocks (``` with no language) were collapsing into one line.
         * `pre` now owns the block styling; `code` only styles inline spans.
         */
        pre: ({ children }) => <pre className="code-block">{children}</pre>,
        code: ({ className, children }) =>
          className ? (
            <code className={className}>{children}</code>
          ) : (
            <code className="inline-code">{children}</code>
          ),
      }) as Components,
    []
  )

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </ReactMarkdown>
  )
}
