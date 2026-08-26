import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** Animate a number from 0 → target when `start` becomes true (or on mount). */
export function useCountUp(
  target: number,
  { duration = 1400, start = true }: { duration?: number; start?: boolean } = {},
): number {
  const [value, setValue] = useState(0)
  const reduced = usePrefersReducedMotion()
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!start) return
    if (reduced) {
      setValue(target)
      return
    }
    const t0 = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3) // ease-out cubic
      setValue(Math.round(target * eased))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration, start, reduced])

  return value
}
