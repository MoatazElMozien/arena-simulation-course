import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const KEY = 'arena-course-state-v1'

export type ScoreValue = 'got' | 'missed'
export type Theme = 'dark' | 'light'

interface StoreState {
  completed?: Record<string, boolean>
  quizzes?: Record<string, Record<string, ScoreValue>>
  theme?: Theme
}

interface StoreApi {
  completed: Record<string, boolean>
  quizzes: Record<string, Record<string, ScoreValue>>
  theme?: Theme
  completeLesson: (route: string) => void
  uncompleteLesson: (route: string) => void
  scoreQuestion: (route: string, index: number, value: ScoreValue) => void
  resetQuiz: (route: string) => void
  setTheme: (theme: Theme) => void
}

const StoreContext = createContext<StoreApi | null>(null)

function load(): StoreState {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}') as StoreState
  } catch {
    return {}
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(load)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  const completeLesson = (route: string) =>
    setState((s) => ({ ...s, completed: { ...s.completed, [route]: true } }))

  const uncompleteLesson = (route: string) =>
    setState((s) => {
      const completed = { ...s.completed }
      delete completed[route]
      return { ...s, completed }
    })

  const scoreQuestion = (route: string, index: number, value: ScoreValue) =>
    setState((s) => {
      const quizzes = { ...s.quizzes }
      const current = { ...(quizzes[route] || {}) }
      if (current[index] === value) delete current[index]
      else current[index] = value
      quizzes[route] = current
      return { ...s, quizzes }
    })

  const resetQuiz = (route: string) =>
    setState((s) => {
      const quizzes = { ...s.quizzes }
      delete quizzes[route]
      return { ...s, quizzes }
    })

  const setTheme = (theme: Theme) => setState((s) => ({ ...s, theme }))

  return (
    <StoreContext.Provider
      value={{
        completed: state.completed || {},
        quizzes: state.quizzes || {},
        theme: state.theme,
        completeLesson,
        uncompleteLesson,
        scoreQuestion,
        resetQuiz,
        setTheme,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
