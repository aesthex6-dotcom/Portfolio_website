import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface UIState {
  terminalOpen: boolean
  paletteOpen: boolean
  chatOpen: boolean
  hackerMode: boolean
  recruiterMode: boolean
  matrixActive: boolean
  duckVisible: boolean
  snakeOpen: boolean
  openTerminal: () => void
  closeTerminal: () => void
  toggleTerminal: () => void
  setPaletteOpen: (v: boolean) => void
  setChatOpen: (v: boolean) => void
  setHackerMode: (v: boolean) => void
  setRecruiterMode: (v: boolean) => void
  setMatrixActive: (v: boolean) => void
  setDuckVisible: (v: boolean) => void
  setSnakeOpen: (v: boolean) => void
  unlockedBadges: string[]
  unlockBadge: (id: string) => void
  isBadgeUnlocked: (id: string) => boolean
}

const UIContext = createContext<UIState | null>(null)

const BADGES_KEY = 'portfolio:badges'

function loadBadges(): string[] {
  try {
    const raw = localStorage.getItem(BADGES_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [hackerMode, setHackerModeState] = useState(false)
  const [recruiterMode, setRecruiterModeState] = useState(false)
  const [matrixActive, setMatrixActiveState] = useState(false)
  const [duckVisible, setDuckVisible] = useState(false)
  const [snakeOpen, setSnakeOpen] = useState(false)
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(loadBadges)

  // Hacker mode + matrix mutate <html> classes for global theming.
  useEffect(() => {
    document.documentElement.classList.toggle('hacker-mode', hackerMode)
  }, [hackerMode])

  useEffect(() => {
    document.documentElement.classList.toggle('matrix-mode', matrixActive)
  }, [matrixActive])

  // Recruiter mode flips an <html> class so CSS can quiet decorative motion.
  useEffect(() => {
    document.documentElement.classList.toggle('recruiter-mode', recruiterMode)
  }, [recruiterMode])

  // Persist badges
  useEffect(() => {
    try {
      localStorage.setItem(BADGES_KEY, JSON.stringify(unlockedBadges))
    } catch {
      /* storage unavailable — non-critical */
    }
  }, [unlockedBadges])

  const setHackerMode = useCallback((v: boolean) => {
    setHackerModeState(v)
    if (v) setMatrixActiveState(false)
  }, [])

  const setMatrixActive = useCallback((v: boolean) => {
    setMatrixActiveState(v)
  }, [])

  const setRecruiterMode = useCallback((v: boolean) => {
    setRecruiterModeState(v)
  }, [])

  const unlockBadge = useCallback((id: string) => {
    setUnlockedBadges((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }, [])

  const isBadgeUnlocked = useCallback((id: string) => unlockedBadges.includes(id), [unlockedBadges])

  const value = useMemo<UIState>(
    () => ({
      terminalOpen,
      paletteOpen,
      chatOpen,
      hackerMode,
      recruiterMode,
      matrixActive,
      duckVisible,
      snakeOpen,
      openTerminal: () => setTerminalOpen(true),
      closeTerminal: () => setTerminalOpen(false),
      toggleTerminal: () => setTerminalOpen((v) => !v),
      setPaletteOpen,
      setChatOpen,
      setHackerMode,
      setRecruiterMode,
      setMatrixActive,
      setDuckVisible,
      setSnakeOpen,
      unlockedBadges,
      unlockBadge,
      isBadgeUnlocked,
    }),
    [
      terminalOpen,
      paletteOpen,
      chatOpen,
      hackerMode,
      recruiterMode,
      matrixActive,
      duckVisible,
      snakeOpen,
      unlockedBadges,
      unlockBadge,
      isBadgeUnlocked,
      setHackerMode,
      setRecruiterMode,
      setMatrixActive,
    ],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

// Co-locating the context hook with its provider is the standard React
// context pattern; the react-refresh "only-export-components" rule (a Fast
// Refresh perf hint) doesn't apply here.
// eslint-disable-next-line react-refresh/only-export-components
export function useUI(): UIState {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>')
  return ctx
}
