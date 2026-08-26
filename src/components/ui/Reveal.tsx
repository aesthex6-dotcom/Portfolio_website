import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export type RevealDirection = 'up' | 'left' | 'right' | 'none'

interface RevealProps {
  children: ReactNode
  /** Direction the mask travels. 'up' lifts the curtain; 'left'/'right' wipe. */
  direction?: RevealDirection
  className?: string
}

/**
 * Masked reveal (top, right, bottom, left). Ends slightly overshot (-2%) so no
 * resting clip-path ever trims a shadow or a hairline.
 */
const MASK: Record<RevealDirection, [string, string]> = {
  up: ['inset(100% 0 0 0)', 'inset(-2% 0 0 0)'],
  left: ['inset(0 100% 0 0)', 'inset(0 0 -2% 0)'],
  right: ['inset(0 0 0 100%)', 'inset(0 -2% 0 0)'],
  none: ['inset(0 0 0 0)', 'inset(0 0 0 0)'],
}

/**
 * Scroll-scrubbed reveal — the composition does not "animate in"; it is
 * unveiled by the scroll itself.
 *
 * The mask opens continuously as the element travels from below the fold to
 * the moment it is FULLY on screen — its bottom reaching the viewport bottom —
 * with a whisper of opacity and drift. Scrolling back up closes the curtain
 * again — the reveal IS the scroll, so it reverses perfectly. Nothing bounces,
 * nothing pops.
 *
 * The end offset is deliberately `end end`, not `center center`: a bottom-of-
 * page element whose center can never reach the viewport center (content below
 * it runs out first) would otherwise rest forever partially clipped and dimmed
 * — text that is invisible until selected. `end end` guarantees full assembly
 * the instant the element is entirely visible, which every in-flow element's
 * bottom provably reaches, so no text can ever be stuck invisible.
 *
 * Reduced motion: fully assembled, no scroll linkage.
 */
export function Reveal({
  children,
  direction = 'up',
  className,
}: RevealProps) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const [from, to] = MASK[direction]

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })

  const clipPath = useTransform(scrollYProgress, [0, 1], reduced ? [to, to] : [from, to])
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.6],
    reduced ? [1, 1] : [direction === 'none' ? 0.85 : 0.55, 1],
  )
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? [0, 0] : [direction === 'up' ? 16 : 0, 0],
  )

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      // 'auto' promotes a compositor layer during the reveal and demotes it
      // after — a persistent hint would keep the layer alive forever.
      style={{ clipPath, opacity, y, willChange: 'auto' }}
    >
      {children}
    </motion.div>
  )
}
