import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Reveal } from './Reveal'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  className?: string
}

/**
 * Honest "not yet" — rendered as a reserved editorial space, not an empty box.
 * A hairline rule, a quiet line mark, and the display line that will one day
 * hold real content. The absence is part of the design, not a hole in it.
 */
export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  return (
    <Reveal className={cn('relative border-t border-edge pt-10 md:pt-12', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <span className="grid h-10 w-10 place-items-center rounded-full border border-edge text-muted">
            {icon}
          </span>
        )}
        <span className="eyebrow">Reserved</span>
      </div>
      <h3 className="mt-7 max-w-xl font-display text-2xl font-semibold tracking-[-0.02em] text-ink text-balance md:text-3xl">
        {title}
      </h3>
      {description && (
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted">{description}</p>
      )}
    </Reveal>
  )
}
