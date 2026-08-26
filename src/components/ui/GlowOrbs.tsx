import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface GlowOrbsProps {
  className?: string
}

/**
 * Ambient background glow — two large, soft radial gradients that drift
 * subtly with the cursor for a cinematic, precise feel. Neutral off-white
 * only; no blue, no purple, no green — the accent is functional-only.
 */
export function GlowOrbs({ className }: GlowOrbsProps) {
  const reduced = usePrefersReducedMotion()

  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 55, damping: 22 })
  const sy = useSpring(my, { stiffness: 55, damping: 22 })

  // Orb 1 drifts more strongly, orb 2 counter-drifts for parallax depth.
  const orb1x = useTransform(sx, (v) => `${(v - 0.5) * 10}%`)
  const orb1y = useTransform(sy, (v) => `${(v - 0.5) * 10}%`)
  const orb2x = useTransform(sx, (v) => `${(v - 0.5) * -6}%`)
  const orb2y = useTransform(sy, (v) => `${(v - 0.5) * -6}%`)

  useEffect(() => {
    if (reduced) return
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth)
      my.set(e.clientY / window.innerHeight)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [reduced, mx, my])

  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden
    >
      <motion.div
        style={{
          x: orb1x,
          y: orb1y,
          background: 'radial-gradient(circle at center, rgba(245,247,242,0.04), transparent 62%)',
        }}
        className="absolute -left-[12%] -top-[14%] h-[42vw] w-[42vw] rounded-full"
      />
      <motion.div
        style={{
          x: orb2x,
          y: orb2y,
          background:
            'radial-gradient(circle at center, rgba(245,247,242,0.05), transparent 60%)',
        }}
        className="absolute -bottom-[18%] -right-[10%] h-[38vw] w-[38vw] rounded-full"
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245,247,242,0.03), transparent)',
        }}
      />
    </div>
  )
}
