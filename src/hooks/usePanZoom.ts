import { useCallback, useEffect, useRef, useState } from 'react'
import { clamp } from '@/lib/utils'

export interface PanZoomView {
  x: number
  y: number
  k: number
}

interface UsePanZoomOptions {
  /** SVG user-unit viewport width (== viewBox width). */
  width: number
  /** SVG user-unit viewport height (== viewBox height). */
  height: number
  minK?: number
  maxK?: number
}

/**
 * Pan + zoom for an SVG graph. The transform `translate(x y) scale(k)` is
 * applied to a content group; width/height are the SVG viewport in user
 * units (the SVG renders `h-auto w-full`, so the aspect is locked and "fit"
 * == reset {0,0,1} — no ResizeObserver needed).
 *
 * Wheel zoom must attach as a NON-PASSIVE imperative listener: React's
 * synthetic onWheel is passive, so preventDefault() there is a no-op and the
 * modal body would scroll while zooming.
 */
export function usePanZoom({ width, height, minK = 0.4, maxK = 2.5 }: UsePanZoomOptions) {
  const [view, setView] = useState<PanZoomView>({ x: 0, y: 0, k: 1 })
  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ sx: number; sy: number; vx: number; vy: number } | null>(null)
  const movedRef = useRef(false)

  // min/max are intentionally inverted: when content is smaller than the
  // viewport the range is [width-cw, 0], which centers it and prevents
  // panning into empty space.
  const clampView = useCallback(
    (x: number, y: number, k: number): PanZoomView => {
      const cw = width * k
      const ch = height * k
      return {
        x: clamp(x, Math.min(0, width - cw), Math.max(0, width - cw)),
        y: clamp(y, Math.min(0, height - ch), Math.max(0, height - ch)),
        k,
      }
    },
    [width, height],
  )

  /** Zoom around a user-space point, keeping it fixed under the cursor. */
  const zoomAt = useCallback(
    (cx: number, cy: number, factor: number) => {
      setView((v) => {
        const k = clamp(v.k * factor, minK, maxK)
        return clampView(cx - (cx - v.x) * (k / v.k), cy - (cy - v.y) * (k / v.k), k)
      })
    },
    [clampView, minK, maxK],
  )

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      const cx = ((e.clientX - r.left) / r.width) * width
      const cy = ((e.clientY - r.top) / r.height) * height
      zoomAt(cx, cy, e.deltaY < 0 ? 1.15 : 1 / 1.15)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [width, height, zoomAt])

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragRef.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y }
    movedRef.current = false
    // Deliberately no setPointerCapture here: capturing on every pointerdown
    // would retarget the following `click` to the SVG, so node onClick could
    // never fire. Capture only once the drag threshold is crossed.
  }

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = dragRef.current
    if (!d) return
    if (!movedRef.current) {
      if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) <= 4) return
      movedRef.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    const r = e.currentTarget.getBoundingClientRect()
    const userPerScreen = width / r.width / view.k
    setView(
      clampView(
        d.vx + (e.clientX - d.sx) * userPerScreen,
        d.vy + (e.clientY - d.sy) * userPerScreen,
        view.k,
      ),
    )
  }

  const endDrag = () => {
    dragRef.current = null
  }

  /** True when the last press turned into a drag — node clicks should ignore it. */
  const didDrag = () => movedRef.current

  const zoomIn = () => zoomAt(width / 2, height / 2, 1.25)
  const zoomOut = () => zoomAt(width / 2, height / 2, 1 / 1.25)
  const reset = () => setView({ x: 0, y: 0, k: 1 })

  return {
    view,
    svgRef,
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
    zoomIn,
    zoomOut,
    reset,
    didDrag,
  }
}
