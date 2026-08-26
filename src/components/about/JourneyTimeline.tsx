import { motion } from 'framer-motion'
import { useState } from 'react'
import { profile } from '@/data/profile'
import { cn } from '@/lib/utils'

/** Interactive journey — click a milestone to expand its story. */
export function JourneyTimeline() {
  const [active, setActive] = useState<number | null>(null)

  return (
    <>
      {/* Axis header — a construction label, not decoration. */}
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
          Axis · time
        </span>
        <span className="h-px flex-1 bg-edge/50" aria-hidden />
      </div>

      <ol className="relative space-y-2">
      {/* The axis — a dashed time-ruler; the accent lives only on the nodes. */}
      <div className="absolute bottom-2 left-[15px] top-2 border-l border-dashed border-edge-strong" aria-hidden />

      {profile.journey.map((item, i) => {
        const open = active === i
        return (
          <li key={item.year + item.title} className="relative">
            <div className="group relative flex gap-5 pb-2">
              {/* Node */}
              <button
                type="button"
                onClick={() => setActive(open ? null : i)}
                className="relative z-10 mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-edge bg-surface transition-colors hover:border-accent"
                aria-expanded={open}
                aria-label={`${item.year} · ${item.title}`}
              >
                <motion.span
                  className="h-2 w-2 rounded-full bg-accent"
                  animate={{ scale: open ? 1.6 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                />
              </button>

              {/* Content */}
              <motion.div
                className={cn(
                  'flex-1 cursor-pointer border-l border-transparent py-3 pl-4 pr-2 transition-colors duration-300',
                  open && 'border-accent bg-raised/25',
                  !open && 'hover:bg-raised/15',
                )}
                onClick={() => setActive(open ? null : i)}
              >
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[11px] text-faint">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-[11px] font-medium text-accent">
                    {item.year}
                  </span>
                  <h3 className="font-display text-base font-semibold text-ink md:text-lg">
                    {item.title}
                  </h3>
                  <span className="text-xs text-faint">{item.subtitle}</span>
                </div>

                <motion.p
                  className={cn(
                    'text-sm leading-relaxed text-muted',
                    open ? 'mt-2 block' : 'hidden',
                  )}
                  initial={false}
                >
                  {item.description}
                </motion.p>

                <div className={cn('mt-2 flex flex-wrap gap-1.5', open ? 'flex' : 'hidden')}>
                  {item.tags?.map((t) => (
                    <span key={t} className="chip !px-2 !py-0.5 !text-[11px]">
                      {t}
                    </span>
                  ))}
                </div>
              </motion.div>
            </div>
          </li>
        )
      })}
      </ol>
    </>
  )
}
