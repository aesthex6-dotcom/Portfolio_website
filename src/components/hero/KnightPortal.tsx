import { useEffect, useRef } from 'react'
import { motion, useScroll } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { RefObject } from 'react'

interface KnightPortalProps {
  /** The hero section — the scroll target that drives the portal sequence. */
  scrollRef: RefObject<HTMLElement | null>
}

/**
 * Knight / Laptop Portal — the cinematic hero sequence.
 *
 * This component reuses the EXACT SVG and progress engine from the standalone
 * scene at C:\Users\kumar\knight-portal-scene. The scene is a pure function of
 * normalized progress p ∈ [0,1]:
 *
 * 0.00 — Establishing shot: knight small against dark environment, laptop closed
 * 0.20 — Laptop opens, screen illuminates
 * 0.40 — Camera pushes toward laptop, knight/rock move to edges
 * 0.60 — Laptop dominates, technical graphics appear in screen
 * 0.80 — Camera enters screen, screen expands to fill viewport
 * 1.00 — Digital world: screen becomes the viewport
 *
 * Scroll upward reverses the entire sequence naturally because every visual
 * state is a pure function of p.
 *
 * The scene's `render(p)` engine is driven by Framer Motion's scrollYProgress.
 */
import { CinematicSequence } from './CinematicSequence'
export function KnightPortal({ scrollRef }: KnightPortalProps) {
  // mode from UI context available for integration; not directly read in this file.
  const reduced = usePrefersReducedMotion()

  const { scrollYProgress } = useScroll({
    target: scrollRef,
    offset: ['start start', 'end start'],
  })

  // Ref to the <svg> root so we can drive the vanilla engine against it.
  const svgRef = useRef<SVGSVGElement | null>(null)

  // Build the procedural screen furniture once (keys, grid, schematic, signals).
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const $ = (id: string) => svg.querySelector<SVGElement>('#' + id)

    // keyboard
    const keys = $('keys')
    if (keys && !keys.childElementCount) {
      let html = ''
      for (let r = 0; r < 4; r++) {
        const y = 583 + r * 6.4
        const n = 13
        const kw = 7.6
        const gap = 1.7
        const total = n * kw + (n - 1) * gap
        let x = 800 - total / 2
        for (let k = 0; k < n; k++) {
          if (!(r === 3 && k >= 4 && k <= 8)) {
            html += `<rect x="${x.toFixed(1)}" y="${y}" width="${kw}" height="4.6" rx="1"/>`
          }
          x += kw + gap
        }
        if (r === 3) {
          html += `<rect x="${(800 - total / 2 + 4 * 8.3).toFixed(1)}" y="${y}" width="${(kw * 5 + gap * 4).toFixed(1)}" height="4.6" rx="1"/>`
        }
      }
      keys.innerHTML = html
    }

    // grid
    const scrGrid = $('scrGrid')
    if (scrGrid && !scrGrid.childElementCount) {
      let html = ''
      for (let x = 12; x < 168; x += 12) html += `<line x1="${x}" y1="0" x2="${x}" y2="122"/>`
      for (let y = 12; y < 122; y += 12) html += `<line x1="0" y1="${y}" x2="168" y2="${y}"/>`
      scrGrid.innerHTML = html
    }

    // schematic arcs + crosshair + corner brackets + ruler
    const scrSchematic = $('scrSchematic')
    const scrFrame = $('scrFrame')
    if (scrSchematic && !scrSchematic.childElementCount) {
      const cx = 84, cy = 56
      let html = ''
      ;[[20, 0.55], [31, 0.4], [43, 0.28]].forEach(([r, o], i) => {
        html += `<circle cx="${cx}" cy="${cy}" r="${r}" stroke-opacity="${o}" stroke-dasharray="${(i * 7 + 4)} ${(i * 5 + 3)}"/>`
      })
      html += `<line x1="${cx}" y1="4" x2="${cx}" y2="118" stroke-opacity="0.16" stroke-dasharray="2 3"/>`
      html += `<line x1="6" y1="${cy}" x2="162" y2="${cy}" stroke-opacity="0.16" stroke-dasharray="2 3"/>`
      scrSchematic.innerHTML = html
    }
    if (scrFrame && !scrFrame.childElementCount) {
      let fh = ''
      ;[[3, 3, 1, 1], [165, 3, -1, 1], [3, 119, 1, -1], [165, 119, -1, -1]].forEach(([x, y, sx, sy]) => {
        fh += `<path d="M${x} ${y + 9 * sy} L${x} ${y} L${x + 9 * sx} ${y}"/>`
      })
      for (let x = 8; x <= 160; x += 8) {
        fh += `<line x1="${x}" y1="118.5" x2="${x}" y2="${x % 40 === 8 ? 114.5 : 116.5}" stroke-opacity="0.3"/>`
      }
      fh += `<text x="8" y="10.5" font-family="ui-monospace,Consolas,monospace" font-size="5" fill="#F5F7F2" fill-opacity="0.5" stroke="none">SYS//MESH-01</text>`
      fh += `<text x="160" y="10.5" text-anchor="end" font-family="ui-monospace,Consolas,monospace" font-size="5" fill="#C7FF38" fill-opacity="0.6" stroke="none">◉ LIVE</text>`
      scrFrame.innerHTML = fh
    }

    // signals + nodes + code
    const scrSignals = $('scrSignals')
    const scrCode = $('scrCode')
    const SIGNALS = [
      { pts: [[10, 96], [38, 78], [60, 88], [96, 52], [128, 62], [158, 34]], col: '#C7FF38', w: 1.3, op: 0.9 },
      { pts: [[10, 104], [44, 92], [84, 98], [120, 74], [158, 66]], col: '#F5F7F2', w: 0.8, op: 0.28 },
      { pts: [[14, 40], [48, 52], [92, 40], [126, 26]], col: '#F5F7F2', w: 0.8, op: 0.22 },
    ]
    const CODE_ROWS = [
      [10, 26, 44], [10, 34, 30, 'A'], [10, 42, 58], [10, 50, 24], [10, 58, 40],
      [10, 66, 52], [10, 74, 28, 'A'], [10, 82, 46],
    ]
    if (scrSignals && !scrSignals.childElementCount) {
      let html = ''
      SIGNALS.forEach((s, i) => {
        const d = 'M' + s.pts.map((p) => p.join(' ')).join(' L')
        html += `<path id="sig${i}" d="${d}" stroke="${s.col}" stroke-opacity="${s.op}" stroke-width="${s.w}"/>`
        s.pts.forEach((p) => {
          html += `<circle class="node" cx="${p[0]}" cy="${p[1]}" r="1.9" fill="${s.col}" fill-opacity="0.95"/>`
          html += `<circle cx="${p[0]}" cy="${p[1]}" r="4.4" fill="none" stroke="${s.col}" stroke-opacity="0.3" stroke-width="0.6"/>`
        })
      })
      scrSignals.innerHTML = html

      let ch = ''
      CODE_ROWS.forEach(([x, y, w, lime]) => {
        ch += `<rect x="${x}" y="${y}" width="${w}" height="2.1" fill="${lime ? '#C7FF38' : '#F5F7F2'}" fill-opacity="${lime ? 0.55 : 0.26}"/>`
      })
      ch += `<g fill="none" stroke="#F5F7F2" stroke-opacity="0.3" stroke-width="0.6">
        <path d="M128 84 l12 -8 12 8 -12 8 Z"/>
        <path d="M128 84 l12 8 12 -8 M140 92 v8" />
        <circle cx="140" cy="102" r="2" fill="#C7FF38" fill-opacity="0.5" stroke="none"/>
      </g>`
      ch += `<g fill="#F5F7F2" fill-opacity="0.2">
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
  }, [])

  // Reusable progress engine — identical math to the standalone scene.
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
      bg: $('L-bg'), rock: $('L-rock'), knight: $('L-knight'),
      laptop: $('L-laptop'), lid: $('lid'), screen: $('L-screen'), scrInner: $('scrInner'),
      bloom: $('screenBloom'), sheen: $('sheen'), led: $('pwrLed'),
      glowLight: $('knightGlowLight'), visor: $('visorGlint'), beacon: $('beacon'),
      sweep: $('scrSweep'), grain: $('grainRect'),
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

      place(L.bg, track(p, [[0, 1], [0.5, 1.06], [1, 1.22]]))
      place(L.rock, track(p, [[0, 1], [0.4, 1.08], [1, 1.52]]),
        track(p, [[0, 0], [0.4, 18], [1, 150]]))
      place(L.knight, track(p, [[0, 1], [0.4, 1.12], [1, 1.72]]),
        track(p, [[0, 0], [0.4, -14], [1, -135]]))
      place(L.laptop, track(p, [[0, 1], [0.35, 1.06], [0.6, 1.55], [0.8, 2.1], [1, 2.35]]))

      const sScr = track(p, [[0, 1], [0.45, 1.04], [0.62, 1.3], [0.8, 1.95], [0.9, 4.6], [1, 9.6]])
      place(L.screen, sScr)

      L.bg?.setAttribute('opacity', track(p, [[0, 1], [0.85, 1], [1, 0.35]]).toFixed(3))
      L.rock?.setAttribute('opacity', track(p, [[0, 1], [0.72, 1], [0.94, 0]]).toFixed(3))
      L.knight?.setAttribute('opacity', track(p, [[0, 1], [0.68, 1], [0.9, 0]]).toFixed(3))
      L.laptop?.setAttribute('opacity', track(p, [[0, 1], [0.82, 1], [0.97, 0.3]]).toFixed(3))
      if (L.screen) L.screen.setAttribute('opacity', '1')

      const open = track(p, [[0.1, 0], [0.3, 1]])
      const lidSy = lerp(0.07, 1, smooth(open))
      const tilt = lerp(3.5, -4, open)
      L.lid?.setAttribute('transform',
        `translate(${FX} 578) rotate(${tilt.toFixed(2)}) scale(1 ${lidSy.toFixed(4)}) translate(${-FX} -578)`)

      const glow = track(p, [[0.13, 0], [0.3, 0.85], [0.55, 1], [1, 1]])
      L.bloom?.setAttribute('opacity', (glow * track(p, [[0, 1], [0.8, 1], [0.92, 0]])).toFixed(3))
      L.sheen?.setAttribute('opacity', (open * 0.05 * (1 - track(p, [[0.7, 0], [0.9, 1]]))).toFixed(3))
      L.led?.setAttribute('opacity', glow.toFixed(3))
      L.glowLight?.setAttribute('opacity', (glow * 0.85 * track(p, [[0, 1], [0.75, 1], [0.9, 0]])).toFixed(3))
      L.visor?.setAttribute('opacity', (glow * 0.75 * track(p, [[0, 1], [0.75, 1], [0.9, 0]])).toFixed(3))
      L.beacon?.setAttribute('opacity', track(p, [[0, 0.5], [0.5, 0.25], [1, 0]]).toFixed(3))

      const cIn = track(p, [[0.42, 0], [0.6, 1]])
      $('scrGrid')?.setAttribute('opacity', (cIn * 0.9).toFixed(3))
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

    // Static / reduced-motion: hold a beautiful frame at p = 0.62
    if (reduced) {
      render(0.62)
      return
    }

    // Live: subscribe to Framer Motion scrollYProgress
    const unsub = scrollYProgress.on('change', (p: number) => render(p))
    render(scrollYProgress.get())
    return () => unsub()
  }, [reduced, scrollYProgress])

  return (
    <>
      <CinematicSequence scrollYProgress={scrollYProgress} reduced={reduced} />
      <div className="pointer-events-none fixed inset-0 z-[0] overflow-hidden" style={{ willChange: 'transform, opacity' }}>
        <motion.svg
        ref={svgRef}
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        width="100%"
        height="100%"
        role="img"
        aria-label="A medieval knight in etched linework rests against a weathered rock, working on a laptop whose screen becomes a portal into an abstract engineering system."
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#10131a" />
            <stop offset="0.55" stopColor="#15171b" />
            <stop offset="1" stopColor="#1a1b18" />
          </linearGradient>
          <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141413" />
            <stop offset="1" stopColor="#0e0e0e" />
          </linearGradient>
          <radialGradient id="moonHaze" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#F5F7F2" stopOpacity="0.05" />
            <stop offset="1" stopColor="#F5F7F2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="scrGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#CFFFA0" stopOpacity="0.55" />
            <stop offset="0.45" stopColor="#9CCB4E" stopOpacity="0.22" />
            <stop offset="1" stopColor="#C7FF38" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="scrFace" cx="0.5" cy="0.42" r="0.75">
            <stop offset="0" stopColor="#12140f" />
            <stop offset="0.7" stopColor="#0c0e0b" />
            <stop offset="1" stopColor="#070808" />
          </radialGradient>
          <radialGradient id="vig" cx="0.5" cy="0.46" r="0.72">
            <stop offset="0" stopColor="#000000" stopOpacity="0" />
            <stop offset="0.62" stopColor="#000000" stopOpacity="0" />
            <stop offset="1" stopColor="#000000" stopOpacity="0.62" />
          </radialGradient>
          <linearGradient id="fogUp" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#F5F7F2" stopOpacity="0.05" />
            <stop offset="1" stopColor="#F5F7F2" stopOpacity="0" />
          </linearGradient>

          <filter id="grainF" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="matrix"
              values="0 0 0 0 0.96  0 0 0 0 0.97  0 0 0 0 0.95  0 0 0 0.5 0" />
          </filter>
          <filter id="toothF" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.05" numOctaves="3" seed="7" stitchTiles="stitch" result="n" />
            <feColorMatrix in="n" type="matrix"
              values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.48  0 0 0 0.06 0" />
          </filter>

          <clipPath id="rockClip"><path d="M838 900 L852 764 C858 700 862 640 880 588 C900 534 936 492 986 452 C1040 408 1104 372 1178 348 C1260 320 1352 300 1450 288 L1600 270 L1600 900 Z" /></clipPath>
          <clipPath id="scrClip"><rect x="0" y="0" width="168" height="122" rx="2" /></clipPath>
        </defs>

        {/* L1 · DISTANT ENVIRONMENT */}
        <g id="L-bg" opacity="1">
          <rect x="-200" y="-120" width="2000" height="1140" fill="url(#sky)" />
          <rect x="-200" y="688" width="2000" height="360" fill="url(#ground)" />
          <ellipse cx="430" cy="250" rx="420" ry="180" fill="url(#moonHaze)" />
          <path d="M-200 700 L60 664 L210 682 L370 650 L520 674 L700 656 L900 676 L1100 660 L1320 680 L1600 662 L1800 676 L1800 720 L-200 720 Z" fill="#151514" opacity="0.9" />
          <path d="M-200 726 L90 692 L260 714 L420 700 L600 720 L800 708 L1000 722 L1250 712 L1500 724 L1800 714 L1800 780 L-200 780 Z" fill="#161616" />
          <g stroke="rgba(245,247,242,0.14)" strokeWidth="1.4">
            <path d="M212 700 L218 486 L252 480 L256 700 Z" fill="#131315" />
            <path d="M330 700 L336 442 L372 436 L376 700 Z" fill="#121214" />
            <path d="M472 700 L477 512 L506 508 L509 700 Z" fill="#131315" />
            <line x1="222" y1="500" x2="248" y2="496" strokeWidth="0.8" />
            <line x1="340" y1="470" x2="366" y2="466" strokeWidth="0.8" />
            <line x1="342" y1="500" x2="364" y2="497" strokeWidth="0.6" />
            <line x1="481" y1="530" x2="502" y2="527" strokeWidth="0.8" />
          </g>
          <rect id="beacon" x="352" y="452" width="3" height="3" fill="#C7FF38" opacity="0.5" />
          <g stroke="rgba(245,247,242,0.12)" strokeWidth="1">
            <path d="M150 620 h10 M155 615 v10" />
            <path d="M560 585 h10 M565 580 v10" />
            <path d="M1050 560 h10 M1055 555 v10" />
            <path d="M1330 520 h10 M1335 515 v10" />
          </g>
          <rect x="-200" y="640" width="2000" height="130" fill="url(#fogUp)" opacity="0.5" />
        </g>

        {/* L2 · ROCK */}
        <g id="L-rock" opacity="1">
          <ellipse cx="1180" cy="880" rx="620" ry="120" fill="#0d0d0d" opacity="0.8" />
          <path d="M838 900 L852 764 C858 700 862 640 880 588 C900 534 936 492 986 452 C1040 408 1104 372 1178 348 C1260 320 1352 300 1450 288 L1600 270 L1600 900 Z" fill="#151515" stroke="rgba(245,247,242,0.4)" strokeWidth="1.8" />
          <g clipPath="url(#rockClip)">
            <g fill="none" stroke="rgba(245,247,242,0.2)" strokeWidth="1">
              <path d="M820 800 Q1020 762 1240 772 T1660 748" />
              <path d="M830 730 Q1030 692 1250 702 T1660 678" />
              <path d="M850 660 Q1050 618 1270 630 T1660 600" />
              <path d="M878 592 Q1070 548 1290 556 T1660 522" />
              <path d="M930 512 Q1120 462 1340 470 T1660 440" />
              <path d="M1000 440 Q1190 392 1400 396 T1660 362" />
              <path d="M1090 380 Q1280 330 1480 332 T1660 306" />
              <path d="M1200 320 Q1390 274 1580 274" />
            </g>
            <g fill="none" stroke="rgba(8,8,8,0.95)" strokeWidth="2.6" strokeLinecap="round">
              <path d="M1010 880 Q1032 760 1020 640 Q1012 548 1042 470" />
              <path d="M1210 862 Q1236 720 1224 590 Q1216 500 1250 420" />
              <path d="M1420 856 Q1448 730 1436 600 Q1430 512 1462 430" />
              <path d="M1130 872 Q1140 800 1128 742" />
            </g>
            <g fill="none" stroke="rgba(8,8,8,0.8)" strokeWidth="1.4" strokeLinecap="round">
              <path d="M1042 470 Q1060 430 1096 404" />
              <path d="M1250 420 Q1272 384 1308 362" />
              <path d="M1462 430 Q1484 396 1520 378" />
              <path d="M1020 640 L1080 628" />
              <path d="M1224 590 L1290 578" />
            </g>
            <g stroke="rgba(0,0,0,0.5)" strokeWidth="1">
              <path d="M856 742 l54 -34" /><path d="M862 706 l52 -32" /><path d="M868 668 l50 -31" />
              <path d="M874 632 l48 -29" /><path d="M882 596 l46 -27" /><path d="M892 562 l44 -26" />
              <path d="M904 528 l42 -24" /><path d="M918 496 l40 -23" /><path d="M934 466 l38 -21" />
              <path d="M952 438 l36 -20" /><path d="M972 412 l34 -18" /><path d="M994 388 l32 -17" />
              <path d="M1018 364 l30 -15" /><path d="M1044 342 l28 -14" /><path d="M1072 322 l26 -12" />
            </g>
            <g fill="none" stroke="#C7FF38" strokeLinecap="round">
              <path d="M900 852 Q990 780 1060 700 Q1120 632 1150 560" strokeWidth="1.1" strokeDasharray="5 7" opacity="0.2" />
              <path d="M1160 860 Q1240 780 1290 690 Q1330 618 1360 540" strokeWidth="0.9" strokeDasharray="4 9" opacity="0.13" />
            </g>
            <path d="M852 764 C858 700 862 640 880 588 C900 534 936 492 986 452 C1040 408 1104 372 1178 348 C1260 320 1352 300 1450 288 L1596 270" fill="none" stroke="rgba(245,247,242,0.5)" strokeWidth="1.2" />
            <g fill="#111111" stroke="rgba(245,247,242,0.16)" strokeWidth="0.9">
              <path d="M806 892 l26 -18 22 18 Z" />
              <path d="M770 896 l18 -12 16 12 Z" />
              <path d="M846 898 l30 -20 26 20 Z" />
            </g>
          </g>
        </g>

        {/* L3+L4 · KNIGHT */}
        <g id="L-knight" opacity="1">
          <ellipse cx="742" cy="768" rx="190" ry="22" fill="#0a0a0a" opacity="0.75" />
          <g stroke="rgba(245,247,242,0.5)" strokeWidth="1.6" fill="#181818" strokeLinejoin="round">
            <g strokeWidth="1.4">
              <path d="M864 512 L861 350 L868 322 L875 350 L872 512 Z" fill="#101010" />
              <line x1="868" y1="348" x2="868" y2="500" stroke="rgba(245,247,242,0.28)" strokeWidth="0.9" />
              <path d="M846 516 L890 512 L888 522 L848 526 Z" fill="#161616" />
              <path d="M864 512 L866 548 L874 548 L876 512 Z" fill="#141414" />
              <circle cx="870" cy="556" r="6.5" fill="#161616" />
            </g>
            <g>
              <path d="M716 656 Q698 622 690 606 L668 614 Q676 640 700 668 Z" />
              <circle cx="679" cy="610" r="11" />
              <path d="M672 622 Q664 668 668 716 L688 718 Q690 668 692 630 Z" />
              <path d="M666 718 L690 720 L694 742 L640 750 Q634 740 640 730 Z" />
              <line x1="676" y1="640" x2="690" y2="638" strokeWidth="0.8" />
              <line x1="672" y1="668" x2="688" y2="666" strokeWidth="0.8" />
              <line x1="670" y1="692" x2="688" y2="691" strokeWidth="0.8" />
              <path d="M644 742 l14 -3 2 6 -14 3 Z" strokeWidth="0.8" />
            </g>
            <g>
              <path d="M748 654 Q756 618 760 602 L782 610 Q776 640 764 666 Z" />
              <circle cx="770" cy="606" r="11" />
              <path d="M762 618 Q772 664 770 714 L750 716 Q748 668 748 630 Z" />
              <path d="M748 716 L772 714 L782 738 L760 750 L744 740 Z" />
              <line x1="760" y1="640" x2="748" y2="638" strokeWidth="0.8" />
              <line x1="766" y1="668" x2="752" y2="667" strokeWidth="0.8" />
              <line x1="768" y1="692" x2="752" y2="691" strokeWidth="0.8" />
              <path d="M748 738 l16 2 -1 6 -16 -2 Z" strokeWidth="0.8" />
            </g>
            <path d="M694 570 Q736 584 780 570 L786 596 Q736 612 688 596 Z" />
            <path d="M700 596 Q736 610 774 596 L770 622 Q736 634 704 622 Z" />
            <path d="M706 622 Q736 632 768 622 L762 646 Q736 656 712 646 Z" />
            <path d="M700 456 L772 456 Q784 502 778 540 Q770 574 736 582 Q702 574 694 540 Q688 502 700 456 Z" />
            <path d="M736 458 L736 578" stroke="rgba(245,247,242,0.22)" strokeWidth="1" />
            <path d="M706 470 Q736 480 766 470" stroke="rgba(245,247,242,0.25)" strokeWidth="0.9" fill="none" />
            <path d="M702 500 Q736 512 770 500" stroke="rgba(245,247,242,0.25)" strokeWidth="0.9" fill="none" />
            <path d="M700 530 Q736 542 772 530" stroke="rgba(245,247,242,0.25)" strokeWidth="0.9" fill="none" />
            <g fill="rgba(245,247,242,0.4)" stroke="none">
              <circle cx="702" cy="470" r="1.4" /><circle cx="770" cy="470" r="1.4" />
              <circle cx="698" cy="504" r="1.4" /><circle cx="774" cy="504" r="1.4" />
              <circle cx="696" cy="538" r="1.4" /><circle cx="776" cy="538" r="1.4" />
            </g>
            <g>
              <path d="M700 450 Q668 452 656 474 Q650 492 662 504 Q680 510 698 498 L702 470 Z" />
              <path d="M662 478 Q676 470 694 474" fill="none" strokeWidth="0.9" />
              <path d="M658 492 Q674 484 694 490" fill="none" strokeWidth="0.9" />
              <path d="M700 452 Q690 470 692 494" fill="none" strokeWidth="0.9" />
            </g>
            <g>
              <path d="M772 448 Q804 450 816 472 Q822 490 810 502 Q792 508 774 496 L770 468 Z" />
              <path d="M810 476 Q796 468 778 472" fill="none" strokeWidth="0.9" />
              <path d="M814 490 Q798 482 778 488" fill="none" strokeWidth="0.9" />
              <path d="M772 450 Q782 468 780 492" fill="none" strokeWidth="0.9" />
            </g>
            <g>
              <path d="M796 470 Q812 496 806 528 Q802 548 794 562 L778 556 Q788 528 782 498 Z" />
              <circle cx="800" cy="540" r="8" />
              <path d="M792 560 L780 586 L796 594 L806 566 Z" />
              <path d="M776 586 L800 596 L802 606 L776 598 Z" />
              <line x1="782" y1="592" x2="796" y2="598" strokeWidth="0.7" />
            </g>
            <g>
              <path d="M676 472 Q660 500 662 532 Q664 554 672 570 L688 562 Q680 536 682 506 Z" />
              <circle cx="674" cy="556" r="8" />
              <path d="M670 574 L678 602 L694 596 L686 570 Z" />
              <path d="M676 600 L696 606 L692 616 L674 610 Z" />
            </g>
            <path d="M708 428 Q736 440 764 428 L768 452 Q736 464 704 452 Z" />
            <path d="M702 376 Q736 342 770 376 L775 414 Q736 428 697 414 Z" />
            <path d="M702 376 Q736 358 770 376" fill="none" strokeWidth="1" />
            <path d="M736 346 L736 372" strokeWidth="1" />
            <rect x="705" y="386" width="62" height="6.5" fill="#0a0a0a" stroke="rgba(245,247,242,0.35)" strokeWidth="1" />
            <g fill="rgba(245,247,242,0.35)" stroke="none">
              <circle cx="706" cy="410" r="1.3" /><circle cx="720" cy="413" r="1.3" />
              <circle cx="752" cy="413" r="1.3" /><circle cx="766" cy="410" r="1.3" />
            </g>
            <path d="M697 414 Q736 428 775 414" fill="none" strokeWidth="1" />
          </g>
          <g id="knightGlowLight" stroke="#BFF0A8" fill="none" strokeLinecap="round" opacity="0">
            <path d="M697 414 Q736 428 775 414" strokeWidth="2" opacity="0.8" />
            <path d="M704 452 Q736 464 768 452" strokeWidth="1.6" opacity="0.55" />
            <path d="M700 560 Q736 574 772 560" strokeWidth="1.6" opacity="0.5" />
            <path d="M694 596 Q736 612 786 596" strokeWidth="1.4" opacity="0.4" />
            <path d="M772 448 Q804 452 814 474" strokeWidth="1.4" opacity="0.45" />
            <path d="M778 556 Q794 548 800 528" strokeWidth="1.2" opacity="0.4" />
          </g>
          <line id="visorGlint" x1="708" y1="389.2" x2="764" y2="389.2" stroke="#C7FF38" strokeWidth="2.2" opacity="0" />
        </g>

        {/* L5 · LAPTOP */}
        <g id="L-laptop" opacity="1">
          <ellipse cx="800" cy="618" rx="120" ry="12" fill="#0a0a0a" opacity="0.7" />
          <path d="M722 612 L734 578 L866 578 L878 612 Z" fill="#101010" stroke="rgba(245,247,242,0.5)" strokeWidth="1.6" strokeLinejoin="round" />
          <g fill="#181818" stroke="rgba(245,247,242,0.3)" strokeWidth="0.7" id="keys" />
          <path d="M726 608 L874 608" stroke="rgba(245,247,242,0.18)" strokeWidth="1" />
          <circle id="pwrLed" cx="852" cy="583" r="1.8" fill="#C7FF38" opacity="0" />
          <path d="M732 578 L868 578" stroke="rgba(245,247,242,0.45)" strokeWidth="2.4" />
          <g fill="none" stroke="rgba(245,247,242,0.4)" strokeWidth="1">
            <circle cx="744" cy="578" r="3.4" /><circle cx="800" cy="578" r="3.4" /><circle cx="856" cy="578" r="3.4" />
          </g>
          <g id="lid">
            <rect x="710" y="436" width="180" height="142" rx="5" fill="#121212" stroke="rgba(245,247,242,0.55)" strokeWidth="1.8" />
            <rect x="716" y="442" width="168" height="130" rx="2.5" fill="#070808" stroke="rgba(245,247,242,0.2)" strokeWidth="1" />
            <path d="M716 448 L716 436 M884 448 L884 436" stroke="rgba(245,247,242,0.25)" strokeWidth="0.8" />
            <circle cx="800" cy="440.5" r="1.2" fill="rgba(245,247,242,0.3)" />
          </g>
        </g>

        {/* L6/L7 · SCREEN */}
        <g id="L-screen" opacity="1">
          <ellipse id="screenBloom" cx="800" cy="506" rx="220" ry="170" fill="url(#scrGlow)" opacity="0" />
          <g id="scrInner" transform="translate(716 442)">
            <g clipPath="url(#scrClip)">
              <rect x="-2" y="-2" width="172" height="126" fill="url(#scrFace)" />
              <g id="scrGrid" stroke="rgba(245,247,242,0.07)" strokeWidth="0.5" />
              <g id="scrSchematic" fill="none" stroke="rgba(245,247,242,0.34)" strokeWidth="0.7" />
              <g id="scrSignals" fill="none" strokeLinejoin="round" strokeLinecap="round" />
              <g id="scrCode" />
              <g id="scrFrame" stroke="rgba(245,247,242,0.4)" fill="none" strokeWidth="0.7" />
              <rect id="scrSweep" x="0" y="0" width="168" height="9" fill="#F5F7F2" opacity="0.045" />
              <rect x="0" y="0" width="168" height="122" fill="url(#vig)" opacity="0.55" />
            </g>
          </g>
          <rect id="bezelTop" x="710" y="436" width="180" height="142" rx="5" fill="none" stroke="rgba(245,247,242,0.55)" strokeWidth="1.8" />
          <path id="sheen" d="M722 566 L800 444 L836 444 L758 566 Z" fill="#F5F7F2" opacity="0" />
        </g>

        {/* OVERLAY · atmosphere */}
        <g id="overlay">
          <rect id="toothRect" x="0" y="0" width="1600" height="900" filter="url(#toothF)" opacity="0.5" style={{ mixBlendMode: 'soft-light' } as React.CSSProperties} />
          <rect x="0" y="0" width="1600" height="900" fill="url(#vig)" />
          <rect id="grainRect" x="0" y="0" width="1600" height="900" filter="url(#grainF)" opacity="0.06" style={{ mixBlendMode: 'overlay' } as React.CSSProperties} />
        </g>
      </motion.svg>
    </div>
    </>
  )
}
