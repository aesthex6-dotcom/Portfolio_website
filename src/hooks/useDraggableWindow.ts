import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Window position — stored as offset from the right and bottom edges so the
 * window stays anchored to the bottom-right even when the viewport resizes.
 */
interface WinPos {
  right: number
  bottom: number
}

interface Opts {
  id: string
  /** Default position (from right/bottom edges) when no stored position exists. */
  defaultPos: WinPos
  /** Skip drag+clamp on mobile — the panel renders as a bottom sheet instead. */
  isMobile?: boolean
  /**
   * Auto-nudge: if another floating window is already open at nearly the same
   * position, shift this window upward so both are visible. Default: true.
   */
  autoStack?: boolean
}

const STORAGE_PREFIX = 'kumar:window:'
/** Minimum movement (px) before a pointer-down is treated as a drag. */
const DRAG_THRESHOLD = 5
/** Nudge distance (px) when two windows would overlap at the same position. */
const STACK_NUDGE = 170

let globalZ = 75 // shared across all floating windows

/**
 * Draggable-window hook — handles pointer drag, position persistence to
 * localStorage, and viewport-edge clamping. On mobile (`isMobile`), the hook
 * is a no-op and the panel should render as a bottom sheet.
 *
 * Returns values to spread onto the window element:
 *   style  — position: fixed, right, bottom, zIndex
 *   ref    — attach to the window element
 *   bind   — onMouseDown / onTouchStart for the drag handle
 */
export function useDraggableWindow({ id, defaultPos, isMobile, autoStack = true }: Opts) {
  const [pos, setPos] = useState<WinPos>(defaultPos)
  const [zIndex, setZIndex] = useState(() => ++globalZ)
  const [dragging, setDragging] = useState(false)

  const posRef = useRef(pos)
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startPos: defaultPos,
    moved: false,
  })
  const elRef = useRef<HTMLDivElement>(null)

  // ---- localStorage ----
  useEffect(() => {
    if (isMobile) return
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + id)
      if (raw) {
        const stored: WinPos = JSON.parse(raw)
        setPos(stored)
        posRef.current = stored
      }
    } catch { /* storage unavailable */ }
  }, [id, isMobile])

  // ---- auto-stack: nudge upward if another window is at the same position ----
  useEffect(() => {
    if (isMobile || !autoStack) return
    try {
      const stored: WinPos | null = (() => {
        const raw = localStorage.getItem(STORAGE_PREFIX + id)
        return raw ? JSON.parse(raw) : null
      })()
      // Only nudge when using the default position (no stored or stored matches default)
      if (!stored || (stored.right === defaultPos.right && stored.bottom === defaultPos.bottom)) {
        const keys = Object.keys(localStorage).filter(
          (k) => k.startsWith(STORAGE_PREFIX) && k !== STORAGE_PREFIX + id,
        )
        const hasConflict = keys.some((k) => {
          try {
            const other: WinPos = JSON.parse(localStorage.getItem(k) || '')
            return Math.abs(other.right - defaultPos.right) < 20
              && Math.abs(other.bottom - defaultPos.bottom) < 20
          } catch { return false }
        })
        if (hasConflict) {
          const nudged = { right: defaultPos.right, bottom: defaultPos.bottom + STACK_NUDGE }
          setPos(nudged)
          posRef.current = nudged
          localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(nudged))
        }
      }
    } catch { /* storage unavailable */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, autoStack])

  const persist = useCallback((p: WinPos) => {
    try { localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(p)) }
    catch { /* storage unavailable */ }
  }, [id])

  // ---- clamp ----
  const clamp = useCallback((p: WinPos): WinPos => {
    const el = elRef.current
    const w = el?.offsetWidth ?? 320
    const h = el?.offsetHeight ?? 480
    return {
      right: Math.max(0, Math.min(window.innerWidth - w - 16, p.right)),
      bottom: Math.max(0, Math.min(window.innerHeight - h - 16, p.bottom)),
    }
  }, [])

  // ---- pointer handlers (mouse + touch unified via PointerEvent) ----
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (isMobile) return
    // Only primary button for mouse; all for touch.
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.preventDefault()

    dragRef.current = { startX: e.clientX, startY: e.clientY, startPos: posRef.current, moved: false }

    const onMove = (ev: PointerEvent) => {
      const dx = dragRef.current.startX - ev.clientX // positive = dragged left
      const dy = dragRef.current.startY - ev.clientY // positive = dragged down
      if (!dragRef.current.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return
        dragRef.current.moved = true
        setDragging(true)
        document.body.classList.add('select-none')
        elRef.current?.setPointerCapture(ev.pointerId)
      }
      const next = clamp({
        right: Math.max(0, dragRef.current.startPos.right + dx),
        bottom: Math.max(0, dragRef.current.startPos.bottom + dy),
      })
      posRef.current = next
      setPos(next)
    }

    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.classList.remove('select-none')
      elRef.current?.releasePointerCapture(ev.pointerId)
      setDragging(false)
      persist(posRef.current)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }, [isMobile, clamp, persist])

  // ---- raise to top ----
  const raise = useCallback(() => {
    setZIndex(++globalZ)
  }, [])

  // ---- reset to default ----
  const reset = useCallback(() => {
    setPos(defaultPos)
    posRef.current = defaultPos
    persist(defaultPos)
  }, [defaultPos, persist])

  // Mobile: no floating — caller renders a bottom sheet instead.
  if (isMobile) {
    return {
      style: {} as React.CSSProperties,
      ref: elRef,
      bind: {} as React.HTMLAttributes<HTMLDivElement>,
      dragging: false,
      raise,
      reset,
    }
  }

  return {
    style: {
      position: 'fixed' as const,
      right: pos.right,
      bottom: pos.bottom,
      zIndex,
    } satisfies React.CSSProperties,
    ref: elRef,
    bind: {
      onPointerDown,
      style: { touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' } as React.CSSProperties,
    },
    dragging,
    raise,
    reset,
  }
}
