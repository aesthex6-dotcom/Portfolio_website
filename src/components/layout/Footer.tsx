import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef, useMemo } from 'react'
import { motion, useScroll, useTransform, useVelocity } from 'framer-motion'
import { profile } from '@/data/profile'
import { navSections } from '@/data/nav'
import { scrollToId } from '@/lib/utils'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { Icon } from '@/components/ui/Icon'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const socials: { label: string; href: string; icon: ReactNode }[] = [
  { label: 'GitHub', href: profile.socials.github, icon: <Github className="h-4 w-4" /> },
  { label: 'LinkedIn', href: profile.socials.linkedin, icon: <Icon name="linkedin" size={14} /> },
  { label: 'Email', href: profile.socials.email, icon: <Icon name="mail" size={14} /> },
].filter((s) => s.href)

/**
 * Footer — the digital destination. The laptop screen's interior.
 *
 * This is where the Knight Portal terminates. The visual language matches
 * the screen interior at p=1: dark engineered background, grid structure,
 * lime accent, framed by a vignette. The footer IS the digital world.
 *
 * Enhanced with cinematic arrival choreography:
 * - Background plate builds progressively (grid → arcs → signal paths → vignette)
 * - Content reveals in sequence (brand → sections → socials → status line)
 * - Scanline sweep and film grain activate as part of the arrival
 * - Velocity-responsive springs for all motion
 * - Matches Knight Portal exit timing for seamless transition
 */
