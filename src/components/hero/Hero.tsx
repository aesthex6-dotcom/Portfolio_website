import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { profile } from '@/data/profile'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUI } from '@/store/ui'
import { scrollToId } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { PhotoFrame } from '@/components/ui/PhotoFrame'
import { KnightPortal } from './KnightPortal'

/** The house ease — calm, settled, cinematic. */
const EASE = [0.16, 1, 0.3, 1] as const
/** Amplified ease for SPRINT15 MOTION:7 — slightly sharper entry, more character. */
const EASE_SHARP = [0.22, 1, 0.28, 1] as const

/**
 * The Hero — the opening frame. The name IS the title: HIMANSHU / ARYA in
 * Sonder, dominating the top-left. Everything else is composed off-axis
 * around the negative space — an editorial spread, not a centered stack.
 *
 * This component now serves TWO roles:
 * 1. It provides the Knight Portal cinematic runway (~600vh) — the Knight scene
 *    is fixed during this runway and the scroll progress drives its progress engine.
 * 2. It renders the editorial Hero content (title, portrait, CTA) that animates out
 *    during the first ~100vh of the runway, then disappears.
 *
 * The portfolio sections (About, Skills, Projects, etc.) are rendered in Home.tsx
 * AFTER the Knight Runway, so at p=1 the laptop screen visually becomes the
 * website background and the content emerges from within it.
 */
