import { motion } from 'framer-motion'
import type { ArchitectureNode } from '@/types'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'

interface ArchitectureDetailCardProps {
  node: ArchitectureNode
  onClose: () => void
  className?: string
}

/** Section label for the design-doc card. */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-1.5">{label}</p>
      <p className="text-[13px] leading-relaxed text-muted">{children}</p>
    </div>
  )
}

/**
 * The floating explanation card for a selected architecture node — the
 * engineering design-doc view: role / why / alternatives / trade-offs.
 * Rendered inside an AnimatePresence by its parent (floating over the graph
 * on desktop, inline-expanding in the mobile timeline).
 */
export function ArchitectureDetailCard({ node, onClose, className }: ArchitectureDetailCardProps) {
  return (
    <motion.div
      key={node.id}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'rounded-xl border border-edge bg-raised/95 shadow-lift backdrop-blur',
        className,
      )}
      role="dialog"
      aria-label={`Why ${node.label}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-edge p-4 pb-3">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-ink">{node.label}</p>
          {node.subtitle && (
            <p className="mt-0.5 font-mono text-[10px] tracking-wide text-faint">{node.subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-faint transition-colors hover:bg-raised hover:text-ink"
          aria-label={`Close ${node.label} details`}
        >
          <Icon name="x" size={14} />
        </button>
      </div>

      <div className="max-h-[38vh] space-y-4 overflow-y-auto p-4 pt-3.5">
        <Section label="Role">{node.role}</Section>
        <Section label="Why this choice">{node.why}</Section>
        {node.alternatives.length > 0 && (
          <div>
            <p className="eyebrow mb-2">Alternatives considered</p>
            <div className="flex flex-wrap gap-1.5">
              {node.alternatives.map((a) => (
                <span key={a} className="chip !px-2.5 !py-0.5 !text-[11px]">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}
        <Section label="Trade-offs">{node.tradeoffs}</Section>
      </div>
    </motion.div>
  )
}