export function Footer() {
  const { openTerminal, mode } = useUI()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const year = new Date().getFullYear()

  // Scroll progress for footer arrival
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Velocity for spring modulation
  const velocity = useVelocity(scrollYProgress)
  const stiffness = useTransform(velocity, [-6, 6], [280, 180])
  const damping = useTransform(velocity, [-6, 6], [26, 36])

  // Progressive arrival beats
  const bgBaseOpacity = useTransform(scrollYProgress, [0, 0.25], reduced ? [1, 1] : [0, 1])
  const gridOpacity = useTransform(scrollYProgress, [0.1, 0.4], reduced ? [0.08, 0.08] : [0, 0.08])
  const arcsOpacity = useTransform(scrollYProgress, [0.2, 0.5], reduced ? [0.12, 0.12] : [0, 0.12])
  const signalsOpacity = useTransform(scrollYProgress, [0.3, 0.6], reduced ? [0.18, 0.18] : [0, 0.18])
  const vignetteOpacity = useTransform(scrollYProgress, [0.4, 0.7], reduced ? [1, 1] : [0, 1])
  const scanlineOpacity = useTransform(scrollYProgress, [0.5, 0.8], reduced ? [0.035, 0.035] : [0, 0.035])
  const grainOpacity = useTransform(scrollYProgress, [0.6, 0.9], reduced ? [0.04, 0.04] : [0, 0.04])

  const brandOpacity = useTransform(scrollYProgress, [0.2, 0.5], reduced ? [1, 1] : [0, 1])
  const brandY = useTransform(scrollYProgress, [0.2, 0.5], reduced ? [0, 0] : [20, 0])
  const navOpacity = useTransform(scrollYProgress, [0.35, 0.65], reduced ? [1, 1] : [0, 1])
  const navY = useTransform(scrollYProgress, [0.35, 0.65], reduced ? [0, 0] : [20, 0])
  const socialsOpacity = useTransform(scrollYProgress, [0.5, 0.8], reduced ? [1, 1] : [0, 1])
  const socialsY = useTransform(scrollYProgress, [0.5, 0.8], reduced ? [0, 0] : [20, 0])
  const bottomBarOpacity = useTransform(scrollYProgress, [0.65, 0.95], reduced ? [1, 1] : [0, 1])
  const bottomBarY = useTransform(scrollYProgress, [0.65, 0.95], reduced ? [0, 0] : [16, 0])

  // Pre-compute transition configs
  const enterTransition = useMemo(
    () => ({ stiffness, damping }),
    [stiffness, damping]
  )

  return (
    <footer id="footer" ref={ref} className="no-print relative overflow-hidden">
      {/* Screen-surface background — matches Knight Portal screen interior at p=1 */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* Base screen face — deep charcoal with subtle warmth */}
        <motion.div
          style={{ opacity: bgBaseOpacity }}
          transition={enterTransition}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,#0c0e0b_0%,#070808_70%,#050606_100%)]"
        />

        {/* Faint grid — the engineering substrate */}
        <motion.svg
          style={{ opacity: gridOpacity }}
          transition={enterTransition}
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <pattern id="footerGrid" width="44" height="44" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="44" y2="0" stroke="#F5F7F2" strokeWidth="0.5" />
              <line x1="0" y1="0" x2="0" y2="44" stroke="#F5F7F2" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footerGrid)" />
        </motion.svg>

        {/* Schematic arcs — subtle system geometry */}
        <motion.svg
          style={{ opacity: arcsOpacity }}
          transition={enterTransition}
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <radialGradient id="footerArc1" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#C7FF38" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#C7FF38" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="footerArc2" cx="50%" cy="30%" r="40%">
              <stop offset="0%" stopColor="#F5F7F2" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#F5F7F2" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="50%" cy="30%" r="28%" fill="url(#footerArc1)" />
          <circle cx="50%" cy="30%" r="18%" fill="url(#footerArc2)" />
          <line x1="50%" y1="5%" x2="50%" y2="55%" stroke="#F5F7F2" strokeWidth="0.5" strokeDasharray="8 12" strokeOpacity="0.15" />
          <line x1="10%" y1="30%" x2="90%" y2="30%" stroke="#F5F7F2" strokeWidth="0.5" strokeDasharray="8 12" strokeOpacity="0.15" />
        </motion.svg>

        {/* Signal paths — the living data streams */}
        <motion.svg
          style={{ opacity: signalsOpacity }}
          transition={enterTransition}
          className="absolute inset-0 w-full h-full"
        >
          <defs>
            <style>{`
              @keyframes signalDraw {
                0% { stroke-dashoffset: 1000; stroke-dasharray: 0 1000; }
                50% { stroke-dashoffset: 0; stroke-dasharray: 1000 0; }
                100% { stroke-dashoffset: -1000; stroke-dasharray: 1000 0; }
              }
              @keyframes sweep {
                0% { transform: translateY(0); }
                100% { transform: translateY(calc(100vh + 9px)); }
              }
            `}</style>
          </defs>
          <path
            d="M10%,70% C25%,55% 45%,62% 65%,42% C80%,28% 90%,18% 95%,12%"
            stroke="#C7FF38"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0 1000"
            style={{ animation: 'signalDraw 4s ease-in-out infinite' }}
          />
          <path
            d="M8%,80% C30%,65% 58%,70% 78%,50% C92%,38% 98%,28% 99%,20%"
            stroke="#F5F7F2"
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.3"
            strokeDasharray="0 1000"
            style={{ animation: 'signalDraw 5s ease-in-out infinite reverse' }}
          />
          <path
            d="M12%,45% C35%,55% 68%,48% 88%,30%"
            stroke="#F5F7F2"
            strokeWidth="0.7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.2"
            strokeDasharray="0 1000"
            style={{ animation: 'signalDraw 3.5s ease-in-out infinite' }}
          />
        </motion.svg>

        {/* Inner vignette — seals the frame like the screen bezel */}
        <motion.div
          style={{ opacity: vignetteOpacity }}
          transition={enterTransition}
          className="absolute inset-0"
        >
          <div
            style={{
              background:
                'radial-gradient(ellipse 90% 85% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)',
            }}
            className="absolute inset-0"
          />
        </motion.div>

        {/* Scanline sweep — subtle motion like the screen */}
        <motion.div
          style={{ opacity: scanlineOpacity }}
          transition={enterTransition}
          className="absolute left-0 right-0 h-[9px]"
        >
          <div
            style={{
              top: '0',
              background: '#F5F7F2',
              opacity: 1,
              animation: 'sweep 6s linear infinite',
            }}
            className="absolute inset-0"
          />
        </motion.div>

        {/* Film grain / tooth texture */}
        <motion.div
          style={{ opacity: grainOpacity }}
          transition={enterTransition}
          className="absolute inset-0"
        >
          <div
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'512\' height=\'512\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'1\'/%3E%3C/svg%3E")',
              backgroundSize: '512px 512px',
              mixBlendMode: 'overlay',
              opacity: 1,
              pointerEvents: 'none',
            }}
            className="absolute inset-0"
          />
        </motion.div>
      </div>

      {/* Content layer — sits on the screen surface */}
      <div className="container-site relative flex flex-col gap-10 py-14 md:py-20 z-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          {/* Brand section */}
          <motion.div
            style={{ opacity: brandOpacity, y: brandY }}
            transition={enterTransition}
            className="max-w-sm"
          >
            <div className="rounded-xl bg-raised/30 p-4 backdrop-blur-sm border border-edge/30">
              <Link to="/" className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-edge font-display text-sm font-semibold text-ink">
                  {profile.firstName[0]}
                </span>
                <span className="font-display text-[15px] font-semibold text-ink">
                  {profile.name}
                </span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-muted">{profile.tagline}</p>
              <button
                type="button"
                onClick={openTerminal}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-lime/30 px-4 py-2 text-[13px] text-muted transition-colors hover:border-lime hover:text-ink"
              >
                <Icon name="terminal" size={15} />
                Open interactive terminal
              </button>
            </div>
          </motion.div>

          {/* Navigation sections */}
          <motion.nav
            style={{ opacity: navOpacity, y: navY }}
            transition={enterTransition}
            className="grid grid-cols-2 gap-8 sm:grid-cols-3"
            aria-label="Footer"
          >
            <div className="rounded-xl bg-raised/30 p-4 backdrop-blur-sm border border-edge/30">
              <p className="eyebrow mb-4 text-lime/60">{t(mode, 'footer.sections')}</p>
              <ul className="space-y-2.5">
                {navSections.slice(0, 4).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => scrollToId(s.id)}
                      className="text-sm text-[rgb(var(--text-rgb)/0.9)] transition-colors hover:text-lime"
                    >
                      {t(mode, 'nav.' + s.id)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-raised/30 p-4 backdrop-blur-sm border border-edge/30">
              <p className="eyebrow mb-4 text-lime/60">{t(mode, 'footer.more')}</p>
              <ul className="space-y-2.5">
                {navSections.slice(4).map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => scrollToId(s.id)}
                      className="text-sm text-[rgb(var(--text-rgb)/0.9)] transition-colors hover:text-lime"
                    >
                      {t(mode, 'nav.' + s.id)}
                    </button>
                  </li>
                ))}
                <li>
                  <Link
                    to="/resume"
                    className="text-sm text-[rgb(var(--text-rgb)/0.9)] transition-colors hover:text-lime"
                  >
                    {t(mode, 'footer.resume')}
                  </Link>
                </li>
              </ul>
            </div>
            {socials.length > 0 && (
              <motion.div
                style={{ opacity: socialsOpacity, y: socialsY }}
                transition={enterTransition}
              >
                <div className="rounded-xl bg-raised/30 p-4 backdrop-blur-sm border border-edge/30">
                  <p className="eyebrow mb-4 text-lime/60">{t(mode, 'footer.elsewhere')}</p>
                  <ul className="space-y-2.5">
                    {socials.map((s) => (
                      <li key={s.label}>
                        <a
                          href={s.href}
                          target={s.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-[rgb(var(--text-rgb)/0.9)] transition-colors hover:text-lime"
                        >
                          {s.icon}
                          {s.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </motion.nav>
        </div>

        {/* Bottom bar — system status line */}
        <motion.div
          style={{ opacity: bottomBarOpacity, y: bottomBarY }}
          transition={enterTransition}
          className="flex flex-col items-center justify-between gap-4 border-t border-lime/15 pt-6 sm:flex-row"
        >
          <div className="rounded-xl bg-raised/30 px-4 py-2 backdrop-blur-sm border border-edge/30 w-full sm:w-auto">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-[13px] text-muted"
            >
              {t(mode, 'footer.status').replace('2026', String(year))}
            </motion.p>
          </div>
          <div className="rounded-xl bg-raised/30 px-4 py-2 backdrop-blur-sm border border-edge/30 w-full sm:w-auto">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
            >
              <p className="recruiter-hide font-mono text-[11px] text-muted">
                {t(mode, 'footer.tip')}
              </p>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="grid h-8 w-8 place-items-center rounded-full border border-lime/30 text-muted transition-all hover:-translate-y-0.5 hover:border-lime hover:text-lime"
                aria-label={t(mode, 'utility.backToTop')}
              >
                <Icon name="arrow-up" size={15} />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}