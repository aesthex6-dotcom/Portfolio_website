import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useRef, type ReactNode, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  onClick?: () => void
  as?: 'button' | 'a'
  href?: string
  target?: string
  rel?: string
  ariaLabel?: string
}

/** A button that gently magnetizes toward the cursor. */
export function MagneticButton({
  children,
  className,
  strength = 0.35,
  onClick,
  as = 'button',
  href,
  target,
  rel,
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 180, damping: 15, mass: 0.4 })
  const sy = useSpring(my, { stiffness: 180, damping: 15, mass: 0.4 })

  const onMove = (e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    mx.set((e.clientX - (rect.left + rect.width / 2)) * strength)
    my.set((e.clientY - (rect.top + rect.height / 2)) * strength)
  }

  const reset = () => {
    mx.set(0)
    my.set(0)
  }

  const Tag = (as === 'a' ? 'a' : 'button') as 'a'

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      className="inline-block"
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      <Tag
        href={as === 'a' ? href : undefined}
        target={as === 'a' ? target : undefined}
        rel={as === 'a' ? rel : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
        className={cn('inline-flex', className)}
      >
        {children}
      </Tag>
    </motion.div>
  )
}
