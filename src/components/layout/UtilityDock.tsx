import { motion, AnimatePresence, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { profile } from '@/data/profile'
import { useUI } from '@/store/ui'
import { useSoundtrack } from '@/store/soundtrackStore'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { VinylButton } from '@/components/soundtrack/VinylButton'
import { AtmosphereControl } from './AtmosphereControl'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

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
  const { chatOpen, setChatOpen, recruiterMode, setRecruiterMode, hackerMode, setHackerMode } = useUI()
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
          aria-label={`Ask ${profile.firstName} (digital twin)`}
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
          aria-label="Switch viewing mode"
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
                label="Standard"
                hint="Full experience"
                onClick={() => {
                  setRecruiterMode(false)
                  setHackerMode(false)
                  setModeOpen(false)
                }}
              />
              <ModeOption
                active={recruiterMode}
                icon="gauge"
                label="Quick Overview"
                hint="Condensed for recruiters"
                onClick={() => {
                  setRecruiterMode(true)
                  setHackerMode(false)
                  setModeOpen(false)
                }}
              />
              <ModeOption
                active={hackerMode}
                icon="terminal"
                label="Hacker"
                hint="Debug overlay + terminal"
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

      {/* The room light — at the foot of the dock. Always visible. */}
      <AtmosphereControl />
    </motion.div>
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
