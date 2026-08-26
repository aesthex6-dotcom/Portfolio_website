import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUI } from '@/store/ui'

const GLYPHS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF<>*{}'

/** Full-screen Matrix rain. Activated by the "matrix" terminal command. */
export function MatrixRain() {
  const { matrixActive, setMatrixActive } = useUI()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (!matrixActive) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMatrixActive(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [matrixActive, setMatrixActive])

  useEffect(() => {
    if (!matrixActive || reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)
    const fontSize = 16
    const columns = Math.floor(width / fontSize)
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -30))

    const tick = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'
      ctx.fillRect(0, 0, width, height)
      ctx.font = `${fontSize}px monospace`
      for (let i = 0; i < drops.length; i++) {
        const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        ctx.fillStyle = Math.random() > 0.975 ? '#a7f3d0' : '#00e08a'
        ctx.fillText(char, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
      raf = requestAnimationFrame(tick)
    }

    const onResize = () => {
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [matrixActive, reduced])

  // The overlay must only exist while Matrix mode is active — otherwise it
  // permanently covers the page with a black screen (the canvas effects are
  // already guarded, but the JSX wasn't).
  if (!matrixActive) return null

  return (
    <motion.div
      className="fixed inset-0 z-[95] cursor-pointer bg-black"
      onClick={() => setMatrixActive(false)}
      role="button"
      aria-label="Disengage Matrix mode"
      initial={false}
    >
      <canvas ref={canvasRef} className="h-full w-full" aria-hidden />
      <p className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 font-mono text-[12px] tracking-widest text-[#00e08a]/70">
        click anywhere or press ESC to disengage
      </p>
    </motion.div>
  )
}
