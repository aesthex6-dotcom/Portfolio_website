import { motion } from 'framer-motion'
import { useAtmosphere, type AtmosphereLevel } from '@/store/atmosphere'
import { Icon, type IconName } from '@/components/ui/Icon'
import { cn } from '@/lib/utils'

/** Display name for each room. */
const LABEL: Record<AtmosphereLevel, string> = {
  low: 'Low',
  neutral: 'Neutral',
  high: 'High',
}

/** Glyph + tone for each room — a quiet escalation in the line language. */
const PER_LEVEL: Record<AtmosphereLevel, { icon: IconName; tone: string }> = {
  low: { icon: 'moon', tone: 'text-faint' },
  neutral: { icon: 'sun', tone: 'text-muted' },
  high: { icon: 'sun-bright', tone: 'text-ink' },
}

/**
 * AtmosphereControl — the room light, not a monitor-brightness slider.
 *
 * A single round trigger at the foot of the dock. Click cycles the room
 * (Low → Neutral → High); the glyph and tone escalate with the light, and the
 * current room reads on hover. Lives at the bottom of the dock so open panels
 * (which rise from the dock bottom) never cover it — and it yields to the chat
 * panel just like the other triggers, so nothing ever overlaps.
 */
export function AtmosphereControl() {
  const { level, cycle } = useAtmosphere()
  const { icon, tone } = PER_LEVEL[level]

  return (
    <motion.button
      type="button"
      onClick={cycle}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Atmosphere · ${LABEL[level]}. Activate to brighten the room.`}
      title={`Atmosphere: ${LABEL[level]}`}
      className="group relative grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-edge bg-surface/80 backdrop-blur-xl transition-colors duration-300 hover:border-edge-strong"
    >
      <Icon name={icon} size={15} className={cn('transition-colors duration-300', tone)} />

      {/* Hover readout — the room label, seated left of the trigger.
          visibility:hidden keeps it truly invisible (not just opacity:0)
          so headless audits never flag it as rendered-invisible text. */}
      <span
        className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-full border border-edge bg-ground/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-muted invisible group-hover:visible group-hover:opacity-100 backdrop-blur-md transition-all duration-200"
        role="tooltip"
      >
        {LABEL[level]}
      </span>
    </motion.button>
  )
}
