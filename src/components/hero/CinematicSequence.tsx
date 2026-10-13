import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useUI } from '@/store/ui'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { MotionValue } from 'framer-motion'

interface CinematicSequenceProps {
  scrollYProgress?: MotionValue<number>
  reduced?: boolean
}

type SequenceBase = 'knight' | 'samurai'

const TOTAL_FRAMES = 120
const FRAME_STRINGS = Array.from({ length: TOTAL_FRAMES }, (_, i) =>
  (i + 1).toString().padStart(3, '0')
)

function makeUrl(base: SequenceBase, frameStr: string): string {
  return `/cinematics/${base}/frame_${frameStr}.avif`
}

interface FrameRecord {
  img: HTMLImageElement
  base: SequenceBase
  index: number
}

export function CinematicSequence({ scrollYProgress, reduced: propReduced }: CinematicSequenceProps) {
  const { mode } = useUI()
  const reduced = propReduced ?? usePrefersReducedMotion()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scheduleDrawRef = useRef<(() => void) | null>(null)

  const base: SequenceBase = useMemo(() => (mode === 'ja' ? 'samurai' : 'knight'), [mode])

  // Cache: Map keyed by URL with decoded images
  const cacheRef = useRef<Map<string, FrameRecord>>(new Map())
  // Currently loading / decoding URLs to avoid duplicate fetches
  const inFlightRef = useRef<Set<string>>(new Set())
  // Pending load queue with prioritized URLs
  const queueRef = useRef<Array<{ url: string; base: SequenceBase; index: number }>>([])

  // Track runtime state for render loop and directional prefetching
  const stateRef = useRef({
    p: 0,
    lastP: 0,
    direction: 1 as 1 | -1, // 1 = scrolling down (forward), -1 = scrolling up (reverse)
    base,
    targetIdx: 0,
    lastDrawn: null as FrameRecord | null,
    isMounted: true,
  })

  // Synchronize base changes
  useEffect(() => {
    stateRef.current.base = base
  }, [base])

  // Synchronize reduced-motion
  useEffect(() => {
    if (reduced) {
      stateRef.current.p = 0.62
      stateRef.current.targetIdx = Math.round(0.62 * (TOTAL_FRAMES - 1))
      scheduleDrawRef.current?.()
    }
  }, [reduced])

  // Evict distant frames when cache exceeds memory budget
  const evictDistantFrames = useCallback((currentIdx: number, currentBase: SequenceBase) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const maxCapacity = isMobile ? 16 : 32

    const cache = cacheRef.current
    if (cache.size <= maxCapacity) return

    // Find entries with largest distance from current index, prioritizing other modes for eviction
    const entries = Array.from(cache.entries())
    entries.sort(([, a], [, b]) => {
      const distA = a.base === currentBase ? Math.abs(a.index - currentIdx) : 1000 + a.index
      const distB = b.base === currentBase ? Math.abs(b.index - currentIdx) : 1000 + b.index
      return distB - distA // descending distance
    })

    for (const [url, item] of entries) {
      if (cache.size <= maxCapacity) break
      // Never evict the currently displayed frame or immediate neighbors
      if (item.base === currentBase && Math.abs(item.index - currentIdx) <= 2) {
        continue
      }
      cache.delete(url)
      // Allow garbage collection of bitmap
      item.img.src = ''
    }
  }, [])

  // Process next items in loading queue
  const processQueue = useCallback(() => {
    const MAX_CONCURRENT = 4
    const inFlight = inFlightRef.current
    const queue = queueRef.current
    const cache = cacheRef.current

    while (inFlight.size < MAX_CONCURRENT && queue.length > 0) {
      const item = queue.shift()!
      const { url, base: itemBase, index: itemIdx } = item

      if (cache.has(url) || inFlight.has(url)) continue

      inFlight.add(url)
      const img = new Image()

      const finishLoad = (success: boolean) => {
        inFlight.delete(url)
        if (!stateRef.current.isMounted) return

        if (success && img.naturalWidth > 0) {
          cache.set(url, { img, base: itemBase, index: itemIdx })
          evictDistantFrames(stateRef.current.targetIdx, stateRef.current.base)
          if (itemBase === stateRef.current.base && Math.abs(itemIdx - stateRef.current.targetIdx) <= 2) {
            scheduleDrawRef.current?.()
          }
        }
        processQueue()
      }

      img.src = url

      const startDecode = async () => {
        try {
          if (typeof img.decode === 'function') {
            await img.decode()
            finishLoad(true)
            return
          }
        } catch {
          // If decode rejects or is interrupted, fallback to naturalWidth or load events
        }

        if (img.complete && img.naturalWidth > 0) {
          finishLoad(true)
        } else {
          img.onload = () => finishLoad(true)
          img.onerror = () => finishLoad(false)
        }
      }

      startDecode()
    }
  }, [evictDistantFrames])

  // Request frames around target index with directional priority
  const requestFrames = useCallback(
    (targetIdx: number, targetBase: SequenceBase, dir: 1 | -1) => {
      const aheadCount = 8
      const behindCount = 3
      const lookahead: number[] = []

      // Priority 1: Current target frame
      lookahead.push(targetIdx)

      // Priority 2: Lookahead in direction of scroll
      for (let i = 1; i <= aheadCount; i++) {
        const next = dir === 1 ? targetIdx + i : targetIdx - i
        if (next >= 0 && next < TOTAL_FRAMES) {
          lookahead.push(next)
        }
      }

      // Priority 3: Lookahead behind scroll direction
      for (let i = 1; i <= behindCount; i++) {
        const prev = dir === 1 ? targetIdx - i : targetIdx + i
        if (prev >= 0 && prev < TOTAL_FRAMES) {
          lookahead.push(prev)
        }
      }

      // Filter and prioritize new requests
      const newItems: Array<{ url: string; base: SequenceBase; index: number }> = []
      for (const idx of lookahead) {
        const url = makeUrl(targetBase, FRAME_STRINGS[idx]!)
        if (!cacheRef.current.has(url) && !inFlightRef.current.has(url)) {
          newItems.push({ url, base: targetBase, index: idx })
        }
      }

      // Retain only queued items within a reasonable neighborhood (window of 16 frames)
      const filteredQueue = queueRef.current.filter((item) => {
        if (item.base !== targetBase) return false
        return Math.abs(item.index - targetIdx) <= 16
      })

      // Put new high-priority items at front of queue (deduplicating)
      const existingUrls = new Set(filteredQueue.map((q) => q.url))
      const combined = [...filteredQueue]
      for (const it of newItems) {
        if (!existingUrls.has(it.url)) {
          combined.unshift(it)
          existingUrls.add(it.url)
        }
      }

      queueRef.current = combined
      processQueue()
    },
    [processQueue]
  )

  // Preload initial frames on mount or mode switch
  useEffect(() => {
    stateRef.current.isMounted = true
    const currentIdx = stateRef.current.targetIdx
    requestFrames(currentIdx, base, stateRef.current.direction)

    return () => {
      stateRef.current.isMounted = false
    }
  }, [base, requestFrames])

  // On-demand render loop via requestAnimationFrame (no idle continuous rAF polling)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let currentDpr = 0
    let rafId = 0

    function resize() {
      const c = canvasRef.current
      if (!c) return
      const context = c.getContext('2d')
      if (!context) return
      const parent = c.parentElement
      const w = parent ? parent.clientWidth : window.innerWidth
      const h = parent ? parent.clientHeight : window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      if (width !== w || height !== h || currentDpr !== dpr) {
        width = w
        height = h
        currentDpr = dpr
        c.width = Math.round(w * dpr)
        c.height = Math.round(h * dpr)
        c.style.width = `${w}px`
        c.style.height = `${h}px`
        context.setTransform(dpr, 0, 0, dpr, 0, 0)
        context.imageSmoothingEnabled = true
        context.imageSmoothingQuality = 'high'
        scheduleDraw()
      }
    }

    function draw() {
      const c = canvasRef.current
      if (!c) return
      const context = c.getContext('2d')
      if (!context) return

      const currentBase = stateRef.current.base
      const targetIdx = stateRef.current.targetIdx
      const targetUrl = makeUrl(currentBase, FRAME_STRINGS[targetIdx]!)

      // 1. Check if exact target frame is decoded
      let frameToDraw: FrameRecord | null = cacheRef.current.get(targetUrl) ?? null

      // 2. If target frame not ready, find the closest decoded frame in current sequence
      if (!frameToDraw) {
        const last = stateRef.current.lastDrawn
        if (last && last.base === currentBase) {
          frameToDraw = last
        } else {
          let minDistance = Infinity
          for (const item of cacheRef.current.values()) {
            if (item.base === currentBase) {
              const dist = Math.abs(item.index - targetIdx)
              if (dist < minDistance) {
                minDistance = dist
                frameToDraw = item
              }
            }
          }
        }
      }

      // 3. Draw image with centered cover scaling
      if (frameToDraw && frameToDraw.img.naturalWidth > 0) {
        const img = frameToDraw.img
        const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight)
        const dw = img.naturalWidth * scale
        const dh = img.naturalHeight * scale
        const dx = (width - dw) / 2
        const dy = (height - dh) / 2

        context.drawImage(img, dx, dy, dw, dh)
        stateRef.current.lastDrawn = frameToDraw
      } else {
        if (!stateRef.current.lastDrawn) {
          context.fillStyle = '#0b0b0c'
          context.fillRect(0, 0, width, height)
        }
      }
    }

    const scheduleDraw = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        draw()
      })
    }
    scheduleDrawRef.current = scheduleDraw

    resize()
    window.addEventListener('resize', resize)

    // Subscribe to Framer Motion scroll progress
    let unsubFn: (() => void) | undefined
    if (scrollYProgress) {
      const initialP = scrollYProgress.get()
      if (typeof initialP === 'number') {
        stateRef.current.p = initialP
        stateRef.current.lastP = initialP
        stateRef.current.targetIdx = Math.round(
          Math.min(1, Math.max(0, initialP)) * (TOTAL_FRAMES - 1)
        )
      }

      unsubFn = scrollYProgress.on('change', (p: number) => {
        const delta = p - stateRef.current.lastP
        if (Math.abs(delta) > 0.0005) {
          stateRef.current.direction = delta >= 0 ? 1 : -1
        }
        stateRef.current.lastP = stateRef.current.p
        stateRef.current.p = p

        if (!reduced) {
          const nextIdx = Math.round(Math.min(1, Math.max(0, p)) * (TOTAL_FRAMES - 1))
          if (nextIdx !== stateRef.current.targetIdx) {
            stateRef.current.targetIdx = nextIdx
            requestFrames(nextIdx, stateRef.current.base, stateRef.current.direction)
            scheduleDraw()
          }
        }
      })
    }

    // Initial draw
    scheduleDraw()

    return () => {
      window.removeEventListener('resize', resize)
      if (unsubFn) unsubFn()
      cancelAnimationFrame(rafId)
      scheduleDrawRef.current = null
    }
  }, [base, reduced, scrollYProgress, requestFrames])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ willChange: 'transform, opacity' }}
      aria-label="Cinematic sequence"
    />
  )
}
