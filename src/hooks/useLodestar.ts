import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { chapters, type Chapter } from '@/data/chapters'
import { useUI } from '@/store/ui'

export interface LodestarState {
  /** Chapters present in the DOM (prologue + recruiter-mode filtering). */
  chapters: Chapter[]
  /** The chapter currently occupying the active band of the viewport. */
  current: Chapter | null
  /** The chapter after the current one — the directional filament's target. */
  next: Chapter | null
}

/**
 * Chapter tracking for the Lodestar.
 *
 * - Discovers which chapters actually exist on the page (recruiter mode drops
 *   Achievements/Blog), re-running after the recruiter-mode transition settles.
 * - Tracks the active chapter with an IntersectionObserver, preferring the
 *   section nearest the top of the viewport (same band the navbar used).
 */
export function useLodestar(): LodestarState {
  const { recruiterMode } = useUI()
  const { pathname } = useLocation()
  const [available, setAvailable] = useState<Chapter[]>(chapters)
  const [currentId, setCurrentId] = useState<string | null>(null)

  // Discover which chapters are mounted. Runs twice: immediately, and again
  // after Home's AnimatePresence mode="wait" transition finishes (~0.35s), so
  // a recruiter-mode toggle settles before we trust the DOM.
  useEffect(() => {
    const discover = () => {
      const present = chapters.filter((c) => document.getElementById(c.id))
      setAvailable((prev) =>
        prev.length === present.length && prev.every((c, i) => c.id === present[i].id)
          ? prev
          : present,
      )
    }
    const t0 = window.setTimeout(discover, 0)
    const t1 = window.setTimeout(discover, 500)
    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
    }
  }, [recruiterMode, pathname])

  // Track the active chapter over whatever chapters are currently mounted.
  useEffect(() => {
    if (available.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setCurrentId(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: 0 },
    )
    for (const c of available) {
      const el = document.getElementById(c.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [available])

  const current = available.find((c) => c.id === currentId) ?? null
  const currentIndex = current ? available.findIndex((c) => c.id === current.id) : -1
  const next =
    current && currentIndex >= 0 && currentIndex < available.length - 1
      ? available[currentIndex + 1]
      : null

  return { chapters: available, current, next }
}
