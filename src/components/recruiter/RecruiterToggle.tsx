import { AnimatePresence, motion } from 'framer-motion'
import { useUI } from '@/store/ui'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

/** Floating Quick Overview toggle — fixed just below the navbar. */
export function RecruiterToggle() {
  const { recruiterMode, setRecruiterMode } = useUI()

  return (
    <motion.button
      type="button"
      onClick={() => setRecruiterMode(!recruiterMode)}
      aria-pressed={recruiterMode}
      aria-label={recruiterMode ? 'Switch to standard view' : 'Open Quick Overview'}
      initial={{ opacity: 0, y: -12, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.8, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'no-print fixed right-7 top-[5rem] z-[80] inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-semibold backdrop-blur-xl transition-colors duration-300',
        recruiterMode
          ? 'border-accent bg-accent text-base'
          : 'border-edge bg-surface/80 text-muted hover:border-edge-strong hover:text-ink',
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={recruiterMode ? 'exit' : 'enable'}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="inline-flex items-center gap-2"
        >
          <Icon name="gauge" size={14} aria-hidden />
          {recruiterMode ? 'Standard view' : 'Quick Overview'}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
