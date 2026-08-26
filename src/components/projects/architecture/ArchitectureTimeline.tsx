import { AnimatePresence, motion } from 'framer-motion'
import type { ArchitectureSpec } from '@/types'
import { Icon } from '@/components/ui/Icon'
import type { LayoutResult } from '@/lib/architecture/layout'
import { cn } from '@/lib/utils'
import { ArchitectureDetailCard } from './ArchitectureDetailCard'

interface ArchitectureTimelineProps {
  spec: ArchitectureSpec
  layout: LayoutResult
  selectedId: string | null
  onSelect: (id: string | null) => void
}

/**
 * Mobile (<768px) view: the same architecture as a vertical timeline — nodes
 * in flow order connected by a rail, tap to expand the detail card inline.
 */
export function ArchitectureTimeline({ spec, layout, selectedId, onSelect }: ArchitectureTimelineProps) {
  const selected = spec.nodes.find((n) => n.id === selectedId) ?? null

  return (
    <div className="relative">
      <div className="absolute bottom-3 left-[11px] top-3 w-px bg-edge" aria-hidden />

      <ol className="space-y-4" data-testid="arch-timeline">
        {layout.nodes.map((n, i) => {
          const active = selectedId === n.id
          const tone = n.tone === 'accent2' ? 'var(--accent-2)' : 'var(--accent)'
          return (
            <li key={n.id} className="relative pl-8">
              <span
                className="absolute left-[5px] top-[18px] h-3 w-3 rounded-full border-2 border-ground"
                style={{ background: tone, boxShadow: active ? `0 0 0 4px ${tone}22` : undefined }}
                aria-hidden
              />

              <motion.button
                type="button"
                onClick={() => onSelect(active ? null : n.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-xl border border-edge bg-surface text-left transition-colors hover:border-edge-strong"
                style={active ? { borderColor: tone } : undefined}
                aria-expanded={active}
              >
                <div className="flex items-center justify-between gap-3 p-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-ink">{n.label}</p>
                    {n.subtitle && (
                      <p className="mt-0.5 truncate font-mono text-[10px] tracking-wide text-faint">
                        {n.subtitle}
                      </p>
                    )}
                  </div>
                  <Icon
                    name="chevron-down"
                    size={15}
                    className={cn(
                      'shrink-0 text-faint transition-transform',
                      active && 'rotate-180',
                    )}
                  />
                </div>
              </motion.button>

              <AnimatePresence initial={false}>
                {active && selected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <ArchitectureDetailCard
                      node={selected}
                      onClose={() => onSelect(null)}
                      className="mt-2"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
