import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useLodestar } from '@/hooks/useLodestar'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUI } from '@/store/ui'
import { clamp, cn } from '@/lib/utils'
import { Constellation } from './Constellation'
import { ChapterSheet } from './ChapterSheet'

const RING_R = 12
const RING_CIRC = 2 * Math.PI * RING_R
const EASE = [0.22, 1, 0.36, 1] as const

/** The star is a fixed point at `top-7 right-7` with a 44px hit area. */
const STAR_SIZE = 44
const STAR_TOP = 28
const STAR_RIGHT = 28
const STAR_CX = STAR_RIGHT + STAR_SIZE / 2
const STAR_CY = STAR_TOP + STAR_SIZE / 2

/**
 * The Lodestar — the site's navigation guide. It replaces the navbar.
 *
 * Root component is always mounted (it owns the global ⌘K / Ctrl+` shortcuts
 * the navbar used to), but the visible guide only exists on the home page.
 */
export function Lodestar() {
  const { setPaletteOpen, toggleTerminal } = useUI()

  // Keyboard shortcuts that lived in the navbar — command palette + terminal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault()
        toggleTerminal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPaletteOpen, toggleTerminal])

  const { pathname } = useLocation()
  if (pathname !== '/') return null
  return <LodestarGuide />
}

function LodestarGuide() {
  const { chapters, current, next } = useLodestar()
  const reduced = usePrefersReducedMotion()
  // The constellation needs a real right gutter (≥ ~1440px) plus a hover
  // pointer; anything smaller gets the bottom sheet instead.
  const constellationEligible = useMediaQuery('(min-width: 1440px) and (hover: hover)')

  const [emerged, setEmerged] = useState(false)
  const [open, setOpen] = useState<'constellation' | 'sheet' | null>(null)
  const [metrics, setMetrics] = useState({ boxWidth: 160, pillSpace: 120 })

  const starRef = useRef<HTMLButtonElement>(null)
  const ringRef = useRef<SVGCircleElement>(null)
  const hairlineRef = useRef<HTMLDivElement>(null)
  const chaptersRef = useRef(chapters)
  const currentRef = useRef<string | null>(null)
  const emergedRef = useRef(false)

  // Filament direction — scroll-driven, spring-smoothed (direct under reduced motion).
  const angleMV = useMotionValue(0)
  const springAngle = useSpring(angleMV, { stiffness: 55, damping: 18, restDelta: 0.5 })

  useEffect(() => {
    chaptersRef.current = chapters
  }, [chapters])

  useEffect(() => {
    currentRef.current = current?.id ?? null
  }, [current])

  // Measure the gutter once and on resize: how wide the constellation may be,
  // and how much room a persistent current-chapter pill has left of the star.
  useEffect(() => {
    const measure = () => {
      const vw = window.innerWidth
      const contentW = Math.min(vw - 48, 1152)
      const band = (vw - contentW) / 2
      const contentRight = vw - band
      setMetrics({
        boxWidth: clamp(band - 40, 96, 200),
        pillSpace: vw - (STAR_RIGHT + STAR_SIZE + 28) - contentRight,
      })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Scroll engine: emergence, progress ring + mobile hairline, filament bearing.
  const handleScroll = useCallback(() => {
    const list = chaptersRef.current
    if (list.length === 0) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const firstEl = document.getElementById(list[0].id)

    // Emergence — the guide arrives as the first chapter enters the viewport,
    // i.e. once the prologue (Hero + About) has been read.
    if (firstEl && !emergedRef.current) {
      if (firstEl.getBoundingClientRect().top < vh * 0.9) {
        emergedRef.current = true
        setEmerged(true)
      }
    }

    // Story progress → ring stroke + mobile top hairline.
    const lastEl = document.getElementById(list[list.length - 1].id)
    if (firstEl && lastEl && ringRef.current) {
      const firstTop = firstEl.getBoundingClientRect().top + window.scrollY
      const lastBottom = lastEl.getBoundingClientRect().bottom + window.scrollY
      const start = firstTop - vh * 0.9
      const end = lastBottom - vh * 0.15
      const p = clamp((window.scrollY - start) / (end - start), 0, 1)
      ringRef.current.style.strokeDashoffset = String(RING_CIRC * (1 - p))
      if (hairlineRef.current) hairlineRef.current.style.transform = `scaleX(${p})`
    }

    // Filament — a thread of light curving toward the next chapter.
    const cur = currentRef.current
    if (cur) {
      const ci = list.findIndex((c) => c.id === cur)
      const nextCh = ci >= 0 && ci < list.length - 1 ? list[ci + 1] : null
      const nextEl = nextCh ? document.getElementById(nextCh.id) : null
      if (nextEl) {
        const r = nextEl.getBoundingClientRect()
        const sx = vw - STAR_CX
        const sy = STAR_CY
        const deg = (Math.atan2(r.top - sy, r.left + r.width / 2 - sx) * 180) / Math.PI
        angleMV.set(deg)
      }
    }
  }, [angleMV])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const close = useCallback(() => {
    setOpen((o) => {
      if (o) starRef.current?.focus()
      return null
    })
  }, [])

  // Escape closes the constellation / sheet.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  const onStarClick = () => {
    setOpen((o) => (o ? null : constellationEligible ? 'constellation' : 'sheet'))
  }

  const goTo = (id: string) => {
    close()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  const pillMaxWidth = Math.min(Math.max(metrics.pillSpace - 10, 0), 150)
  const pillVisible = emerged && current && metrics.pillSpace >= 44

  return (
    <>
      {/* Mobile reading-progress hairline — the ring is the desktop signal. */}
      <motion.div
        className="no-print pointer-events-none fixed inset-x-0 top-0 z-[65] h-[2px] md:hidden"
        initial={false}
        animate={{ opacity: emerged ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.8 }}
        aria-hidden
      >
        <div
          ref={hairlineRef}
          className="h-full w-full origin-left bg-accent opacity-60"
          style={{ transform: 'scaleX(0)' }}
        />
      </motion.div>

      {/* The guide — star, ring, filament, current-chapter pill. */}
      <motion.div
        className={cn(
          'no-print fixed z-[65]',
          emerged ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        style={{ right: STAR_RIGHT, top: STAR_TOP }}
        initial={false}
        animate={{ opacity: emerged ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 1.2, ease: EASE }}
        aria-hidden={!emerged}
      >
        <div className="relative h-11 w-11">
          {/* Directional filament — points toward the next chapter. */}
          <motion.svg
            viewBox="0 0 128 128"
            className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 overflow-visible"
            style={{ x: '-50%', y: '-50%', rotate: reduced ? angleMV : springAngle }}
            animate={{ opacity: emerged && next && open !== 'constellation' ? 0.85 : 0 }}
            transition={{ duration: reduced ? 0 : 0.5 }}
            aria-hidden
          >
            <defs>
              <linearGradient id="lodestar-filament" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 64 64 C 88 60, 104 66, 118 62"
              stroke="url(#lodestar-filament)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </motion.svg>

          {/* Current-chapter pill — always subtly visible (when room permits). */}
          <span
            className={cn(
              'pointer-events-none absolute right-11 top-1/2 -translate-y-1/2 truncate rounded-full border border-white/5 bg-ground/60 px-2.5 py-1 font-mono text-[10px] tracking-wide text-faint backdrop-blur-md',
              pillVisible ? 'block' : 'hidden',
            )}
            style={{ maxWidth: pillMaxWidth }}
            aria-hidden
          >
            {current?.label}
          </span>

          <button
            ref={starRef}
            type="button"
            onClick={onStarClick}
            aria-expanded={open !== null}
            aria-controls={open === 'constellation' ? 'lodestar-constellation' : undefined}
            aria-label={
              open
                ? 'Close chapter navigation'
                : current
                  ? `Chapter navigation · current: ${current.label}`
                  : 'Open chapter navigation'
            }
            tabIndex={emerged ? 0 : -1}
            className={cn(
              'relative grid h-11 w-11 cursor-pointer place-items-center rounded-full transition-opacity duration-300',
              open ? 'opacity-95' : 'opacity-60 hover:opacity-90',
            )}
          >
            <span className="sr-only" aria-live="polite">
              {current ? `Current chapter: ${current.label}` : ''}
            </span>

            {/* Progress ring — fills as the story is read. */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 32 32"
              aria-hidden
            >
              <circle
                cx="16"
                cy="16"
                r={RING_R}
                fill="none"
                stroke="rgba(245,247,242,0.10)"
                strokeWidth="1.5"
              />
              <circle
                ref={ringRef}
                cx="16"
                cy="16"
                r={RING_R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={RING_CIRC}
                strokeDashoffset={RING_CIRC}
                opacity="0.55"
              />
            </svg>

            {/* Halo + core — a functional point of light, not a button. The
                green marks the live reading position. */}
            <span
              className="pointer-events-none absolute h-9 w-9 rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(199,255,56,0.12) 0%, transparent 70%)',
              }}
              aria-hidden
            />
            <span
              className="pointer-events-none relative h-[7px] w-[7px] rounded-full bg-[#f5f7f2]"
              style={{
                boxShadow:
                  '0 0 10px 2px rgba(199,255,56,0.3), 0 0 22px 8px rgba(199,255,56,0.12)',
              }}
              aria-hidden
            />
          </button>
        </div>
      </motion.div>

      {/* Constellation (desktop, wide gutter) */}
      <AnimatePresence>
        {open === 'constellation' && (
          <Constellation
            chapters={chapters}
            currentId={current?.id ?? null}
            boxWidth={metrics.boxWidth}
            focusTarget={current?.id ?? chapters[0]?.id ?? null}
            onSelect={goTo}
            reduced={reduced}
          />
        )}
      </AnimatePresence>

      {/* Bottom sheet (mobile / narrow screens) */}
      <AnimatePresence>
        {open === 'sheet' && (
          <ChapterSheet
            chapters={chapters}
            current={current}
            onClose={close}
            onSelect={goTo}
            reduced={reduced}
          />
        )}
      </AnimatePresence>
    </>
  )
}
