import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import type { Chapter } from '@/data/chapters'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

interface ChapterSheetProps {
  chapters: Chapter[]
  current: Chapter | null
  onClose: () => void
  onSelect: (id: string) => void
  reduced: boolean
}

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Bottom-sheet chapter list for mobile / narrow screens — the calm fallback
 * when there isn't room for the constellation to float over empty space.
 */
export function ChapterSheet({ chapters, current, onClose, onSelect, reduced }: ChapterSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  // Land focus on the close button so the sheet is keyboard-usable immediately.
  useEffect(() => {
    closeRef.current?.focus()
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-[80]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      role="dialog"
      aria-modal="true"
      aria-label="Chapter navigation"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ground/60 backdrop-blur-sm" onClick={onClose} aria-hidden />

      {/* Sheet */}
      <motion.div
        className="absolute inset-x-0 bottom-0 mx-auto max-w-lg rounded-t-2xl border border-b-0 border-edge bg-surface shadow-lift"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: reduced ? 0 : 0.35, ease: EASE }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <p className="font-display text-sm font-semibold text-ink">Chapters</p>
            {current && (
              <p className="truncate font-mono text-[11px] text-faint">
                now · <span className="text-accent">{current.label}</span>
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close chapter navigation"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <Icon name="x" size={15} />
          </button>
        </div>

        <ul className="max-h-[46vh] overflow-y-auto p-2">
          {chapters.map((c, i) => {
            const isCurrent = c.id === current?.id
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onSelect(c.id)}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[15px] font-medium transition-colors',
                    isCurrent ? 'text-ink' : 'text-muted hover:bg-raised hover:text-ink',
                  )}
                >
                  <span className="font-mono text-[10px] tracking-widest text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {c.label}
                  {isCurrent && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </motion.div>
    </motion.div>
  )
}
