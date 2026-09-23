/**
 * Loads the course Markdown files directly from the parent folder — single
 * source of truth: edit the .md files and the app picks them up (on reload).
 */
export interface Doc {
  route: string
  raw: string
  title: string
  isQuiz: boolean
  isHome: boolean
}

// Explicit patterns only: `**` would sweep up node_modules and webapp/README.md.
const lessonModules = import.meta.glob<string>(
  ['../../README.md', '../../[0-9][0-9]-*.md', '../exercises/*.md'],
  { query: '?raw', import: 'default', eager: true }
)

function routeFromPath(path: string): string {
  // '../../README.md' -> 'readme', '../../03-basic-modeling.md' -> '03-basic-modeling'
  // '../exercises/quiz-basics.md' -> 'exercises/quiz-basics'
  const clean = path
    .replace(/^\.\.\/\.\.\//, '')
    .replace(/^\.\.\//, '')
    .replace(/\.md$/, '')
  return clean.toLowerCase()
}

function titleFromContent(raw: string, fallback: string): string {
  const m = raw.match(/^#\s+(.+)$/m)
  return m ? m[1].replace(/\*\*/g, '').trim() : fallback
}

export const docs: Doc[] = Object.entries(lessonModules)
  .map(([path, raw]) => {
    const route = routeFromPath(path)
    return {
      route,
      raw,
      title: titleFromContent(raw, route),
      isQuiz: route.startsWith('exercises/quiz'),
      isHome: route === 'readme',
    }
  })
  .sort((a, b) => {
    const rank = (d: Doc) => (d.isHome ? 0 : d.route.startsWith('0') ? 1 : 2)
    if (rank(a) !== rank(b)) return rank(a) - rank(b)
    return a.route.localeCompare(b.route)
  })

export const lessons: Doc[] = docs.filter((d) => !d.isHome && !d.route.startsWith('exercises'))

export const home: Doc | undefined = docs.find((d) => d.isHome)

export function getDoc(route: string): Doc | undefined {
  return docs.find((d) => d.route === route.toLowerCase())
}

/** Plain text of a doc, for full-text search. */
export function plainText(doc: Doc): string {
  return doc.raw
    .replace(/```[\s\S]*?```/g, ' ') // drop code blocks
    .replace(/<[^>]+>/g, ' ') // drop html (details/summary tags)
    .replace(/[#*|`>_~-]/g, ' ') // drop markdown punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

export interface SearchResult {
  doc: Doc
  snippet: string
}

export function searchDocs(query: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const results: SearchResult[] = []
  for (const doc of docs) {
    const text = plainText(doc)
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) {
      if (doc.title.toLowerCase().includes(q)) results.push({ doc, snippet: doc.title })
      continue
    }
    const start = Math.max(0, idx - 60)
    const snippet = (start > 0 ? '…' : '') + text.slice(start, idx + q.length + 90) + '…'
    results.push({ doc, snippet })
  }
  return results.slice(0, 8)
}
