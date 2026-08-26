import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MaskLinesProps {
  /** Each entry is one masked line that lifts out of its own box. */
  lines: ReactNode[]
  className?: string
  lineClassName?: string
  delay?: number
  /** Stagger between lines, seconds. */
  stagger?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div'
}

/** Amplified ease for SPRINT15 MOTION:7 — slightly sharper entry, more character. */
const EASE_SHARP = [0.22, 1, 0.28, 1] as const

/**
 * Masked display type — each line is cradled in an overflow-hidden box and
 * rises into place from below (110% → 0), one after another. The motion of a
 * typesetter setting a headline, not an opacity fade. Titles that deserve the
 * camera's attention use this; body copy does not.
 */
export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.12,
  as: Tag = 'div',
}: MaskLinesProps) {
  const reduced = useReducedMotion()

  return (
    <Tag className={cn(className)}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={cn('block', lineClassName)}
            initial={{ y: reduced ? 0 : '112%' }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.15, delay: delay + i * stagger, ease: EASE_SHARP }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}
