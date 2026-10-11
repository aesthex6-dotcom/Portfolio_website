import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { Icon } from '@/components/ui/Icon'

/** The hidden "404 dimension" — a void you should never be able to reach. */
export function NotFound() {
  const { mode } = useUI()
  usePageMeta(t(mode, 'notFound.title') + ' · Himanshu Arya')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      tw: Math.random() * Math.PI * 2,
    }))

    const tick = () => {
      const w = (canvas.width = window.innerWidth)
      const h = (canvas.height = window.innerHeight)
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        s.tw += 0.03
        const alpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(s.tw))
        ctx.fillStyle = `rgba(245,247,242,${alpha})`
        const r = s.z * 1.6
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, r + 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-6 pt-16">
      <canvas ref={canvasRef} className="absolute inset-0" aria-hidden />

      <div className="relative z-10 mx-auto max-w-xl text-center">
        <div className="mx-auto mb-8 grid h-20 w-20 place-items-center rounded-3xl border border-edge text-muted">
          <Icon name="ghost" size={36} />
        </div>
        <p className="eyebrow">{t(mode, 'notFound.error404')}</p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
          {t(mode, 'notFound.titleLines1')} {t(mode, 'notFound.titleLines2')}
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
          {t(mode, 'notFound.message')}
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Icon name="arrow-left" size={15} />
            {t(mode, 'notFound.teleportHome')}
          </Link>
          <Link to="/resume" className="btn-ghost">
            <Icon name="sparkles" size={15} />
            {t(mode, 'notFound.goToResume')}
          </Link>
        </div>
        <p className="mt-10 font-mono text-[12px] text-faint">
          {t(mode, 'notFound.konamiHint')}
        </p>
      </div>
    </section>
  )
}
