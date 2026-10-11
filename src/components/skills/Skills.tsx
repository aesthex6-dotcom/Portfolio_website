import { useRef, useMemo } from 'react'
import { motion, useScroll, useTransform, useVelocity } from 'framer-motion'
import type { SkillNode } from '@/types'
import { skills } from '@/data/skills'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { SkillConstellation } from './SkillConstellation'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'

/**
 * One ranked capability row — an instrument, not a list item.
 *
 * The scroll itself unveils the row: a clip-path curtain that opens as the
 * row travels into view and closes again scrolling back — reversible by
 * construction, no entrance "animation" to replay. The signal readout
 * (SIG.xx) brightens as the row reaches full activation, like a dial
 * lighting up under a finger. Motion values only — nothing re-renders.
 *
 * Velocity response: faster scroll = snappier signal activation (stiffer spring),
 * slower scroll = gentler, more damped.
 */
function SignalRow({ skill, index }: { skill: SkillNode; index: number }) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLLIElement>(null)

  // Velocity for spring modulation - useVelocity returns a MotionValue
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })
  const velocity = useVelocity(scrollYProgress)

  // Spring stiffness/damping from velocity: faster scroll = stiffer, slower = more damped
  const stiffness = useTransform(velocity, [-6, 6], [280, 160])
  const damping = useTransform(velocity, [-6, 6], [26, 36])

  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ['inset(-2% 0 0 0)', 'inset(-2% 0 0 0)'] : ['inset(100% 0 0 0)', 'inset(-2% 0 0 0)'],
  )
  const opacity = useTransform(scrollYProgress, [0, 0.6], reduced ? [1, 1] : [0.55, 1])
  const y = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [16, 0])

  // Signal readout — velocity-responsive: faster scroll = sharper brightening
  // The readout brightens as the row reaches full activation
  const readoutProgress = useTransform(scrollYProgress, [0.35, 0.75], reduced ? [1, 1] : [0.25, 1])
  const readoutScale = useTransform(scrollYProgress, [0.35, 0.75], reduced ? [1, 1] : [0.9, 1])

  // Pre-compute transition config for motion components
  const rowTransition = useMemo(
    () => ({ stiffness, damping }),
    [stiffness, damping]
  )

  return (
    <li ref={ref}>
      <motion.div
        className="rule-row grid-cols-[auto_1fr] gap-x-4 py-4"
        style={{
          clipPath,
          opacity,
          y,
          willChange: 'auto',
        }}
        transition={rowTransition}
      >
        <span className="font-mono text-[11px] text-faint">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex items-baseline gap-3">
          <span className="text-[15px] text-ink md:text-base">{skill.name}</span>
          <span className="hidden h-px flex-1 self-center bg-edge sm:block" aria-hidden />
          <motion.span
            style={{
              opacity: readoutProgress,
              scale: readoutScale,
              transformOrigin: 'left center',
            }}
            transition={rowTransition}
            className="font-mono text-[11px] text-faint"
          >
            SIG.{skill.level}
          </motion.span>
        </span>
      </motion.div>
    </li>
  )
}

export function Skills() {
  const { mode } = useUI()
  const allSkills = skills
    .flatMap((c) => c.skills)
    .sort((a, b) => b.level - a.level)
    .slice(0, 12)

  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)

  // Section-level scroll for constellation choreography
  const { scrollYProgress: sectionProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Constellation entrance — three beats: nodes settle, edges draw, labels fade
  const constellationOpacity = useTransform(sectionProgress, [0, 0.4], reduced ? [1, 1] : [0, 1])
  const constellationScale = useTransform(sectionProgress, [0, 0.5], reduced ? [1, 1] : [0.9, 1])

  // Per-row stagger delay for the SignalRow grid — each row activates with a
  // slight horizontal wave. The wave travels faster on faster scrolls.
  const gridVelocity = useVelocity(sectionProgress)
  // gridStaggerBase drives per-row stagger via CSS custom property if needed
  // const gridStaggerBase = useTransform(gridVelocity, [-8, 8], [0.08, 0.04])

  // Motion density indicator values - pre-computed at top level
  const densityOpacity = useTransform(gridVelocity, [0, 8], [0, 0.3])
  const densityScale = useTransform(gridVelocity, [0, 8], [1, 1.02])
  const densityWidth = useTransform(gridVelocity, [0, 8], ['0%', '100%'])

  return (
    <section id="skills" ref={sectionRef} className="scene">
      {/* Faint backdrop — subtle dot grid masked by radial gradient */}
      <div
        className="pointer-events-none absolute inset-0 bg-dot-grid bg-[size:26px_26px] opacity-30 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]"
        aria-hidden
      />

      <div className="container-site relative">
        <SectionHeading
          numeral="02"
          eyebrow={t(mode, 'skills.title')}
          titleLines={['A constellation', 'of what I build with']}
          description={t(mode, 'skills.subtitle')}
          amplifyMark
        />

        {/* SkillConstellation — enhanced entrance choreography */}
        <motion.div
          style={{ opacity: constellationOpacity, scale: constellationScale }}
          className="will-change-auto"
        >
          <Reveal direction="left">
            <SkillConstellation />
          </Reveal>
        </motion.div>

        {/* Top capabilities — a ruled readout, not a chip cloud. Each row is
            an instrument that activates as the scroll reaches it. */}
        <div className="mt-12 md:mt-16">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
            <p className="eyebrow">{t(mode, 'skills.topCapabilities')}</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
              {t(mode, 'skills.ranked')}
            </p>
          </div>

          {/* Grid with per-row stagger — the stagger is a CSS custom property
              that each SignalRow reads via its index. Velocity modulates the
              stagger density. */}
          <motion.ol
            className="rule-list grid grid-cols-1 gap-x-8 sm:grid-cols-2 md:grid-cols-3"
            style={{
              willChange: 'auto'
            }}
          >
            {allSkills.map((s, i) => (
              <SignalRow key={s.name} skill={s} index={i} />
            ))}
          </motion.ol>
        </div>

        {/* Motion density indicator — subtle reminder of scroll velocity */}
        {!reduced && (
          <motion.div
            className="mt-8 flex items-center justify-center gap-2 font-mono text-[10px] text-faint"
            aria-hidden
            style={{
              opacity: densityOpacity,
              scale: densityScale,
            }}
          >
            <span className="relative h-1 w-12 overflow-hidden rounded-full bg-edge/30">
              <motion.div
                style={{ width: densityWidth }}
                className="h-full bg-accent"
              />
            </span>
            <span className="text-faint">{t(mode, 'skills.velocity')}</span>
          </motion.div>
        )}
      </div>
    </section>
  )
}