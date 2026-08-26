import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'
import { MaskLines } from './MaskLines'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** Amplified ease for SPRINT15 MOTION:7 — slightly sharper entry, more character. */
const EASE_SHARP = [0.22, 1, 0.28, 1] as const

interface SectionHeadingProps {
  /** Chapter mark — '01' rendered as a faint Sonder watermark. */
  numeral?: string
  eyebrow: string
  /** Plain title — omit when `titleLines` is set (masked display lines). */
  title?: ReactNode
  /** When set, the title is set as masked display lines (one string per line). */
  titleLines?: string[]
  description?: string
  align?: 'left' | 'center'
  className?: string
  /** VARIANCE:8 — amplify the watermark scale for stronger chapter identity. */
  amplifyMark?: boolean
}

/**
 * Editorial chapter header: a hairline + mono label, a faint Sonder chapter
 * mark, then the display title. Three voices, one hierarchy — and the title
 * is the camera's subject. Sonder carries the numbering, mono carries the
 * furniture, Space Grotesk carries the title. The body runs in a narrow
 * column below: wide headline, constrained copy — the editorial asymmetry.
 *
 * The entrance is layered, not simultaneous: the title is set line by line
 * (MaskLines), then the description settles on the beat after — typography
 * arrives before content, so the reader registers the chapter mark and the
 * headline before the supporting copy starts to speak.
 */
export function SectionHeading({
  numeral,
  eyebrow,
  title,
  titleLines,
  description,
  align = 'left',
  className,
  amplifyMark,
}: SectionHeadingProps) {
  const centered = align === 'center'
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()

  // The chapter numeral is a watermark on the farthest plane: as the section
  // passes, it drifts a little slower than the page — depth, not decoration.
  // Static under reduced motion.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const markY = useTransform(scrollYProgress, [0, 1], [reduced ? 0 : -40, reduced ? 0 : 40])

  // VARIANCE:8 — amplified watermark scale
  const markScale = amplifyMark ? 1.6 : 1
  // MOTION:7 — use sharper ease for description entry
  const descEase = EASE_SHARP

  const header = (
    <>
      {numeral && (
        <motion.span
          aria-hidden
          style={{
            ...(centered ? { y: markY, x: '-50%' } : { y: markY }),
            scale: markScale,
            transformOrigin: centered ? 'center top' : 'right top',
          }}
          className={cn(
            'sonder-mark absolute top-0',
            centered ? 'left-1/2' : 'right-0',
          )}
        >
          {numeral}
        </motion.span>
      )}

      {centered ? (
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-edge" aria-hidden />
          <p className="eyebrow">{eyebrow}</p>
          <span className="h-px w-12 bg-edge" aria-hidden />
        </div>
      ) : (
        <div className="scene-kicker">
          <p className="eyebrow">{eyebrow}</p>
        </div>
      )}

      {titleLines ? (
        <MaskLines
          lines={titleLines}
          as="h2"
          className={cn('scene-title mt-7', centered && 'text-center')}
        />
      ) : (
        <h2 className={cn('scene-title mt-7', centered && 'text-center')}>{title}</h2>
      )}

      {description && (
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.55, ease: descEase }}
          className={cn(
            'mt-6 max-w-md text-[15px] leading-relaxed text-muted md:text-base',
            centered && 'mx-auto',
          )}
        >
          {description}
        </motion.p>
      )}
    </>
  )

  const rootClass = cn('relative mb-16 md:mb-24', className)

  // When the title reveals line-by-line (MaskLines), it owns the entrance —
  // no outer reveal, or the two would fight.
  if (titleLines) {
    return (
      <div ref={ref} className={rootClass}>
        {header}
      </div>
    )
  }

  return (
    <Reveal className="relative mb-16 md:mb-24">
      <div ref={ref} className={cn('relative', className)}>
        {header}
      </div>
    </Reveal>
  )
}
