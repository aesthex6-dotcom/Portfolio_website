import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useUI } from '@/store/ui'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { MotionValue } from 'framer-motion'

interface CinematicSequenceProps {
  scrollYProgress?: MotionValue<number>
  reduced?: boolean
}

/* Complete sequences — derived from corrected 35 source PNGs (gaps preserved).
   Knight: 35 chronological frames (001..042 with missing 21/28-32/34).
   Samurai: 50 frames (001..050). */
const KNIGHT_FRAMES = ["001","002","003","004","005","006","007","008","009","010","011","012","013","014","015","016","017","018","019","020","022","023","024","025","026","027","033","035","036","037","038","039","040","041","042"]
const SAMURAI_FRAMES = Array.from({ length: 50 }, (_, i) => (i + 1).toString().padStart(3, '0'))

function makeUrl(base: string, n: string) {
  return `/cinematics/${base}/frame_${n}.avif`
}

export function CinematicSequence({ scrollYProgress, reduced: propReduced }: CinematicSequenceProps) {
  const { mode } = useUI()
  const reduced = propReduced ?? usePrefersReducedMotion()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number>(0)

  /* Cached decoded images. Keyed by URL; bounded evict on idle. */
  const cacheRef = useRef<Map<string, HTMLImageElement>>(new Map())
  /* Track which URLs are actively loading to prevent duplicates. */
  const loadingRef = useRef<Set<string>>(new Set())
  /* Current mode and last drawn progress to detect switches / rapid scroll. */
  const stateRef = useRef({
    mode: mode as 'en' | 'ja',
    p: 0,
    url: '',
  })

  const frames = useMemo(() => (mode === 'ja' ? SAMURAI_FRAMES : KNIGHT_FRAMES), [mode])
  const base = useMemo(() => (mode === 'ja' ? 'samurai' : 'knight'), [mode])

  /* Build URL for ordinal index. */
  const urlFor = useCallback((idx: number) => makeUrl(base, frames[idx] ?? frames[0]!), [base, frames])

  /* Load a single frame into the bounded cache. */
  const loadImage = useCallback((url: string) => {
    if (cacheRef.current.has(url)) return
    if (loadingRef.current.has(url)) return
    loadingRef.current.add(url)
    const img = new Image()
    img.src = url
    img.onload = () => {
      loadingRef.current.delete(url)
      cacheRef.current.set(url, img)
      /* Evict distant frames when over budget (desktop ~6, mobile ~3). */
      const budget = window.innerWidth < 768 ? 3 : 6
      while (cacheRef.current.size > budget) {
        const first = cacheRef.current.keys().next().value as string
        if (first) cacheRef.current.delete(first)
      }
    }
    img.onerror = () => {
      loadingRef.current.delete(url)
    }
  }, [])

  /* Preload neighbors around index. */
  const preload = useCallback((idx: number) => {
    const n = frames.length
    // Prioritize current + one ahead (direction of scroll) + one behind.
    const targets = [
      idx,
      Math.min(idx + 1, n - 1),
      Math.max(idx - 1, 0),
      Math.min(idx + 2, n - 1),
      Math.max(idx - 2, 0),
    ]
    for (const t of targets) {
      const url = urlFor(t)
      if (url) loadImage(url)
    }
  }, [frames, urlFor, loadImage])

  /* Render loop — runs via requestAnimationFrame, not React state updates. */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      const parent = canvas.parentElement
      const w = parent ? parent.clientWidth : window.innerWidth
      const h = parent ? parent.clientHeight : window.innerHeight
      // Cap to viewport; maintain 16:9 approximate canvas backing.
      width = w
      height = h
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    /* Subscribe to existing scroll progress if provided. */
    let unsubFn: (() => void) | undefined
    if (scrollYProgress) {
      unsubFn = scrollYProgress.on('change', (p: number) => {
        stateRef.current.p = p
      })
    }

    /* Draw with non-null ctx (guarded by return above). */
    function tick() {
      const p = stateRef.current.p
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const currentMode = stateRef.current.mode
      const currentUrl = stateRef.current.url

      // Detect mode switch: if mode changed or url not matching, recalc.
      const targetIdx = Math.round(Math.min(1, Math.max(0, p)) * (frames.length - 1))
      const targetUrl = urlFor(targetIdx)

      if (currentMode !== mode || currentUrl !== targetUrl) {
        stateRef.current.mode = mode as 'en' | 'ja'
        stateRef.current.url = targetUrl
        preload(targetIdx)
      }

      // Draw nearest available decoded image.
      const img = cacheRef.current.get(targetUrl)
      if (img && img.complete && img.naturalWidth > 0) {
        // Cover-style centered draw.
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
        const dw = img.naturalWidth * scale
        const dh = img.naturalHeight * scale
        const dx = (width - dw) / 2
        const dy = (height - dh) / 2
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, dx, dy, dw, dh)
      } else {
        // Still loading: show neutral dark background (not blank white).
        // Preserve existing dark palette.
        if (canvas.style.display !== 'none') {
          // Only clear if we haven't drawn anything yet; keep previous frame if available.
          // For first load, draw dark bg.
          const last = cacheRef.current.values()
          let drawn = false
          for (const prev of last) {
            if (prev.complete && prev.naturalWidth > 0) {
              const s = Math.max(width / prev.naturalWidth, height / prev.naturalHeight)
              const dw = prev.naturalWidth * s
              const dh = prev.naturalHeight * s
              const dx = (width - dw) / 2
              const dy = (height - dh) / 2
              ctx.drawImage(prev, dx, dy, dw, dh)
              drawn = true
              break
            }
          }
          if (!drawn) {
            ctx.fillStyle = '#0b0b0c'
            ctx.fillRect(0, 0, width, height)
          }
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resize)
      if (unsubFn) unsubFn()
      cancelAnimationFrame(rafRef.current)
    }
  }, [mode, frames, urlFor, preload, scrollYProgress, reduced])

  /* Reduced-motion: hold at p = 0.62 (matches SVG static frame) — handled by parent via prop if needed.
     We rely on parent to pass reduced; here just render at fixed proxy when true. */
  useEffect(() => {
    if (reduced) {
      stateRef.current.p = 0.62
    }
  }, [reduced])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ willChange: 'transform, opacity' }}
      aria-label="Cinematic sequence"
    />
  )
}
