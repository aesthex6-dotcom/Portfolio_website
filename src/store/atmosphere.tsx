import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export type AtmosphereLevel = 'low' | 'neutral' | 'high'

/** RGB triplets + scalar materiality for each room state. */
interface AtmosphereTokens {
  bg: [number, number, number]
  bgSoft: [number, number, number]
  surface: [number, number, number]
  raised: [number, number, number]
  faint: [number, number, number]
  grain: number
  vignette: number
}

/**
 * The three rooms. NEUTRAL is the as-designed state (matches index.css :root).
 * LOW deepens the charcoal, closes the vignette, thickens the grain — the room
 * settles in. HIGH lifts the room: lighter charcoal, softer shadows, less
 * grain. Faint is tuned per room so it clears 4.5:1 WCAG AA against the
 * *lightest* ground it sits on (raised panels) — the quiet tier stays moody,
 * never invisible: low 4.72:1, neutral 4.69:1, high 4.82:1.
 */
const LEVELS: Record<AtmosphereLevel, AtmosphereTokens> = {
  low: {
    bg: [14, 14, 14],
    bgSoft: [16, 16, 16],
    surface: [20, 20, 20],
    raised: [26, 26, 26],
    faint: [132, 134, 128],
    grain: 0.055,
    vignette: 0.75,
  },
  neutral: {
    bg: [23, 23, 23],
    bgSoft: [26, 26, 26],
    surface: [31, 31, 31],
    raised: [38, 38, 38],
    faint: [142, 144, 138],
    grain: 0.045,
    vignette: 0.45,
  },
  high: {
    bg: [29, 29, 29],
    bgSoft: [32, 32, 32],
    surface: [39, 39, 39],
    raised: [48, 48, 48],
    faint: [155, 157, 150],
    grain: 0.028,
    vignette: 0.2,
  },
}

const ORDER: AtmosphereLevel[] = ['low', 'neutral', 'high']

const STORAGE_KEY = 'portfolio:atmosphere'
const DURATION = 900

/** ease-out cubic — close to the house ease for a color crossfade. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

function loadLevel(): AtmosphereLevel {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === 'low' || raw === 'neutral' || raw === 'high') return raw
  } catch {
    /* storage unavailable — fall through to neutral */
  }
  return 'neutral'
}

function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
}

/** Read the current applied tokens (inline wins over the stylesheet). */
function readTokens(root: HTMLElement): AtmosphereTokens {
  const parse = (name: string): [number, number, number] => {
    const [a, b, c] = getComputedStyle(root).getPropertyValue(name).trim().split(/\s+/).map(Number)
    return [Number.isFinite(a) ? a : 23, Number.isFinite(b) ? b : 23, Number.isFinite(c) ? c : 23]
  }
  const num = (name: string, fallback: number) => {
    const v = parseFloat(getComputedStyle(root).getPropertyValue(name))
    return Number.isFinite(v) ? v : fallback
  }
  return {
    bg: parse('--bg-rgb'),
    bgSoft: parse('--bg-soft-rgb'),
    surface: parse('--surface-rgb'),
    raised: parse('--raised-rgb'),
    faint: parse('--faint-rgb'),
    grain: num('--grain-opacity', 0.045),
    vignette: num('--vignette-opacity', 0.45),
  }
}

/** Set every atmosphere token to a level's exact value. */
function snapTokens(root: HTMLElement, t: AtmosphereTokens) {
  const sets: Array<[string, [number, number, number]]> = [
    ['--bg', t.bg],
    ['--bg-soft', t.bgSoft],
    ['--surface', t.surface],
    ['--raised', t.raised],
    ['--faint', t.faint],
  ]
  for (const [name, [r, g, b]] of sets) {
    root.style.setProperty(name, toHex([r, g, b]))
    root.style.setProperty(`${name}-rgb`, `${r} ${g} ${b}`)
  }
  root.style.setProperty('--grain-opacity', String(t.grain))
  root.style.setProperty('--vignette-opacity', String(t.vignette))
}

/** Blend `from` → `to` at progress `p` and write both the hex and rgb forms. */
function lerpTokens(root: HTMLElement, from: AtmosphereTokens, to: AtmosphereTokens, p: number) {
  const mix = (a: [number, number, number], b: [number, number, number]) =>
    a.map((v, i) => v + (b[i] - v) * p) as [number, number, number]

  const sets: Array<[string, [number, number, number], [number, number, number]]> = [
    ['--bg', from.bg, to.bg],
    ['--bg-soft', from.bgSoft, to.bgSoft],
    ['--surface', from.surface, to.surface],
    ['--raised', from.raised, to.raised],
    ['--faint', from.faint, to.faint],
  ]
  for (const [name, a, b] of sets) {
    const [r, g, bl] = mix(a, b)
    root.style.setProperty(name, toHex([r, g, bl]))
    root.style.setProperty(`${name}-rgb`, `${r} ${g} ${bl}`)
  }
  root.style.setProperty('--grain-opacity', String(from.grain + (to.grain - from.grain) * p))
  root.style.setProperty('--vignette-opacity', String(from.vignette + (to.vignette - from.vignette) * p))
}

interface AtmosphereState {
  level: AtmosphereLevel
  setLevel: (level: AtmosphereLevel) => void
  /** Cycle low → neutral → high → low */
  cycle: () => void
}

const AtmosphereContext = createContext<AtmosphereState | null>(null)

export function AtmosphereProvider({ children }: { children: ReactNode }) {
  const [level, setLevel] = useState<AtmosphereLevel>(loadLevel)
  const firstRun = useRef(true)

  useEffect(() => {
    const root = document.documentElement
    const target = LEVELS[level]

    // First application snaps to the persisted room — no "room dims on
    // arrival" sweep on every load.
    if (firstRun.current) {
      firstRun.current = false
      snapTokens(root, target)
      return
    }

    // Reduced motion: the room still changes, it just doesn't sweep.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      snapTokens(root, target)
      return
    }

    const from = readTokens(root)
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = easeOut(Math.min((now - start) / DURATION, 1))
      lerpTokens(root, from, target, p)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [level])

  // Persist the chosen room.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, level)
    } catch {
      /* storage unavailable — non-critical */
    }
  }, [level])

  const cycle = useCallback(() => {
    setLevel((prev) => ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length])
  }, [])

  const value = useMemo<AtmosphereState>(() => ({ level, setLevel, cycle }), [level, cycle])

  return <AtmosphereContext.Provider value={value}>{children}</AtmosphereContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAtmosphere(): AtmosphereState {
  const ctx = useContext(AtmosphereContext)
  if (!ctx) throw new Error('useAtmosphere must be used inside <AtmosphereProvider>')
  return ctx
}
