import { useStore } from '../store.tsx'
import { lessons } from '../content.ts'

/** Quiz scoring summary — rendered in the topbar when viewing a quiz page. */
export function QuizScoreBadge({ route }: { route: string }) {
  const { quizzes, resetQuiz } = useStore()
  const scores = quizzes[route] || {}
  const values = Object.values(scores)
  if (values.length === 0) return null
  const got = values.filter((v) => v === 'got').length
  const missed = values.filter((v) => v === 'missed').length
  const total = got + missed
  return (
    <div
      className={`quiz-badge ${got >= missed ? 'quiz-badge--good' : 'quiz-badge--bad'}`}
      title="Your self-score for this quiz"
    >
      <span>
        {got}/{total} correct
      </span>
      <button
        className="quiz-badge__reset"
        onClick={() => resetQuiz(route)}
        title="Reset scores"
        aria-label="Reset quiz scores"
      >
        ↺
      </button>
    </div>
  )
}

/** Lesson "mark complete" control for the topbar. */
export function CompleteToggle({ route }: { route: string }) {
  const { completed, completeLesson, uncompleteLesson } = useStore()
  const done = !!completed[route]
  return (
    <button
      className={`complete-toggle ${done ? 'complete-toggle--on' : ''}`}
      onClick={() => (done ? uncompleteLesson(route) : completeLesson(route))}
      title={done ? 'Mark as not completed' : 'Mark lesson as completed'}
    >
      {done ? '✓ Completed' : 'Mark complete'}
    </button>
  )
}

/** Overall course progress. */
export function useProgress(): { done: number; total: number; ratio: number } {
  const { completed } = useStore()
  const done = lessons.filter((l) => completed[l.route]).length
  return { done, total: lessons.length, ratio: lessons.length ? done / lessons.length : 0 }
}
