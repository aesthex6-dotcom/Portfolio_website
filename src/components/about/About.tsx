import { useRef, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { profile } from '@/data/profile'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { PhotoFrame } from '@/components/ui/PhotoFrame'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { JourneyTimeline } from './JourneyTimeline'
import { useMediaQuery } from '@/hooks/useMediaQuery'

/**
 * About — an editorial spread drawn like a blueprint plate. A scroll-drawn
 * construction frame (corner brackets + ruled hairlines + coordinate marks)
 * unfolds around the section as it enters; the story reads like a drawing
 * being pinned to the page. Snapshot + meta index on the left; education as
 * a spec block, goals and the journey as ruled index rows on the right.
 * Type carries the layout; hairlines divide it.
 */

/** A spec-sheet row — mono label, dotted leader, value. */
interface SpecRowProps {
  label: string
  value: string
  style?: React.CSSProperties
}

function SpecRow({ label, value, style }: SpecRowProps) {
  return (
    <motion.div style={style} className="flex items-baseline gap-3">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        {label}
      </span>
      <span className="mb-1 flex-1 border-b border-dotted border-edge" aria-hidden />
      <span className="text-right text-[13px] leading-snug text-muted">{value}</span>
    </motion.div>
  )
}

export function About() {
  const reduced = usePrefersReducedMotion()
  const { mode } = useUI()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const frameRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Enhanced construction frame choreography — four distinct beats.
  // The frame draws like a drafting machine:
  // top rule → corner brackets → bottom rule → coordinate marks.
  const { scrollYProgress: frameProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'start 0.35'],
  })

  // Beat 1: Top rule draws left-to-right
  const topLine = useTransform(frameProgress, [0, 0.25], [0, reduced ? 1 : 1])
  // Beat 2: Corner brackets pin in (staggered TL→TR→BL→BR)
  const bracketScaleTL = useTransform(frameProgress, [0.1, 0.4], [0, reduced ? 1 : 1])
  const bracketScaleTR = useTransform(frameProgress, [0.15, 0.45], [0, reduced ? 1 : 1])
  const bracketScaleBL = useTransform(frameProgress, [0.2, 0.5], [0, reduced ? 1 : 1])
  const bracketScaleBR = useTransform(frameProgress, [0.25, 0.55], [0, reduced ? 1 : 1])
  // Beat 3: Bottom rule draws left-to-right (slightly delayed)
  const bottomLine = useTransform(frameProgress, [0.35, 0.7], [0, reduced ? 1 : 1])
  // Beat 4: Coordinate marks + section label fade in
  const frameOpacity = useTransform(frameProgress, [0.4, 0.8], [0, reduced ? 1 : 1])

  // Parallax background plate — drifts opposite to content at 0.15x speed.
  // Creates depth: the "drawing" sits on a plate that breathes independently.
  const { scrollYProgress: plateProgress } = useScroll({
    target: contentRef,
    offset: ['start end', 'end start'],
  })
  const plateY = useTransform(plateProgress, [0, 1], reduced ? [0, 0] : [-60, 40])
  const plateScale = useTransform(plateProgress, [0, 1], reduced ? [1, 1] : [0.96, 1.02])
  const plateOpacity = useTransform(plateProgress, [0, 0.3], [0, reduced ? 0.15 : 0.15])

  // Spec sheet progressive fill-in — each row draws in as scroll reaches it
  // Pre-compute the styles for each spec row at the top level
  const specRow0Opacity = useTransform(frameProgress, [0.1, 0.35], reduced ? [1, 1] : [0, 1])
  const specRow0X = useTransform(frameProgress, [0.1, 0.35], reduced ? [0, 0] : [20, 0])
  const specRow0Scale = useTransform(frameProgress, [0.1, 0.35], reduced ? [1, 1] : [0.95, 1])

  const specRow1Opacity = useTransform(frameProgress, [0.25, 0.5], reduced ? [1, 1] : [0, 1])
  const specRow1X = useTransform(frameProgress, [0.25, 0.5], reduced ? [0, 0] : [20, 0])
  const specRow1Scale = useTransform(frameProgress, [0.25, 0.5], reduced ? [1, 1] : [0.95, 1])

  const specRow2Opacity = useTransform(frameProgress, [0.4, 0.65], reduced ? [1, 1] : [0, 1])
  const specRow2X = useTransform(frameProgress, [0.4, 0.65], reduced ? [0, 0] : [20, 0])
  const specRow2Scale = useTransform(frameProgress, [0.4, 0.65], reduced ? [1, 1] : [0.95, 1])

  const specRowStyles = useMemo(() => [
    { opacity: specRow0Opacity, x: specRow0X, scale: specRow0Scale },
    { opacity: specRow1Opacity, x: specRow1X, scale: specRow1Scale },
    { opacity: specRow2Opacity, x: specRow2X, scale: specRow2Scale },
  ], [specRow0Opacity, specRow0X, specRow0Scale, specRow1Opacity, specRow1X, specRow1Scale, specRow2Opacity, specRow2X, specRow2Scale])

  // Education detail paragraph progressive reveal
  const detailOpacity = useTransform(frameProgress, [0.55, 0.85], reduced ? [1, 1] : [0, 1])
  const detailY = useTransform(frameProgress, [0.55, 0.85], reduced ? [0, 0] : [16, 0])

  // PhotoFrame progressive reveal (delayed, like a physical photo being placed)
  const photoOpacity = useTransform(frameProgress, [0.6, 0.9], reduced ? [1, 1] : [0, 1])
  const photoScale = useTransform(frameProgress, [0.6, 0.9], reduced ? [1, 1] : [0.9, 1])
  const photoRotate = useTransform(frameProgress, [0.6, 0.9], reduced ? [0, 0] : [-2, 0])

  // Goals progressive reveal (each row staggered)
  const goalsProgress = useScroll({
    target: frameRef,
    offset: ['start 0.5', 'end 0.8'],
  }).scrollYProgress

  // Pre-compute goal row styles at top level (max 5 goals)
  const goalRow0Opacity = useTransform(goalsProgress, [0.05, 0.25], reduced ? [1, 1] : [0, 1])
  const goalRow0X = useTransform(goalsProgress, [0.05, 0.25], reduced ? [0, 0] : [24, 0])
  const goalRow0Scale = useTransform(goalsProgress, [0.05, 0.25], reduced ? [1, 1] : [0.92, 1])

  const goalRow1Opacity = useTransform(goalsProgress, [0.15, 0.35], reduced ? [1, 1] : [0, 1])
  const goalRow1X = useTransform(goalsProgress, [0.15, 0.35], reduced ? [0, 0] : [24, 0])
  const goalRow1Scale = useTransform(goalsProgress, [0.15, 0.35], reduced ? [1, 1] : [0.92, 1])

  const goalRow2Opacity = useTransform(goalsProgress, [0.25, 0.45], reduced ? [1, 1] : [0, 1])
  const goalRow2X = useTransform(goalsProgress, [0.25, 0.45], reduced ? [0, 0] : [24, 0])
  const goalRow2Scale = useTransform(goalsProgress, [0.25, 0.45], reduced ? [1, 1] : [0.92, 1])

  const goalRow3Opacity = useTransform(goalsProgress, [0.35, 0.55], reduced ? [1, 1] : [0, 1])
  const goalRow3X = useTransform(goalsProgress, [0.35, 0.55], reduced ? [0, 0] : [24, 0])
  const goalRow3Scale = useTransform(goalsProgress, [0.35, 0.55], reduced ? [1, 1] : [0.92, 1])

  const goalRow4Opacity = useTransform(goalsProgress, [0.45, 0.65], reduced ? [1, 1] : [0, 1])
  const goalRow4X = useTransform(goalsProgress, [0.45, 0.65], reduced ? [0, 0] : [24, 0])
  const goalRow4Scale = useTransform(goalsProgress, [0.45, 0.65], reduced ? [1, 1] : [0.92, 1])

  const goalRowStyles = useMemo(() => [
    { opacity: goalRow0Opacity, x: goalRow0X, scale: goalRow0Scale },
    { opacity: goalRow1Opacity, x: goalRow1X, scale: goalRow1Scale },
    { opacity: goalRow2Opacity, x: goalRow2X, scale: goalRow2Scale },
    { opacity: goalRow3Opacity, x: goalRow3X, scale: goalRow3Scale },
    { opacity: goalRow4Opacity, x: goalRow4X, scale: goalRow4Scale },
  ], [
    goalRow0Opacity, goalRow0X, goalRow0Scale,
    goalRow1Opacity, goalRow1X, goalRow1Scale,
    goalRow2Opacity, goalRow2X, goalRow2Scale,
    goalRow3Opacity, goalRow3X, goalRow3Scale,
    goalRow4Opacity, goalRow4X, goalRow4Scale,
  ])

  return (
    <section id="about" ref={frameRef} className="scene">
      <div className="container-site relative">
        {/* Parallax background plate — the drawing substrate that breathes. */}
        {!isMobile && !reduced && (
          <motion.div
            ref={contentRef}
            style={{ y: plateY, scale: plateScale, opacity: plateOpacity }}
            className="pointer-events-none absolute inset-0 -z-10"
            aria-hidden
          >
            {/* Subtle grid substrate — the engineering paper */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
              <defs>
                <pattern id="aboutGrid" width="32" height="32" patternUnits="userSpaceOnUse">
                  <line x1="0" y1="0" x2="32" y2="0" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="0" y1="0" x2="0" y2="32" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#aboutGrid)" />
            </svg>

            {/* Concentric circles — the drafting compass marks */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
              <circle cx="50%" cy="50%" r="35%" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50%" cy="50%" r="25%" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="50%" cy="50%" r="15%" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <line x1="50%" y1="5%" x2="50%" y2="95%" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 8" />
              <line x1="5%" y1="50%" x2="95%" y2="50%" stroke="currentColor" strokeWidth="0.3" strokeDasharray="4 8" />
            </svg>
          </motion.div>
        )}

        {/* Construction frame — the section is a drawing plate. */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {/* Top rule — draws first, left to right */}
          <motion.div
            style={{ scaleX: topLine, opacity: frameOpacity, transformOrigin: 'left center' }}
            className="absolute left-4 right-4 top-0 h-px origin-left bg-edge/50"
          />

          {/* Corner brackets — pin in sequence */}
          <motion.div
            style={{ scale: bracketScaleTL, opacity: frameOpacity, transformOrigin: 'top left' }}
            className="absolute left-0 top-0 h-4 w-4 border-l border-t border-edge-strong/70"
          />
          <motion.div
            style={{ scale: bracketScaleTR, opacity: frameOpacity, transformOrigin: 'top right' }}
            className="absolute right-0 top-0 h-4 w-4 border-r border-t border-edge-strong/70"
          />
          <motion.div
            style={{ scale: bracketScaleBL, opacity: frameOpacity, transformOrigin: 'bottom left' }}
            className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-edge-strong/70"
          />
          <motion.div
            style={{ scale: bracketScaleBR, opacity: frameOpacity, transformOrigin: 'bottom right' }}
            className="absolute bottom-0 right-0 h-4 w-4 border-b border-r border-edge-strong/70"
          />

          {/* Bottom rule — draws last, left to right */}
          <motion.div
            style={{ scaleX: bottomLine, opacity: frameOpacity, transformOrigin: 'left center' }}
            className="absolute bottom-0 left-4 right-4 h-px origin-left bg-edge/50"
          />

          {/* Section coordinate marks — fade in with frame */}
          <motion.p
            style={{ opacity: frameOpacity }}
            className="absolute -top-6 left-4 font-mono text-[9px] uppercase tracking-[0.24em] text-faint"
          >
            SEC.01 · PROFILE
          </motion.p>
          <motion.p
            style={{ opacity: frameOpacity }}
            className="absolute -bottom-6 right-4 font-mono text-[9px] uppercase tracking-[0.2em] text-faint"
          >
            23.2158N · 77.4083E
          </motion.p>
        </div>

        <SectionHeading
          numeral="01"
          eyebrow={t(mode, 'about.title')}
          titleLines={[t(mode, 'about.titleLines1'), t(mode, 'about.titleLines2')]}
          description={t(mode, 'about.description')}
        />

        <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          {/* Left — statement + meta index */}
          <div className="flex flex-col justify-between gap-12">
            <Reveal>
              <p className="eyebrow mb-6">{t(mode, 'about.snapshot')}</p>
              <div className="space-y-6">
                {profile.intro.slice(1).map((p, i) => (
                  <p key={i} className="text-[15px] leading-relaxed text-muted md:text-base">
                    {p}
                  </p>
                ))}
              </div>
            </Reveal>

            <Reveal direction="right">
              <ul className="space-y-0">
                <li className="flex items-baseline justify-between border-t border-edge py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                  <span>Location</span>
                  <span className="text-[12px] normal-case tracking-normal text-muted">
                    {profile.location}
                  </span>
                </li>
                <li className="flex items-baseline justify-between border-t border-edge py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
                  <span>Status</span>
                  <span className="text-[12px] normal-case tracking-normal text-accent">
                    {profile.availability}
                  </span>
                </li>
                <li className="border-t border-edge" aria-hidden />
              </ul>
            </Reveal>
          </div>

          {/* Right — ruled index: education, goals, journey */}
          <div className="space-y-14">
            {/* Education — a drawing pinned to the page. The header lands
                first, then the spec sheet fills in field by field as the
                scroll reaches each row: progressive construction. */}
            <div className="border-t border-edge pt-6">
              <Reveal>
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-edge text-muted">
                    <Icon name="graduation-cap" size={15} />
                  </span>
                  <p className="eyebrow">{t(mode, 'about.education')}</p>
                  <span className="ml-auto font-mono text-[11px] text-faint">01</span>
                </div>
              </Reveal>

              <div className="mt-8 grid items-start gap-10 md:grid-cols-[1fr_auto] md:gap-14">
                {/* Spec sheet — labelled fields, dotted leaders. */}
                <div>
                  <Reveal direction="left">
                    <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl">
                      {profile.education.degree}
                    </h3>
                  </Reveal>

                  <div className="mt-6 max-w-md space-y-3">
                    <motion.div style={specRowStyles[0]}>
                      <SpecRow label={t(mode, 'about.institution')} value={profile.education.school} />
                    </motion.div>
                    <motion.div style={specRowStyles[1]}>
                      <SpecRow label={t(mode, 'about.period')} value={profile.education.period} />
                    </motion.div>
                    <motion.div style={specRowStyles[2]}>
                      <SpecRow
                        label="Location"
                        value={profile.location.split(' · ')[0]}
                      />
                    </motion.div>
                  </div>

                  <motion.p
                    style={{ opacity: detailOpacity, y: detailY }}
                    className="mt-5 max-w-md text-sm leading-relaxed text-muted"
                  >
                    {profile.education.detail}
                  </motion.p>
                </div>

                {/* Campus mount — a real photograph drops in here later. */}
                <motion.div
                  style={{ opacity: photoOpacity, scale: photoScale, rotate: photoRotate }}
                >
                  <PhotoFrame
                    photo={profile.education.photo}
                    imgAlt="Maulana Azad National Institute of Technology, Bhopal"
                    objectPosition="50% 50%"
                    figure="FIG. 02"
                    label="CAMPUS"
                    caption="Campus photo reserved"
                    delay={0.1}
                    className="h-40 w-40 md:h-56 md:w-56 lg:h-60 lg:w-60"
                  />
                </motion.div>
              </div>
            </div>

            {/* Goals — each row is drawn in as the scroll reaches it, like
                the frame pinning each ambition to the plate. Progressive
                construction: header lands first, then each row draws in
                sequentially. */}
            <div ref={contentRef}>
              <Reveal>
                <div className="flex items-baseline justify-between border-t border-edge py-3">
                  <p className="eyebrow">{t(mode, 'about.whereImHeaded')}</p>
                  <span className="font-mono text-[11px] text-faint">
                    {String(profile.goals.length).padStart(2, '0')}
                  </span>
                </div>
              </Reveal>
              <ol className="rule-list">
                {profile.goals.map((g, i) => (
                  <li key={i}>
                    <motion.div
                      style={goalRowStyles[i] ?? { opacity: 1, x: 0, scale: 1 }}
                      className="rule-row grid-cols-[auto_1fr]"
                    >
                      <span className="font-mono text-[11px] text-faint">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <p className="text-[15px] leading-relaxed text-muted md:text-base">{g}</p>
                    </motion.div>
                  </li>
                ))}
              </ol>
            </div>

            <Reveal direction="left">
              <p className="eyebrow mb-6">{t(mode, 'about.theJourney')}</p>
              <JourneyTimeline />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}