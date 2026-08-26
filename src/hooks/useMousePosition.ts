import { useEffect, useRef, useState } from 'react'

export interface MousePosition {
  /** Normalized coordinates in the range -1..1 relative to the viewport center. */
  x: number
  y: number
  /** Raw pixel coordinates. */
  px: number
  py: number
}

/** Track the cursor with a rAF throttle. Returns normalized + raw positions. */
export function useMousePosition(): MousePosition {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0, px: 0, py: 0 })
  const raf = useRef<number>(0)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        setPos({
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: (e.clientY / window.innerHeight) * 2 - 1,
          px: e.clientX,
          py: e.clientY,
        })
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf.current)
    }
  }, [])

  return pos
}
