import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Styled keyboard key hint. */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-edge bg-raised px-1.5 font-mono text-[11px] font-medium text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  )
}
