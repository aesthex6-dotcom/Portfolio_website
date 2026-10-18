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
  asset: ImageBitmap | HTMLImageElement
  base: SequenceBase
  index: number
}

export function CinematicSequence({ scrollYProgress, reduced: propReduced }: CinematicSequenceProps) {
  const { mode } = useUI()
  const reduced = propReduced ?? usePrefersReducedMotion()

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scheduleDrawRef = useRef<(() => void) | null>(null)

  const base: SequenceBase = useMemo(() => (mode === 'ja' ? 'samurai' : 'knight'), [mode])

  // Cache: Map keyed by URL with decoded assets (ImageBitmap or HTMLImageElement)
  const cacheRef = useRef<Map<string, FrameRecord>>(new Map())
  // Currently loading URLs to avoid duplicate fetches
  const inFlightRef = useRef<Set<string>>(new Set())
  // Pending load queue
  const queueRef = useRef<Array<{ url: string; base: SequenceBase; index: number; priority: number }>>([])

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

  // Process load queue with high concurrency (up to 8 concurrent requests for lightning-fast full preloading)
  const processQueue = useCallback(() => {
    const MAX_CONCURRENT = 8
    const inFlight = inFlightRef.current
    const queue = queueRef.current
    const cache = cacheRef.current

    // Sort queue by priority (lower number = higher priority)
    queue.sort((a, b) => a.priority - b.priority)

    while (inFlight.size < MAX_CONCURRENT && queue.length > 0) {
      const item = queue.shift()!
      const { url, base: itemBase, index: itemIdx } = item

      if (cache.has(url) || inFlight.has(url)) continue

      inFlight.add(url)

      const loadAsset = async () => {
        try {
          // Try createImageBitmap for off-main-thread hardware-accelerated decoding
          const response = await fetch(url)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const blob = await response.blob()

          if (typeof window !== 'undefined' && typeof createImageBitmap === 'function') {
            const bitmap = await createImageBitmap(blob)
            if (!stateRef.current.isMounted) {
              bitmap.close()
              inFlight.delete(url)
              return
            }
            cache.set(url, { asset: bitmap, base: itemBase, index: itemIdx })
            inFlight.delete(url)

            // If this frame is close to target, trigger draw
            if (itemBase === stateRef.current.base && Math.abs(itemIdx - stateRef.current.targetIdx) <= 2) {
              scheduleDrawRef.current?.()
            }
            processQueue()
            return
          }
        } catch {
          // Fallback to HTMLImageElement if createImageBitmap fails or is unavailable
        }

        // Fallback loader
        const img = new Image()
        img.src = url
        img.onload = () => {
          inFlight.delete(url)
          if (!stateRef.current.isMounted) return
          if (img.naturalWidth > 0) {
            cache.set(url, { asset: img, base: itemBase, index: itemIdx })
            if (itemBase === stateRef.current.base && Math.abs(itemIdx - stateRef.current.targetIdx) <= 2) {
              scheduleDrawRef.current?.()
            }
          }
          processQueue()
        }
        img.onerror = () => {
          inFlight.delete(url)
          if (!stateRef.current.isMounted) return
          processQueue()
        }
      }

      loadAsset()
    }
  }, [])

  // Queue all frames for the active base: immediate priority for targetIdx and surroundings, background priority for the rest
  const queueAllFrames = useCallback(
    (targetIdx: number, targetBase: SequenceBase, dir: 1 | -1) => {
      const queue = queueRef.current
      const cache = cacheRef.current
      const inFlight = inFlightRef.current

      // Build prioritized list of all 120 frames
      const newItems: Array<{ url: string; base: SequenceBase; index: number; priority: number }> = []

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const url = makeUrl(targetBase, FRAME_STRINGS[i]!)
        if (cache.has(url) || inFlight.has(url)) continue

        // Calculate priority: distance from targetIdx, with directional bias
        let dist = Math.abs(i - targetIdx)
        if (dir === 1 && i < targetIdx) dist += 20 // moving down, prior frames slightly lower priority
        if (dir === -1 && i > targetIdx) dist += 20 // moving up, later frames slightly lower priority
        if (i === targetIdx) dist = 0 // absolute highest priority

        newItems.push({ url, base: targetBase, index: i, priority: dist })
      }

      // Merge into queue, keeping existing items and sorting by priority
      const existingUrls = new Set(queue.map((q) => q.url))
      for (const it of newItems) {
        if (!existingUrls.has(it.url)) {
          queue.push(it)
          existingUrls.add(it.url)
        }
      }

      processQueue()
    },
    [processQueue]
  )

  // Preload initial frames on mount or mode switch
  useEffect(() => {
    stateRef.current.isMounted = true
    const currentIdx = stateRef.current.targetIdx
    queueAllFrames(currentIdx, base, stateRef.current.direction)

    return () => {
      stateRef.current.isMounted = false
    }
  }, [base, queueAllFrames])

  // On-demand render loop via requestAnimationFrame
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

      // 1. Check if exact target frame is cached
      let frameToDraw: FrameRecord | null = cacheRef.current.get(targetUrl) ?? null

      // 2. If target frame not ready, find the closest cached frame in current sequence
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

      // 3. Draw asset with centered cover scaling
      if (frameToDraw) {
        const asset = frameToDraw.asset
        const naturalWidth = 'naturalWidth' in asset ? asset.naturalWidth : asset.width
        const naturalHeight = 'naturalHeight' in asset ? asset.naturalHeight : asset.height

        if (naturalWidth > 0 && naturalHeight > 0) {
          const scale = Math.max(width / naturalWidth, height / naturalHeight)
          const dw = naturalWidth * scale
          const dh = naturalHeight * scale
          const dx = (width - dw) / 2
          const dy = (height - dh) / 2

          context.drawImage(asset, dx, dy, dw, dh)
          stateRef.current.lastDrawn = frameToDraw
        }
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
            queueAllFrames(nextIdx, stateRef.current.base, stateRef.current.direction)
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
  }, [base, reduced, scrollYProgress, queueAllFrames])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ willChange: 'transform, opacity' }}
      aria-label="Cinematic sequence"
    />
  )
}
