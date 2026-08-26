import { useRef, useMemo } from 'react'
import { motion, useScroll, useTransform, useVelocity, type MotionStyle } from 'framer-motion'
import type { Project } from '@/types'
import { Icon } from '@/components/ui/Icon'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { ProjectVisual } from './ProjectVisual'

/** A spec row — mono label, dotted leader, value. */
function MetaRow({
  label,
  value,
  style,
  transition,
}: {
  label: string
  value: string
  style?: MotionStyle
  transition?: Parameters<typeof motion.div>[0]['transition']
}) {
  return (
    <motion.div style={style} transition={transition} className="flex items-baseline gap-3">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        {label}
      </span>
      <span className="mb-1 flex-1 border-b border-dotted border-edge" aria-hidden />
      <span className="text-right text-[13px] leading-snug text-muted">{value}</span>
    </motion.div>
  )
}

interface ProjectSceneProps {
  project: Project
  index: number
  onOpen: (project: Project) => void
}

/**
 * ProjectScene — a project *presented*, not listed.
 *
 * Scroll-driven, three depths that assemble as the scene enters the viewport:
 *  - the visual wipes in from one side, masked (clipped)
 *  - the text slides in from the other
 *  - a background plate drifts on its own, opposite depth
 * Metadata appears progressively (status, then stack). Once assembled, the
 * whole composition exits together as one object on the way out.
 *
 * Enhanced with:
 * - Velocity-responsive springs: faster scroll = snappier assembly
 * - Per-scene stagger modulation based on scroll velocity
 * - Progressive construction choreography (visual → title → body → meta → CTA)
 * - Unified exit as single object
 * - Reduced motion: fully assembled, no scroll linkage.
 */
