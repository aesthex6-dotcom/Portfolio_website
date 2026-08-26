import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import type { RefObject } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface HeroBackgroundProps {
  /** The hero section — the scroll target that drives the camera dolly. */
  scrollRef: RefObject<HTMLElement | null>
}

/**
 * Layered cinematic light behind the Hero — the "film" the title sits in.
 *
 * Layers (back → front): faint grid, key light on the name, a whisper of
 * neutral depth, then a vignette to seal the frame. Each light layer
 * drifts with the cursor at a slightly different rate for slow parallax,
 * and the whole backdrop participates in the hero's camera move: the grid
 * lags the page (a far plane receding as the title pulls away), while the
 * key light sinks with the frame. Pure light on purpose: no particles, no
 * blue gradients, no glass, no green — the accent is reserved for
 * functional elements.
 */
export function HeroBackground({ scrollRef }: HeroBackgroundProps) {
  const reduced = usePrefersReducedMotion()

  // Cursor parallax — the two light planes float apart at different rates.
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 45, damping: 24 })
  const sy = useSpring(my, { stiffness: 45, damping: 24 })

  const keyX = useTransform(sx, (v) => `${(v - 0.5) * -6}%`)
  const keyY = useTransform(sy, (v) => `${(v - 0.5) * -6}%`)
  const tintX = useTransform(sx, (v) => `${(v - 0.5) * 5}%`)
  const tintY = useTransform(sy, (v) => `${(v - 0.5) * 5}%`)

  // Camera dolly — the backdrop participates in the hero's scroll exit.
  // The grid is the far plane: it recedes slower than the page, so the
  // world behind the title keeps slipping away as the camera pulls out.
  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end start'],
  })
  const gridY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ['0svh', '0svh'] : ['0svh', '-24svh'],
  )
  // The key light rides the frame plane — it sinks with the composition,
  // lingering behind the title that lifts away from it.
  const keyScrollY = useTransform(
    scrollYProgress,
    [0, 1],
    reduced ? ['0svh', '0svh'] : ['0svh', '10svh'],
  )

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
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Faint grid, masked to a soft patch of light (Linear touch). Oversized
          (180%) so the far-plane drift never exposes an edge while in frame. */}
      <motion.div
        style={{ y: gridY }}
        className="absolute inset-x-0 -top-[40%] h-[180%] bg-grid-faint bg-[size:44px_44px] opacity-40 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_35%,black,transparent)]"
      />

      {/* Key light — the spotlight that rests on the name. Cool off-white.
          Cursor drift (x/y) on the outer plane; the scroll-linked sink rides
          the inner one, so camera + cursor compose without conflicting on y. */}
      <motion.div
        style={{ x: keyX, y: keyY }}
        className="absolute -left-[18%] -top-[24%] h-[120vmax] w-[120vmax]"
      >
        <motion.div
          style={{
            y: keyScrollY,
            background:
              'radial-gradient(circle at 50% 40%, rgba(245,247,242,0.05), transparent 58%)',
          }}
          className="h-full w-full rounded-full"
        />
      </motion.div>

      {/* Faint neutral depth, far bottom-right — precision without color. */}
      <motion.div
        style={{
          x: tintX,
          y: tintY,
          background: 'radial-gradient(circle at 50% 50%, rgba(245,247,242,0.03), transparent 62%)',
        }}
        className="absolute -bottom-[26%] -right-[18%] h-[80vmax] w-[80vmax] rounded-full"
      />

      {/* Vignette — seals the frame, darkens the edges (cool charcoal). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 85% at 50% 45%, transparent 55%, rgba(20,20,20,0.55) 100%)',
        }}
      />
    </div>
  )
}
