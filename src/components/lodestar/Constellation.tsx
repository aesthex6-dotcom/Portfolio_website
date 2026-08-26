import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Chapter } from '@/data/chapters'
import { cn, seededRandom } from '@/lib/utils'

interface ConstellationProps {
  chapters: Chapter[]
  currentId: string | null
  /** Pixel width of the cluster — computed to stay inside the right gutter. */
  boxWidth: number
  /** Chapter to focus when the constellation opens (the current one). */
  focusTarget: string | null
  onSelect: (id: string) => void
  reduced: boolean
}

const HEIGHT = 248
const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Organic node positions inside the cluster, normalized to [0,1]². Deliberately
 * non-radial: each chapter sits at its own radius/angle so the layout reads as
 * a constellation, not a clock face. A deterministic jitter keeps it from
 * looking machine-perfect.
 */
const BASE: Record<string, [number, number]> = {
  skills: [0.04, 0.1],
  projects: [0.52, 0.04],
  mission: [0.16, 0.36],
  achievements: [0.76, 0.28],
  blog: [0.4, 0.6],
  contact: [0.08, 0.82],
}

function jitter(seed: string): number {
  return (seededRandom(seed.length * 7919 + seed.charCodeAt(0))() - 0.5) * 0.05
}

/**
 * The open constellation — a quiet cluster of chapter stars hanging below-left
 * of the Lodestar. It is pointer-transparent except for the nodes themselves,
 * so it never blocks the page behind it.
 */
export function Constellation({
  chapters,
  currentId,
  boxWidth,
  focusTarget,
  onSelect,
  reduced,
}: ConstellationProps) {
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [focusId, setFocusId] = useState<string | null>(focusTarget)

  // Move focus to the current chapter when the constellation opens.
  useEffect(() => {
    const target = focusTarget ?? chapters[0]?.id ?? null
    if (!target) return
    setFocusId(target)
    requestAnimationFrame(() => nodeRefs.current[target]?.focus())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const focusChapter = (id: string) => {
    setFocusId(id)
    requestAnimationFrame(() => nodeRefs.current[id]?.focus())
  }

  const step = (e: React.KeyboardEvent, dir: number) => {
    e.preventDefault()
    if (chapters.length === 0) return
    const i = chapters.findIndex((c) => c.id === focusId)
    const next = chapters[(i + dir + chapters.length) % chapters.length]
    focusChapter(next.id)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step(e, 1)
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step(e, -1)
    else if (e.key === 'Home') {
      e.preventDefault()
      const first = chapters[0]
      if (first) focusChapter(first.id)
    } else if (e.key === 'End') {
      e.preventDefault()
      const last = chapters[chapters.length - 1]
      if (last) focusChapter(last.id)
    }
  }

  return (
    <motion.div
      id="lodestar-constellation"
      role="group"
      aria-label="Chapters"
      className="pointer-events-none fixed z-[65]"
      style={{ right: 28, top: 50, width: boxWidth, height: HEIGHT }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: reduced ? 0 : 0.4, ease: EASE }}
      onKeyDown={onKeyDown}
    >
      {chapters.map((c) => {
        const [u, v] = BASE[c.id] ?? [0.5, 0.5]
        const x = (u + jitter(c.id)) * 100
        const y = (v + jitter(c.id)) * 100
        const isCurrent = c.id === currentId
        const isFocused = c.id === focusId
        const size = isCurrent ? 14 : isFocused ? 11 : 8

        return (
          <div key={c.id} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
            <button
              ref={(el) => {
                nodeRefs.current[c.id] = el
              }}
              type="button"
              tabIndex={isFocused ? 0 : -1}
              onClick={() => onSelect(c.id)}
              aria-label={`Go to ${c.label}`}
              aria-current={isCurrent ? 'true' : undefined}
              className="group relative grid cursor-pointer place-items-center rounded-full"
              style={{ width: Math.max(size, 22), height: Math.max(size, 22) }}
            >
              <span
                className="rounded-full transition-colors duration-300"
                style={{
                  width: size,
                  height: size,
                  background: isCurrent ? 'var(--accent)' : 'rgba(255,255,255,0.35)',
                  boxShadow: isCurrent ? '0 0 10px 2px rgba(124,107,255,0.45)' : undefined,
                  opacity: isCurrent ? 0.95 : 0.45,
                }}
                aria-hidden
              />
              {/* Hover / focus label — ephemeral, with a backdrop so it reads
                  cleanly even if it crosses the edge of the content column. */}
              <span
                className={cn(
                  'pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-full border border-white/5 bg-ground/80 px-2 py-0.5 font-mono text-[10px] tracking-wide text-faint backdrop-blur-md',
                  isFocused
                    ? 'opacity-100 visible'
                    : 'invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200',
                )}
              >
                {c.label}
              </span>
            </button>
          </div>
        )
      })}
    </motion.div>
  )
}