export function ProjectScene({ project, index, onOpen }: ProjectSceneProps) {
  const reduced = usePrefersReducedMotion()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const ref = useRef<HTMLLIElement>(null)
  const flip = index % 2 === 1

  // On mobile the alternating flip collapses to a single column, so the
  // three-depth slide + drifting plate would stack competing motions. We drop
  // the background plate and the horizontal text slide there, keeping the
  // masked visual wipe + the progressive opacity/scale beats — the scene still
  // assembles as one object, just with two fewer transform channels.
  const still = reduced || isMobile

  // Assembly happens as the scene travels from below the fold to fully on
  // screen (`end end` — the scene's bottom reaching the viewport bottom).
  // Ending at `end end` rather than `center center` guarantees every scene,
  // even a bottom-anchored one, reaches full assembly; the exit happens as it
  // leaves center for the top edge.
  const { scrollYProgress: enter } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })
  const { scrollYProgress: exit } = useScroll({
    target: ref,
    offset: ['center center', 'end start'],
  })

  // Velocity for spring modulation - faster scroll = snappier assembly
  const velocity = useVelocity(enter)
  const stiffness = useTransform(velocity, [-6, 6], [320, 200])
  const damping = useTransform(velocity, [-6, 6], [24, 34])

  // Pre-compute velocity-responsive spring transitions
  // These MotionValues will be passed directly to motion components
  const enterTransition = useMemo(
    () => ({ type: 'spring' as const, stiffness, damping }),
    [stiffness, damping]
  )
  const exitTransition = useMemo(
    () => ({ type: 'spring' as const, stiffness, damping }),
    [stiffness, damping]
  )

  // Three depths at three speeds — travelled hard, so the scenes read as the
  // site's most physical motion. Collapsed to a single vertical translate on
  // mobile (the flip no longer applies, and the plate is dropped).
  const visualX = useTransform(enter, [0, 1], still ? [0, 0] : [flip ? 96 : -96, 0])
  const textX = useTransform(enter, [0, 1], still ? [0, 0] : [flip ? -64 : 64, 0])
  const bgY = useTransform(enter, [0, 1], still ? [0, 0] : [48, -16])
  // The room the scene sits in opens up as the composition assembles — the
  // plate breathes outward from under the content, a camera pulling focus.
  const plateScale = useTransform(enter, [0, 1], still ? [1, 1] : [0.9, 1])

  // The scene assembles in four beats, not a cascade: the visual arrives,
  // the title settles (fading, lifting, and snapping into focus), the copy
  // follows, then the metadata + CTA land together. Each beat is a window of
  // the element's own travel, so the reveal IS the scroll — nothing is timed,
  // everything is positioned.
  const visualOpacity = useTransform(enter, [0, 0.3], still ? [1, 1] : [0, 1])
  const titleOpacity = useTransform(enter, [0.08, 0.38], still ? [1, 1] : [0, 1])
  const titleY = useTransform(enter, [0.08, 0.42], still ? [0, 0] : [20, 0])
  const titleScale = useTransform(enter, [0.08, 0.38], still ? [1, 1] : [1.05, 1])
  const bodyOpacity = useTransform(enter, [0.18, 0.48], still ? [1, 1] : [0, 1])
  const metaOpacity = useTransform(enter, [0.3, 0.6], still ? [1, 1] : [0, 1])
  const ctaOpacity = useTransform(enter, [0.42, 0.72], still ? [1, 1] : [0, 1])

  // Everything exits together — one object, one motion. The fade is delayed
  // until the scene is most of the way out ([0.4, 1], not [0.12, 0.55]) so the
  // text stays fully readable while any part of the scene is on screen — no
  // fading to invisible beneath a still-visible composition — and reaches 0
  // only as the scene actually leaves the viewport. On mobile the horizontal
  // exit slide is dropped so the scene leaves purely by fade.
  const exitX = useTransform(exit, [0, 1], still ? [0, 0] : [0, flip ? -64 : 64])
  const exitOpacity = useTransform(exit, [0.4, 1], still ? [1, 1] : [1, 0])

  
  // overflow-x-clip contains the horizontal entrance/exit plates within the
  // scene — the wipe is masked at the scene's edge, never inflating the page
  // width on narrow viewports. clip (not hidden) avoids making this a scroll
  // container, so sticky/lodestar behavior is untouched.
  // DENSITY:6 — tighter vertical rhythm between scenes
  return (
    <li ref={ref} className="relative overflow-x-clip py-10 md:py-16">
      {/* Background plate — the room the scene sits in. Drifts on its own
          depth, slower than the content, opposite to it. Only on desktop where
          the flip layout has room to breathe; on mobile it would stack
          competing motions. */}
      {!isMobile && (
        <motion.div
          style={{ y: bgY, scale: plateScale }}
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-edge/40" />
          <div className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-edge/25" />
          <div className="absolute left-0 right-0 top-1/2 h-px bg-edge/30" />
          <span className="absolute right-0 top-1/2 font-mono text-[10px] tracking-[0.18em] text-faint">
            R{String(index + 1).padStart(2, '0')}
          </span>
        </motion.div>
      )}

      <motion.div
        style={{ x: exitX, opacity: exitOpacity }}
        transition={exitTransition}
        className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:items-center"
      >
        {/* Visual — enters masked from one side. */}
        <motion.div
          style={{ x: visualX, opacity: visualOpacity }}
          transition={enterTransition}
          className={cn(flip && 'lg:order-2')}
        >
          <ProjectVisual
            project={project}
            badge={false}
            className="rounded-none border border-edge"
          />
        </motion.div>

        {/* Text — enters from the other side, metadata progressively. */}
        <motion.div style={{ x: textX }} className={cn(flip && 'lg:order-1', 'lg:w-full')}>
          <motion.p
            style={{ opacity: titleOpacity, y: titleY }}
            transition={enterTransition}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-faint"
          >
            Project {String(index + 1).padStart(2, '0')} · {project.year}
          </motion.p>

          <motion.h3
            style={{ opacity: titleOpacity, y: titleY, scale: titleScale, transformOrigin: 'left center' }}
            transition={enterTransition}
            className="mt-3 flex flex-wrap items-baseline gap-x-3 font-display text-3xl font-semibold tracking-[-0.02em] text-ink md:text-4xl"
          >
            {project.title}
            {project.featured && (
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                Featured
              </span>
            )}
          </motion.h3>

          <motion.p
            style={{ opacity: bodyOpacity }}
            transition={enterTransition}
            className="mt-4 max-w-md text-[15px] leading-relaxed text-muted"
          >
            {project.tagline}
          </motion.p>

          <dl className="mt-8 max-w-md space-y-3">
            <MetaRow style={{ opacity: metaOpacity }} transition={enterTransition} label="Status" value={project.status} />
            <MetaRow
              style={{ opacity: metaOpacity }}
              transition={enterTransition}
              label="Stack"
              value={project.tech.slice(0, 4).join(' · ')}
            />
            {project.metrics[0] && (
              <MetaRow
                style={{ opacity: metaOpacity }}
                transition={enterTransition}
                label="Outcome"
                value={`${project.metrics[0].value} ${project.metrics[0].label.toLowerCase()}`}
              />
            )}
          </dl>

          <motion.button
            type="button"
            style={{ opacity: ctaOpacity }}
            transition={enterTransition}
            onClick={() => onOpen(project)}
            className="group mt-9 inline-flex items-center gap-3 text-[15px] font-medium text-ink"
          >
            Open case study
            <span className="relative">
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100" aria-hidden />
            </span>
            <Icon
              name="arrow-up-right"
              size={16}
              className="transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </motion.button>
        </motion.div>
      </motion.div>
    </li>
  )
}