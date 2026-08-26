import { useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import type { RefObject } from 'react'

interface ParallaxOptions {
  /** Distance the target drifts (px) as it crosses the viewport. */
  from?: number
  to?: number
}

/**
 * Scroll-linked parallax — the element drifts at a different rate than the
 * page (camera depth), from `from`px at the bottom of the viewport to `to`px
 * at the top. Respects prefers-reduced-motion (returns a static 0).
 */
export function useParallax(
  ref: RefObject<HTMLElement | null>,
  { from = 0, to = 0 }: ParallaxOptions = {},
): MotionValue<number> {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [from, to])
  return y
}