export function Hero() {
  const reduced = usePrefersReducedMotion()
  const { openTerminal } = useUI()
  const heroRef = useRef<HTMLElement>(null)
  const runwayRef = useRef<HTMLElement>(null)

  // Two scroll progress values:
  // 1. runwayProgress: 0 → 1 over the full 600vh Knight Runway (drives KnightPortal via scrollRef)
  // 2. heroProgress: 0 → 1 over just the first 100vh (drives Hero content exit)
  useScroll({
    target: runwayRef,
    offset: ['start start', 'end start'],
  })
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Hero content animates out during the first ~100vh (heroProgress 0→1)
  const frameY = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : 64])
  const titleY = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : -72])
  const titleScale = useTransform(heroProgress, [0, 1], [1, reduced ? 1 : 0.965])
  const furnitureY = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : 28])
  const portraitY = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : -40])
  const portraitScale = useTransform(heroProgress, [0, 1], [1, reduced ? 1 : 1.06])
  const runningHeadY = useTransform(heroProgress, [0, 1], [0, reduced ? 0 : -18])

  // Fade out Hero content once heroProgress passes ~0.8 (content fully gone by p=1)
  const heroOpacity = useTransform(heroProgress, [0.5, 1], [1, 0])

  // Fade out Knight Portal after the runway completes (~p=0.98 to 1.02)
  // This prevents it from becoming a persistent background and lets the
  // Footer (styled as the screen interior) take over as the visual destination
  const knightOpacity = useTransform(heroProgress, [0.98, 1.02], [1, 0])

  const line = (delay: number) => ({
    initial: { y: reduced ? 0 : '110%', opacity: reduced ? 1 : 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: reduced ? 0 : 1.15, delay, ease: EASE },
  })

  const furniture = (delay: number) => ({
    initial: { opacity: 0, y: reduced ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.8, delay, ease: EASE_SHARP },
  })

  // The runway height: 600vh gives ~600 viewport heights of scroll distance
  // for the Knight cinematic sequence. This matches the standalone scene's
  // 620vh but is slightly shorter to account for Hero content animating out.
  const RUNWAY_VH = 600

  return (
    <>
      {/*
         KNIGHT RUNWAY — the scroll container that drives the cinematic sequence.
         This is a dedicated element (not the Hero section) so its 600vh height
         provides enough scroll distance for the full 0→1 Knight progress.
         The KnightPortal is fixed to the viewport during this entire runway.
      */}
      <section
        ref={runwayRef}
        id="knight-runway"
        className="relative"
        aria-hidden="true"
        style={{ height: `${RUNWAY_VH}vh` }}
      >
        {/* Knight Portal scene — fixed to viewport, fills the screen.
             Fades out after runway so Footer (screen interior) becomes destination. */}
        <motion.div style={{ opacity: knightOpacity }} className="fixed inset-0">
          <KnightPortal scrollRef={runwayRef} />
        </motion.div>

        {/*
           HERO CONTENT — editorial spread that overlays the Knight scene.
           Fixed to the viewport so it stays at the top while the runway provides
           scroll distance. Animates out during the first ~100vh of scroll
           (heroProgress 0→1), then disappears.
        */}
        <section
          ref={heroRef}
          id="top"
          className="fixed inset-0 min-h-[100svh] overflow-hidden pointer-events-none"
        >
          <div className="pointer-events-auto">
            {/* Hero content — fades out as heroProgress reaches 1 */}
            <motion.div
              style={{ y: frameY, opacity: heroOpacity }}
              className="relative z-10 grid min-h-[100svh] grid-cols-1 px-6 pb-8 pt-24 md:px-10 lg:grid-cols-[1fr_1fr] lg:pb-12 lg:pt-32"
            >
              <div className="flex flex-col justify-between">
                {/* Title — entrance from left */}
                <motion.div
                  initial={{ x: reduced ? 0 : -60, opacity: reduced ? 1 : 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.1, ease: EASE }}
                >
                  <motion.h1
                    aria-label="Himanshu Arya"
                    style={{ y: titleY, scale: titleScale, transformOrigin: 'left bottom' }}
                    className="font-hero text-[clamp(3.25rem,13vw,9.5rem)] leading-[0.84] tracking-[-0.02em] text-ink"
                  >
                    <span aria-hidden className="block overflow-hidden pb-[0.06em]">
                      <motion.span className="block" {...line(0.15)}>
                        HIMANSHU
                      </motion.span>
                    </span>
                    <span aria-hidden className="block overflow-hidden pb-[0.06em]">
                      <motion.span className="block" {...line(0.32)}>
                        ARYA
                      </motion.span>
                    </span>
                  </motion.h1>
                </motion.div>

                {/* Page furniture + availability — bottom-left, entrance from below */}
                <motion.div style={{ y: furnitureY }} className="mt-16">
                  <motion.div
                    initial={{ y: reduced ? 0 : 40, opacity: reduced ? 1 : 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.54, ease: EASE_SHARP }}
                    className="flex flex-col gap-3"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                      EDITION 01 · 2026
                    </p>
                    <p className="flex items-center gap-2 font-mono text-[11px] text-faint">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                      {profile.availability}
                    </p>
                  </motion.div>
                </motion.div>
              </div>

              {/* Portrait + supporting copy — the right half of the spread */}
              <div className="flex flex-col justify-between gap-20">
                {/* Portrait — entrance from right, then continuous floating */}
                <motion.div
                  style={{ y: portraitY, scale: portraitScale }}
                  className="ml-auto w-fit"
                >
                  <motion.div
                    initial={{ x: reduced ? 0 : 60, opacity: reduced ? 1 : 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.18, ease: EASE }}
                  >
                    <PhotoFrame
                      photo={profile.photo}
                      imgAlt="Portrait of Himanshu Arya"
                      objectPosition="50% 39%"
                      className="h-40 w-40 sm:h-56 sm:w-56 lg:h-[clamp(12rem,22vh,15.5rem)] lg:w-[clamp(12rem,22vh,15.5rem)]"
                    />
                  </motion.div>
                </motion.div>

                <motion.div style={{ y: furnitureY }} className="flex justify-end">
                  <motion.div
                    initial={{ y: reduced ? 0 : 40, opacity: reduced ? 1 : 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.3, ease: EASE_SHARP }}
                    className="max-w-sm text-right lg:ml-auto"
                  >
                    <p className="text-[15px] leading-relaxed text-muted md:text-base">
                      {profile.roles[0]} · {profile.roles[1]} · {profile.roles[2]}
                    </p>

                    <p className="mt-4 text-[13px] leading-relaxed text-muted/80 md:text-sm">
                      {profile.intro[0]}
                    </p>

                    <motion.div
                      initial={{ y: reduced ? 0 : 40, opacity: reduced ? 1 : 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.42, ease: EASE_SHARP }}
                    >
                      <div className="mt-6 flex flex-col items-end gap-3">
                        <button
                          type="button"
                          onClick={() => scrollToId('projects')}
                          className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink"
                        >
                          <span className="relative">
                            Explore the work
                            <span
                              className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-500 ease-out group-hover:scale-x-100"
                              aria-hidden
                            />
                          </span>
                          <Icon
                            name="arrow-right"
                            size={16}
                            className="transition-transform duration-500 group-hover:translate-x-0.5"
                          />
                        </button>

                        <button
                          type="button"
                          onClick={openTerminal}
                          className="font-mono text-[11px] tracking-wide text-faint transition-colors hover:text-muted"
                        >
                          open terminal
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Running head — top-right, entrance from right, then floating */}
            <motion.div
              initial={{ x: reduced ? 0 : 40, opacity: reduced ? 1 : 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.6, ease: EASE }}
              style={{ y: runningHeadY, opacity: heroOpacity }}
              className="absolute right-7 top-6 hidden md:block"
            >
              <motion.p
                {...furniture(1.05)}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint"
              >
                PORTFOLIO · 2026
              </motion.p>
            </motion.div>

            {/* Scroll cue — bottom-center, entrance from below, then floating */}
            <motion.button
              initial={{ y: reduced ? 0 : 20, opacity: reduced ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 1.2, ease: EASE }}
              type="button"
              onClick={() => scrollToId('about')}
              aria-label="Scroll to about"
              className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 md:block"
            >
              <span className="relative block h-12 w-px overflow-hidden bg-edge">
                {!reduced && (
                  <motion.span
                    className="absolute left-0 top-0 h-4 w-px bg-muted"
                    animate={{ y: [-12, 46] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: [0.65, 0, 0.35, 1] }}
                  />
                )}
              </span>
            </motion.button>
          </div>
        </section>
      </section>
    </>
  )
}