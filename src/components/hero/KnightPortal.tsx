import { useEffect, useRef } from 'react'
import { motion, useScroll } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { RefObject } from 'react'
import { CinematicSequence } from './CinematicSequence'
import { useUI } from '@/store/ui'

interface KnightPortalProps {
  /** The hero section — the scroll target that drives the portal sequence. */
  scrollRef: RefObject<HTMLElement | null>
}

/**
 * Knight / Laptop Portal — the cinematic hero sequence.
 *
 * Renders the CinematicSequence canvas (background, rock, knight, laptop base/lid)
 * at z-[1] and an overlay SVG at z-[2] containing the laptop screen portal
 * with brand colors (#283845 background, #FFA649 technical UI for Knight / English)
 * or the Stratos palette (#ED254E background, #011936 text/UI) for Samurai / Japanese.
 */
export function KnightPortal({ scrollRef }: KnightPortalProps) {
  const reduced = usePrefersReducedMotion()
  const mode = useUI().mode

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end start'],
  })

  const svgRef = useRef<SVGSVGElement | null>(null)

  // Build the procedural screen furniture once, and rebuild when language mode changes.
  // Rebuilding preserves the screen's alignment and scroll-driven progress.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const $ = (id: string) => svg.querySelector<SVGElement>('#' + id)

    // grid
    const scrGrid = $('scrGrid')
    if (scrGrid) {
      scrGrid.innerHTML = ''
      let html = ''
      for (let x = 12; x < 168; x += 12) html += `<line x1="${x}" y1="0" x2="${x}" y2="122"/>`
      for (let y = 12; y < 122; y += 12) html += `<line x1="0" y1="${y}" x2="168" y2="${y}"/>`
      scrGrid.innerHTML = html
    }

    // schematic arcs + crosshair + corner brackets + ruler
    const scrSchematic = $('scrSchematic')
    const scrFrame = $('scrFrame')
    if (scrSchematic) {
      scrSchematic.innerHTML = ''
      const cx = 84, cy = 56
      let html = ''
      ;[[20, 0.55], [31, 0.4], [43, 0.28]].forEach(([r, o], i) => {
        html += `<circle cx="${cx}" cy="${cy}" r="${r}" stroke-opacity="${o}" stroke-dasharray="${(i * 7 + 4)} ${(i * 5 + 3)}"/>`
      })
      html += `<line x1="${cx}" y1="4" x2="${cx}" y2="118" stroke-opacity="0.25" stroke-dasharray="2 3"/>`
      html += `<line x1="6" y1="${cy}" x2="162" y2="${cy}" stroke-opacity="${mode === 'ja' ? '0.25' : '0.38'}" stroke-dasharray="2 3"/>`
      scrSchematic.innerHTML = html
    }
    if (scrFrame) {
      scrFrame.innerHTML = ''
      let fh = ''
      ;[[3, 3, 1, 1], [165, 3, -1, 1], [3, 119, 1, -1], [165, 119, -1, -1]].forEach(([x, y, sx, sy]) => {
        fh += `<path d="M${x} ${y + 9 * sy} L${x} ${y} L${x + 9 * sx} ${y}"/>`
      })
      for (let x = 8; x <= 160; x += 8) {
        fh += `<line x1="${x}" y1="118.5" x2="${x}" y2="${x % 40 === 8 ? 114.5 : 116.5}" stroke-opacity="0.4"/>`
      }
      fh += `<text x="8" y="10.5" font-family="ui-monospace,Consolas,monospace" font-size="5" fill="${mode === 'ja' ? '#ED254E' : '#FFA649'}" fill-opacity="0.9" stroke="none">${mode === 'ja' ? 'SYS//ESP' : 'SYS//MESH-01'}</text>`
      fh += `<text x="160" y="10.5" text-anchor="end" font-family="ui-monospace,Consolas,monospace" font-size="5" fill="${mode === 'ja' ? '#ED254E' : '#FFA649'}" fill-opacity="${mode === 'ja' ? 0.95 : 0.95}" stroke="none">◉ ${mode === 'ja' ? 'LIVE' : 'LIVE'}</text>`
      scrFrame.innerHTML = fh
    }

    // signals + nodes + code
    const scrSignals = $('scrSignals')
    const scrCode = $('scrCode')
    const SIGNALS = mode === 'ja'
      ? [
          { pts: [[10, 96], [38, 78], [60, 88], [96, 52], [128, 62], [158, 34]], col: '#011936', w: 1.3, op: 0.95 },
          { pts: [[10, 104], [44, 92], [84, 98], [120, 74], [158, 66]], col: '#ED254E', w: 0.8, op: 0.6 },
          { pts: [[14, 40], [48, 52], [92, 40], [126, 26]], col: '#ED254E', w: 0.8, op: 0.5 },
        ]
      : [
          { pts: [[10, 96], [38, 78], [60, 88], [96, 52], [128, 62], [158, 34]], col: '#FFA649', w: 1.3, op: 0.95 },
          { pts: [[10, 104], [44, 92], [84, 98], [120, 74], [158, 66]], col: '#FFA649', w: 0.8, op: 0.6 },
          { pts: [[14, 40], [48, 52], [92, 40], [126, 26]], col: '#FFA649', w: 0.8, op: 0.5 },
        ]
    const CODE_ROWS = [
      [10, 26, 44], [10, 34, 30, 'A'], [10, 42, 58], [10, 50, 24], [10, 58, 40],
      [10, 66, 52], [10, 74, 28, 'A'], [10, 82, 46],
    ]
    if (scrSignals) {
      scrSignals.innerHTML = ''
      let html = ''
      SIGNALS.forEach((s, i) => {
        const d = 'M' + s.pts.map((p) => p.join(' ')).join(' L')
        html += `<path id="sig${i}" d="${d}" stroke="${s.col}" stroke-opacity="${s.op}" stroke-width="${s.w}"/>`
        s.pts.forEach((p) => {
          html += `<circle class="node" cx="${p[0]}" cy="${p[1]}" r="1.9" fill="${s.col}" fill-opacity="0.95"/>`
          html += `<circle cx="${p[0]}" cy="${p[1]}" r="4.4" fill="none" stroke="${s.col}" stroke-opacity="0.4" stroke-width="0.6"/>`
        })
      })
      scrSignals.innerHTML = html

      let ch = ''
      CODE_ROWS.forEach(([x, y, w, orange]) => {
        ch += `<rect x="${x}" y="${y}" width="${w}" height="2.1" fill="${mode === 'ja' ? '#ED254E' : '#FFA649'}" fill-opacity="${orange ? 0.85 : 0.45}"/>`
      })
      ch += `<g fill="${mode === 'ja' ? '#ED254E' : '#FFA649'}" stroke="${mode === 'ja' ? '#ED254E' : '#FFA649'}" stroke-opacity="0.6" stroke-width="0.6">
        <path d="M128 84 l12 -8 12 8 -12 8 Z"/>
        <path d="M128 84 l12 8 12 -8 M140 92 v8" />
        <circle cx="140" cy="102" r="2" fill="${mode === 'ja' ? '#ED254E' : '#FFA649'}" fill-opacity="0.85" stroke="none"/>
      </g>`
      ch += `<g fill="${mode === 'ja' ? '#ED254E' : '#FFA649'}" fill-opacity="0.45">
        <rect x="128" y="110" width="26" height="1.6"/><rect x="128" y="114" width="18" height="1.6"/>
      </g>`
      scrCode!.innerHTML = ch
    }

    // precompute signal path lengths for draw-in
    SIGNALS.forEach((_, i) => {
      const el = svg.querySelector<SVGPathElement>('#sig' + i)
      if (el) {
        const len = el.getTotalLength()
        el.style.strokeDasharray = String(len)
      }
    })
  }, [mode])

  // Reusable progress engine for screen overlay tracking
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const $ = (id: string) => svg.querySelector<SVGElement>('#' + id)

    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
    const smooth = (t: number) => t * t * (3 - 2 * t)
    const track = (p: number, keys: [number, number][]) => {
      if (p <= keys[0][0]) return keys[0][1]
      for (let i = 1; i < keys.length; i++) {
        if (p <= keys[i][0]) {
          const [p0, v0] = keys[i - 1]
          const [p1, v1] = keys[i]
          return v0 + (v1 - v0) * smooth((p - p0) / (p1 - p0))
        }
      }
      return keys[keys.length - 1][1]
    }
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t
    const FX = 800, FY = 506

    const L = {
      screen: $('L-screen'), scrInner: $('scrInner'),
      bloom: $('screenBloom'), sheen: $('sheen'),
      sweep: $('scrSweep'),
    }

    const place = (el: Element | null, s: number, dx = 0, dy = 0) => {
      if (!el) return
      const tx = FX * (1 - s) + dx
      const ty = FY * (1 - s) + dy
      el.setAttribute('transform', `translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`)
    }

    const sigLens: number[] = []
    for (let i = 0; i < 3; i++) {
      const el = svg.querySelector<SVGPathElement>('#sig' + i)
      sigLens.push(el ? el.getTotalLength() : 0)
    }

    const render = (p: number) => {
      p = clamp(p, 0, 1)

      const sScr = track(p, [[0, 1], [0.45, 1.04], [0.62, 1.3], [0.75, 4.6], [0.8, 5.8], [0.9, 7.2], [1, 9.6]])
      place(L.screen, sScr)
      if (L.screen) L.screen.setAttribute('opacity', track(p, [[0.38, 0], [0.48, 1]]).toFixed(3))

      const glow = track(p, [[0.38, 0], [0.45, 0.85], [0.55, 1], [1, 1]])
      L.bloom?.setAttribute('opacity', (glow * track(p, [[0.38, 1], [0.8, 1], [0.92, 0]])).toFixed(3))
      L.sheen?.setAttribute('opacity', (track(p, [[0.4, 0], [0.5, 1]]) * 0.05 * (1 - track(p, [[0.7, 0], [0.9, 1]]))).toFixed(3))

      const cIn = track(p, [[0.42, 0], [0.6, 1]])
      $('scrGrid')?.setAttribute('opacity', (cIn * 0.95).toFixed(3))
      $('scrSchematic')?.setAttribute('opacity', track(p, [[0.45, 0], [0.62, 1]]).toFixed(3))
      $('scrFrame')?.setAttribute('opacity', track(p, [[0.48, 0], [0.64, 1]]).toFixed(3))
      $('scrCode')?.setAttribute('opacity', track(p, [[0.52, 0], [0.7, 1]]).toFixed(3))
      const draw = track(p, [[0.5, 0], [0.75, 1]])
      for (let i = 0; i < 3; i++) {
        const el = svg.querySelector<SVGPathElement>('#sig' + i)
        if (el) el.style.strokeDashoffset = (sigLens[i] * (1 - draw)).toFixed(2)
      }
      svg.querySelectorAll('#scrSignals .node').forEach((n, i) => {
        n.setAttribute('opacity', clamp(draw * 1.6 - i * 0.09, 0, 1).toFixed(3))
      })
      L.sweep?.setAttribute('y', lerp(0, 113, p).toFixed(1))

      const zoomIn = track(p, [[0.8, 0], [1, 1]])
      L.scrInner?.setAttribute('transform',
        `translate(${716 - zoomIn * 10} ${442 - zoomIn * 7}) scale(${1 + zoomIn * 0.13})`)
    }

    if (reduced) {
      render(0.62)
      return
    }

    const unsub = scrollYProgress.on('change', (p: number) => render(p))
    render(scrollYProgress.get())
    return () => unsub()
  }, [reduced, scrollYProgress])

  return (
    <>
      {/* CinematicSequence canvas renders at z-[1] */}
      <CinematicSequence scrollYProgress={scrollYProgress} reduced={reduced} />

      {/* Screen Portal SVG overlay renders at z-[2] directly on top of the canvas */}
      <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden" style={{ willChange: 'transform, opacity' }}>
        <motion.svg
          ref={svgRef}
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          width="100%"
          height="100%"
          role="img"
          aria-label="Laptop screen technical portal"
        >
          <defs>
            <radialGradient id="scrGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="${mode === 'ja' ? '#ED254E' : '#FFA649'}" stopOpacity="0.55" />
              <stop offset="0.45" stopColor="${mode === 'ja' ? '#ED254E' : '#FFA649'}" stopOpacity="0.22" />
              <stop offset="1" stopColor="${mode === 'ja' ? '#ED254E' : '#FFA649'}" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="vig" cx="0.5" cy="0.46" r="0.72">
              <stop offset="0" stopColor="#000000" stopOpacity="0" />
              <stop offset="0.62" stopColor="#000000" stopOpacity="0" />
              <stop offset="1" stopColor="#000000" stopOpacity="0.62" />
            </radialGradient>
            <clipPath id="scrClip"><rect x="0" y="0" width="168" height="122" rx="2" /></clipPath>
          </defs>

          {/* L6/L7 · SCREEN PORTAL OVERLAY */}
          <g id="L-screen" opacity="0">
            <ellipse id="screenBloom" cx="800" cy="506" rx="220" ry="170" fill="url(#scrGlow)" opacity="0" />
            <g id="scrInner" transform="translate(716 442)">
              <g clipPath="url(#scrClip)">
                <rect x="-2" y="-2" width="172" height="126" fill="${mode === 'ja' ? '#ED254E' : '#283845'}" />
                <g id="scrGrid" stroke="${mode === 'ja' ? '#ED254E' : 'rgba(255,166,73,0.12)'}" strokeWidth="0.5" />
                <g id="scrSchematic" fill="none" stroke="${mode === 'ja' ? 'rgba(237,37,78,0.38)' : 'rgba(255,166,73,0.38)'}" strokeWidth="0.7" />
                <g id="scrSignals" fill="none" strokeLinejoin="round" strokeLinecap="round" />
                <g id="scrCode" />
                <g id="scrFrame" stroke="${mode === 'ja' ? 'rgba(1,25,54,0.5)' : 'rgba(255,166,73,0.5)'}" fill="none" strokeWidth="0.7" />
                <rect id="scrSweep" x="0" y="0" width="168" height="9" fill="${mode === 'ja' ? '#011936' : '#FFA649'}" opacity="0.05" />
                <rect x="0" y="0" width="168" height="122" fill="url(#vig)" opacity="0.35" />
              </g>
            </g>
            <rect id="bezelTop" x="710" y="436" width="180" height="142" rx="5" fill="none" stroke="rgba(245,247,242,0.55)" strokeWidth="1.8" />
            <path id="sheen" d="M722 566 L800 444 L836 444 L758 566 Z" fill="#F5F7F2" opacity="0" />
          </g>
        </motion.svg>
      </div>
    </>
  )
}
