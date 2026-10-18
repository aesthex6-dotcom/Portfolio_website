import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { profile } from '@/data/profile'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUI } from '@/store/ui'
import { scrollToId } from '@/lib/utils'
import { t } from '@/lib/i18n'
import { Icon } from '@/components/ui/Icon'
import { PhotoFrame } from '@/components/ui/PhotoFrame'
import { KnightPortal } from './KnightPortal'
import { useBrightPhase } from '@/hooks/useBrightPhase'

/** The house ease — calm, settled, cinematic. */
const EASE = [0.16, 1, 0.3, 1] as const
/** Amplified ease for SPRINT15 MOTION:7 — slightly sharper entry, more character. */
const EASE_SHARP = [0.22, 1, 0.28, 1] as const

/**
 * The Hero — the opening frame. The name IS the title: HIMANSHU / ARYA in
 * Sonder, dominating the top-left. Everything else is composed off-axis
 * around the negative space — an editorial spread, not a centered stack.
 *
 * This component serves two roles:
 * 1. It provides the Knight Portal cinematic runway (~360vh) — the Knight scene
 *    is fixed during this runway and scroll progress drives its progress engine.
 * 2. It renders the editorial Hero content that animates out during the first ~100vh.
 */
export function Hero() {
  const reduced = usePrefersReducedMotion()
  const { openTerminal, mode } = useUI()
  const bright = useBrightPhase()
  const heroRef = useRef<HTMLElement>(null)
  const runwayRef = useRef<HTMLElement>(null)

  // Two scroll progress values:
  // 1. runwayProgress: 0 → 1 over the 360vh Knight Runway (drives KnightPortal)
  // 2. heroProgress: 0 → 1 over just the first 100vh (drives initial Hero content exit)
  const { scrollYProgress: runwayProgress } = useScroll({
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

  // Fade out initial Hero content once heroProgress passes ~0.8
  const heroOpacity = useTransform(heroProgress, [0.5, 1], [1, 0])

  // Fade out Knight Portal after the runway completes (~p=0.98 to 1.02)
  const knightOpacity = useTransform(runwayProgress, [0.98, 1.02], [1, 0])

  // Bright-phase toggle — driven by the SCROLLABLE runway progress
  useEffect(() => {
    if (!runwayProgress) return
    const updateBright = (p: number) => {
      document.documentElement.classList.toggle('bright-phase', p > 0.78)
    }
    updateBright(runwayProgress.get())
    const unsub = runwayProgress.on('change', updateBright)
    return () => unsub()
  }, [runwayProgress])

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

  // Concise runway height: 360vh provides pristine cinematic pacing
  // while eliminating excessive scrolling before portfolio content begins.
  const RUNWAY_VH = 360

  return (
    <>
      <section
        ref={runwayRef}
        id="knight-runway"
        className="relative"
        aria-hidden="true"
        style={{ height: `${RUNWAY_VH}vh` }}
      >
        {/* Knight Portal scene — fixed to viewport */}
        <motion.div style={{ opacity: knightOpacity }} className="fixed inset-0">
          <KnightPortal scrollRef={runwayRef} />
        </motion.div>

        {/* Initial Hero Content (Fades out during first 100vh) */}
        <section
          ref={heroRef}
          id="top"
          className="fixed inset-0 min-h-[100svh] overflow-hidden pointer-events-none"
        >
          <div className="pointer-events-auto">
            <motion.div
              style={{ y: frameY, opacity: heroOpacity }}
              className="relative z-10 grid min-h-[100svh] grid-cols-1 px-6 pb-8 pt-24 md:px-10 lg:grid-cols-[1fr_1fr] lg:pb-12 lg:pt-32"
            >
              <div className="flex flex-col justify-between">
                <motion.div
                  initial={{ x: reduced ? 0 : -60, opacity: reduced ? 1 : 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: reduced ? 0 : 0.7, delay: reduced ? 0 : 0.1, ease: EASE }}
                >
                  <motion.h1
                    aria-label={t(mode, 'hero.headlineLine1') + ' ' + t(mode, 'hero.headlineLine2')}
                    style={{ y: titleY, scale: titleScale, transformOrigin: 'left bottom' }}
                    className={bright ? "font-hero text-[clamp(3rem,12vw,8.5rem)] leading-[0.88] tracking-[-0.02em] text-ink text-dark" : "font-hero text-[clamp(3rem,12vw,8.5rem)] leading-[0.88] tracking-[-0.02em] text-ink"}
                  >
                    <span aria-hidden className="block overflow-visible pb-[0.12em] pt-[0.04em]">
                      <motion.span className="block" {...line(0.15)}>
                        {mode === 'ja' ? t(mode, 'hero.headlineLine1') : 'HIMANSHU'}
                      </motion.span>
                    </span>
                    <span aria-hidden className="block overflow-visible pb-[0.12em] pt-[0.04em]">
                      <motion.span className="block" {...line(0.32)}>
                        {mode === 'ja' ? t(mode, 'hero.headlineLine2') : 'ARYA'}
                      </motion.span>
                    </span>
                  </motion.h1>
                </motion.div>

                <motion.div style={{ y: furnitureY }} className="mt-16">
                  <motion.div
                    initial={{ y: reduced ? 0 : 40, opacity: reduced ? 1 : 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.54, ease: EASE_SHARP }}
                    className="flex flex-col gap-3"
                  >
                    <p className={"font-mono text-[10px] uppercase tracking-[0.2em] text-faint" + (bright ? " text-[#374151]" : "")}>
                      {t(mode, 'hero.edition')}
                    </p>
                    <p className={"flex items-center gap-2 font-mono text-[11px] text-faint" + (bright ? " text-[#374151]" : "")}>
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                      {profile.availability}
                    </p>
                  </motion.div>
                </motion.div>
              </div>

              <div className="flex flex-col justify-between gap-20">
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
                          onClick={() => scrollToId('about')}
                          className="group inline-flex items-center gap-2 text-[15px] font-medium text-ink"
                        >
                          <span className="relative">
                            {t(mode, 'hero.explore')}
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
                          {t(mode, 'hero.terminal')}
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

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
                {t(mode, 'hero.portfolio')}
              </motion.p>
            </motion.div>

            <motion.button
              initial={{ y: reduced ? 0 : 20, opacity: reduced ? 1 : 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 1.2, ease: EASE }}
              type="button"
              onClick={() => scrollToId('about')}
              aria-label={t(mode, 'hero.scroll')}
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
