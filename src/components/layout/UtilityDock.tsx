import { motion, AnimatePresence, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { profile } from '@/data/profile'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { useSoundtrack } from '@/store/soundtrackStore'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { VinylButton } from '@/components/soundtrack/VinylButton'
import { AtmosphereControl } from './AtmosphereControl'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import { useRef } from 'react'

/**
 * The utility dock — one coordinated system for the floating controls.
 *
 * Chat + music live in a single cluster anchored bottom-right. Both windows
 * can coexist — each is an independent draggable floating panel with its own
 * z-index layer. The dock is withheld during the hero's cold open (zero
 * chrome on the opening frame) and emerges as the prologue ends — the same
 * moment the Lodestar appears.
 *
 * With the Knight Portal runway (600vh), we track the runway's scroll progress
 * and reveal the dock after ~15% of the runway (approx 90vh), well before
 * the Hero content exits and the portal sequence completes.
 */
export function UtilityDock() {
  const { chatOpen, setChatOpen, recruiterMode, setRecruiterMode, hackerMode, setHackerMode, mode } = useUI()
  const { isOpen } = useSoundtrack()
  const reduced = usePrefersReducedMotion()
  const { pathname } = useLocation()
  const [modeOpen, setModeOpen] = useState(false)

  // Track the Knight Runway scroll progress to reveal the dock at the right moment.
  // The runway is 600vh; we reveal after ~15% progress (≈90vh scrolled).
  // Use a simple scroll listener since the runway starts at the top of the page.
  const runwayProgressMotion = useMotionValue(0)

  useEffect(() => {
    const updateProgress = () => {
      // The runway is 600vh = 6 * viewport height (600vh = 600/100 * viewport = 6 * viewport)
      // RUNWAY_VH = 600 in Hero.tsx, so runwayHeight = (600/100) * window.innerHeight = 6 * window.innerHeight
      const runwayHeight = 6 * window.innerHeight
      const progress = Math.min(1, Math.max(0, window.scrollY / runwayHeight))
      runwayProgressMotion.set(progress)
    }

    // Initial check
    updateProgress()

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [runwayProgressMotion])

  // On home page: dock appears after ~15% of Knight Runway (90vh)
  // On other routes: dock is always visible
  const isHome = pathname === '/'

  // Spring-based visibility: 0 = hidden, 1 = visible
  // Uses useSpring so it animates smoothly and can be used in animate/transition
  const dockVisibleRaw = useTransform(runwayProgressMotion, [0.1, 0.2], [0, 1])
  const dockVisible = useSpring(dockVisibleRaw, { stiffness: 400, damping: 30 })
  const staticOpacity = useMotionValue(1)

  // Derived motion value for y position (always a MotionValue)
  const dockY = useTransform(
    dockVisible,
    [0, 1],
    [reduced ? 0 : 10, 0]
  )

  // For non-home pages, use a constant 0 MotionValue
  const zeroY = useMotionValue(0)
  const animatedY = isHome ? dockY : zeroY

  return (
    <motion.div
      className="no-print fixed bottom-[var(--dock-bottom)] right-6 z-[70] flex flex-col items-center gap-3"
      initial={false}
      // Use style for MotionValue-driven properties; animate for simple values
      style={{
        y: animatedY,
        pointerEvents: isHome ? dockVisible : 'auto',
        opacity: isHome ? dockVisible : staticOpacity,
        visibility: isHome ? 'visible' : 'visible',
      }}
    >
      {!isOpen && <VinylButton />}

      {/* Each trigger is independent — only hidden when its own panel is open.
          Both panels can coexist as separate draggable floating windows. */}
      {!chatOpen && (
        <motion.button
          type="button"
          onClick={() => setChatOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          aria-label={t(mode, 'utility.askTwin').replace('{name}', profile.firstName)}
          className="grid h-14 w-14 cursor-pointer place-items-center rounded-full bg-accent font-display text-lg font-semibold text-base shadow-lift"
        >
          {profile.firstName[0]}
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-ground bg-ok" />
        </motion.button>
      )}

      {/* Mode selector — Recruiter / Standard / Hacker. Collapsed into a small
          trigger above the room light; the popover lists the three modes with
          the active one marked. This makes the existing HTML-class modes
          (recruiter-mode, hacker-mode) visible and toggleable for the visitor. */}
      <div className="relative flex flex-col items-center">
        <motion.button
          type="button"
          onClick={() => setModeOpen((v) => !v)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          aria-label={t(mode, 'utility.switchMode')}
          aria-expanded={modeOpen}
          className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-edge bg-surface/80 backdrop-blur-xl transition-colors duration-300 hover:border-edge-strong"
        >
          <Icon name={recruiterMode ? 'gauge' : hackerMode ? 'terminal' : 'eye'} size={15} className={recruiterMode ? 'text-accent' : 'text-muted'} />
        </motion.button>

        <AnimatePresence>
          {modeOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-full mb-2 flex w-44 flex-col gap-1 rounded-2xl border border-edge bg-surface/95 p-1.5 shadow-lift backdrop-blur-xl"
            >
              <ModeOption
                active={!recruiterMode && !hackerMode}
                icon="eye"
                label={t(mode, 'recruiter.switchStandard')}
                hint={t(mode, 'recruiter.standardHint')}
                onClick={() => {
                  setRecruiterMode(false)
                  setHackerMode(false)
                  setModeOpen(false)
                }}
              />
              <ModeOption
                active={recruiterMode}
                icon="gauge"
                label={t(mode, 'recruiter.switchQuick')}
                hint={t(mode, 'recruiter.quickHint')}
                onClick={() => {
                  setRecruiterMode(true)
                  setHackerMode(false)
                  setModeOpen(false)
                }}
              />
              <ModeOption
                active={hackerMode}
                icon="terminal"
                label={t(mode, 'recruiter.switchHacker')}
                hint={t(mode, 'recruiter.hackerHint')}
                onClick={() => {
                  setHackerMode(true)
                  setRecruiterMode(false)
                  setModeOpen(false)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Language mode selector — English / Japanese. Independent
          from the recruiter/hacker mode selector above to avoid interaction conflicts. */}
      <LanguageModeSelector />

      {/* The room light — at the foot of the dock. Always visible. */}
      <AtmosphereControl />
    </motion.div>
  )
}

function LanguageModeSelector() {
  const { mode, setMode } = useUI()
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [open])

  return (
    <div className="relative flex flex-col items-center">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t(mode, 'utility.switchLang')}
        aria-expanded={open}
        className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-edge bg-surface/80 backdrop-blur-xl transition-colors duration-300 hover:border-edge-strong focus:outline-none focus:ring-2 focus:ring-accent/40"
      >
        <Icon name="globe" size={14} className="text-muted" />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-accent px-1 py-0.5 text-[9px] font-bold leading-none text-base shadow-sm">{mode === 'ja' ? 'JP' : 'EN'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full mb-2 w-48 rounded-2xl border border-edge bg-surface/95 p-1.5 shadow-lift backdrop-blur-xl z-[75]"
            role="menu"
            aria-label={t(mode, 'utility.languageSelect')}
          >
            <button
              type="button"
              role="menuitem"
              aria-pressed={mode === 'en'}
              onClick={() => {
                if (mode === 'en') { setOpen(false); return }
                try { localStorage.setItem('portfolio:mode', 'en') } catch {}
                try { sessionStorage.setItem('portfolio:scrollTop', '1') } catch {}
                setMode('en')
                window.scrollTo({ top: 0, behavior: 'instant' })
                window.location.reload()
              }}
              className={cn('flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30', mode === 'en' ? 'bg-accent/10' : 'hover:bg-raised/60')}
            >
              <Icon name="check" size={14} className={mode === 'en' ? 'text-accent' : 'text-transparent'} aria-hidden />
              <span className={cn('text-[13px] font-medium', mode === 'en' ? 'text-accent' : 'text-ink')}>English</span>
              <span className="ml-auto text-[10px] text-faint">EN</span>
            </button>
            <button
              type="button"
              role="menuitem"
              aria-pressed={mode === 'ja'}
              onClick={() => {
                if (mode === 'ja') { setOpen(false); return }
                try { localStorage.setItem('portfolio:mode', 'ja') } catch {}
                try { sessionStorage.setItem('portfolio:scrollTop', '1') } catch {}
                setMode('ja')
                window.scrollTo({ top: 0, behavior: 'instant' })
                window.location.reload()
              }}
              className={cn('flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30', mode === 'ja' ? 'bg-accent/10' : 'hover:bg-raised/60')}
            >
              <Icon name="check" size={14} className={mode === 'ja' ? 'text-accent' : 'text-transparent'} aria-hidden />
              <span className={cn('text-[13px] font-medium', mode === 'ja' ? 'text-accent' : 'text-ink')}>日本語</span>
              <span className="ml-auto text-[10px] text-faint">JP</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ModeOptionProps {
  active: boolean
  icon: IconName
  label: string
  hint: string
  onClick: () => void
}

function ModeOption({ active, icon, label, hint, onClick }: ModeOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-200',
        active ? 'bg-accent/10' : 'hover:bg-raised/60',
      )}
    >
      <Icon name={icon} size={15} className={active ? 'text-accent' : 'text-muted'} />
      <span className="flex flex-col">
        <span className={cn('text-[13px] font-medium', active ? 'text-accent' : 'text-ink')}>
          {label}
        </span>
        <span className="text-[10px] text-faint">{hint}</span>
      </span>
    </button>
  )
}
