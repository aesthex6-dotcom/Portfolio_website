import { motion, useScroll, useTransform } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * EngineeredField — the one continuous mechanism behind the story.
 *
 * A fixed, full-viewport blueprint layer: compass ring, crosshair, dimension
 * arc, datum baseline, a dashed signal path and sparse construction lines.
 * Each element draws itself in across a different scroll range, so reading the
 * page reads like progressively revealing an engineered system. All strokes
 * are neutral off-white — this is infrastructure, not interface. No green.
 *
 * Scroll is a one-way mechanism with three depths:
 *  - far plane   → the graticule (concentric rings) settles in last, slowest
 *  - mid plane   → ring + crosshair swing into alignment
 *  - near plane  → a signal packet routes along the path, lighting each node
 *                  as it passes; the dimension arc + datum follow
 * Scrolling up rewinds every transform naturally (pure functions of scroll
 * progress), so the mechanism un-builds itself.
 *
 * Geometry lives in a central safe zone (roughly x∈[28,72], y∈[24,72]) so the
 * mechanism stays fully on-screen at any aspect ratio; the crosshair alone
 * runs off-frame, which reads as the machine extending beyond the viewport.
 *
 * Reduced motion: a static state at ~60% draw, no scroll linkage.
 */
export function EngineeredField() {
  const reduced = usePrefersReducedMotion()
  const { scrollYProgress } = useScroll()

  // Linear interpolation clamped to the scroll range, or a constant under
  // reduced motion (static at ~60% draw).
  const map = (v: number, a1: number, a2: number, b1: number, b2: number) => {
    const t = Math.min(1, Math.max(0, (v - a1) / (a2 - a1)))
    return b1 + (b2 - b1) * t
  }

  // strokeDashoffset 1 → hidden, 0 → fully drawn (pathLength normalized to 1).
  const ringDash = useTransform(scrollYProgress, (v) =>
    reduced ? 0.4 : map(v, 0, 0.5, 1, 0.15),
  )
  // Crosshair lags the ring by a hair — the mechanism swings into alignment.
  const crossDash = useTransform(scrollYProgress, (v) =>
    reduced ? 0.4 : map(v, 0.05, 0.55, 1, 0.15),
  )
  // The signal travels node 1 → node 4 across the whole scroll.
  const signalDash = useTransform(scrollYProgress, (v) =>
    reduced ? 0.4 : map(v, 0, 1, 1, 0),
  )
  // The dashed texture settles once the solid pulse has run its course.
  const signalOpacity = useTransform(scrollYProgress, (v) =>
    reduced ? 1 : map(v, 0.2, 0.9, 0, 1),
  )
  // The dimension arc draws in just after the ring; its tick + label follow.
  const arcDash = useTransform(scrollYProgress, (v) =>
    reduced ? 0.4 : map(v, 0.15, 0.6, 1, 0.15),
  )
  const arcDetail = useTransform(scrollYProgress, (v) =>
    reduced ? 0.6 : map(v, 0.2, 0.65, 0, 0.6),
  )
  // The datum baseline is present from the start, sharpening as you read.
  const baselineOpacity = useTransform(scrollYProgress, (v) =>
    reduced ? 1 : map(v, 0, 0.4, 0.3, 1),
  )

  // --- v2: the living mechanism -------------------------------------------
  // The signal path as a polyline, so a packet can route along it.
  const NODES = [
    [24, 64],
    [40, 54],
    [60, 60],
    [72, 46],
  ] as const
  const SEGMENTS = NODES.slice(0, -1).map(([x1, y1], i) => {
    const [x2, y2] = NODES[i + 1]
    const len = Math.hypot(x2 - x1, y2 - y1)
    return { x1, y1, dx: x2 - x1, dy: y2 - y1, len }
  })
  const TOTAL_LEN = SEGMENTS.reduce((a, s) => a + s.len, 0)
  const pointAt = (t: number) => {
    const target = Math.min(1, Math.max(0, t)) * TOTAL_LEN
    let acc = 0
    for (const s of SEGMENTS) {
      if (target <= acc + s.len) {
        const f = (target - acc) / s.len
        return { x: s.x1 + s.dx * f, y: s.y1 + s.dy * f }
      }
      acc += s.len
    }
    return { x: NODES[NODES.length - 1][0], y: NODES[NODES.length - 1][1] }
  }

  // A packet routes node 1 → node 4; each node lights as the packet passes
  // and stays lit (progressive construction), unlighting as you scroll back.
  const packetX = useTransform(scrollYProgress, (v) =>
    reduced ? 40 : pointAt(v).x,
  )
  const packetY = useTransform(scrollYProgress, (v) =>
    reduced ? 54 : pointAt(v).y,
  )
  // Each node lights as the packet passes and stays lit (progressive
  // construction), unlighting as you scroll back.
  const nodeOpacity = [
    useTransform(scrollYProgress, (v) =>
      reduced ? 0.45 : map(v, -0.08, 0.1, 0.05, 0.5),
    ),
    useTransform(scrollYProgress, (v) =>
      reduced ? 0.45 : map(v, 0.22, 0.4, 0.05, 0.5),
    ),
    useTransform(scrollYProgress, (v) =>
      reduced ? 0.45 : map(v, 0.52, 0.7, 0.05, 0.5),
    ),
    useTransform(scrollYProgress, (v) =>
      reduced ? 0.45 : map(v, 0.82, 1.0, 0.05, 0.5),
    ),
  ]

  // Far plane — the graticule settles in across the back half of the scroll.
  const graticuleOpacity = useTransform(scrollYProgress, (v) =>
    reduced ? 0.7 : map(v, 0.3, 1, 0, 0.7),
  )
  // A second, slower route line crosses the composition late — deeper than
  // the signal path, drawn in over the back quarter.
  const routeDash = useTransform(scrollYProgress, (v) =>
    reduced ? 0.55 : map(v, 0.55, 1, 1, 0),
  )

  // Neutral blueprint strokes — the field never uses the accent.
  const HAIR = 'rgba(245,247,242,0.035)'
  const FAINT = 'rgba(245,247,242,0.02)'
  const WIRE = 'rgba(245,247,242,0.025)'
  const LABEL = 'rgba(245,247,242,0.045)'

  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Far plane — graticule rings + radial ticks. The deepest geometry,
          slowest to settle. */}
      <motion.g style={{ opacity: graticuleOpacity }}>
        {[22, 27, 32].map((r) => (
          <circle
            key={r}
            cx={50}
            cy={48}
            r={r}
            fill="none"
            stroke={FAINT}
            strokeWidth="0.2"
          />
        ))}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const a = (deg * Math.PI) / 180
          return (
            <line
              key={deg}
              x1={50 + Math.cos(a) * 22}
              y1={48 + Math.sin(a) * 22}
              x2={50 + Math.cos(a) * 27}
              y2={48 + Math.sin(a) * 27}
              stroke={FAINT}
              strokeWidth="0.2"
            />
          )
        })}
      </motion.g>

      {/* Datum baseline — the ground plane, always present. */}
      <g>
        <motion.line
          x1={20}
          y1={70}
          x2={80}
          y2={70}
          stroke={HAIR}
          strokeWidth="0.25"
          style={{ opacity: baselineOpacity }}
        />
        {[20, 35, 50, 65, 80].map((x) => (
          <line key={x} x1={x} y1={67.5} x2={x} y2={72.5} stroke={FAINT} strokeWidth="0.25" />
        ))}
      </g>

      {/* Compass ring — the master mechanism. */}
      <motion.circle
        cx={50}
        cy={48}
        r={22}
        fill="none"
        stroke={HAIR}
        strokeWidth="0.35"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: ringDash }}
      />

      {/* Crosshair through the ring center — extends off-frame. */}
      <motion.line
        x1={50}
        y1={0}
        x2={50}
        y2={100}
        stroke={HAIR}
        strokeWidth="0.25"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: crossDash }}
      />
      <motion.line
        x1={0}
        y1={48}
        x2={100}
        y2={48}
        stroke={HAIR}
        strokeWidth="0.25"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: crossDash }}
      />

      {/* Dimension arc — quarter swing from 0° to ~75°, tick + label. */}
      <motion.path
        d="M50 26 A22 22 0 0 1 71.25 42.3"
        fill="none"
        stroke={HAIR}
        strokeWidth="0.35"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: arcDash }}
      />
      <motion.g style={{ opacity: arcDetail }}>
        <line
          x1={71.25}
          y1={42.3}
          x2={73.9}
          y2={41.2}
          stroke="rgba(245,247,242,0.05)"
          strokeWidth="0.35"
        />
        <text
          x={50}
          y={24}
          textAnchor="middle"
          fill={LABEL}
          fontSize="2.8"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          0°
        </text>
      </motion.g>

      {/* Signal path — a pulse travels node 1 → node 4, then the dashed
          construction settles over it. */}
      <g>
        <motion.path
          d="M24 64 L40 54 L60 60 L72 46"
          fill="none"
          stroke={WIRE}
          strokeWidth="0.3"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: signalDash }}
        />
        <motion.path
          d="M24 64 L40 54 L60 60 L72 46"
          fill="none"
          stroke={WIRE}
          strokeWidth="0.3"
          strokeDasharray="0.04 0.06"
          style={{ opacity: signalOpacity }}
        />
        {NODES.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={2}
            fill="rgba(245,247,242,0.5)"
            style={{ opacity: nodeOpacity[i] }}
          />
        ))}
        {/* Routing packet — the live signal, brighter than the construction. */}
        <motion.circle
          r={1.5}
          fill="rgba(245,247,242,0.6)"
          style={{ cx: packetX, cy: packetY }}
        />
      </g>

      {/* Second route line — deeper, slower, drawn in over the back quarter.
          A separate construction, almost a trace. */}
      <motion.path
        d="M16 72 L34 66 L52 70 L80 62"
        fill="none"
        stroke={FAINT}
        strokeWidth="0.2"
        pathLength={1}
        strokeDasharray="1"
        style={{ strokeDashoffset: routeDash }}
      />

      {/* Sparse construction lines — 5° and −12° reference hairlines. */}
      <g stroke={FAINT} strokeWidth="0.2">
        <line x1={0} y1={30} x2={100} y2={38} />
        <line x1={0} y1={38} x2={100} y2={46} />
        <line x1={0} y1={64} x2={58} y2={52} />
      </g>

      {/* Tiny coordinate annotations — the mechanism labels itself. */}
      <motion.g style={{ opacity: graticuleOpacity }}>
        <text
          x={30}
          y={74}
          textAnchor="middle"
          fill={LABEL}
          fontSize="1.9"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          Y70.000
        </text>
        <text
          x={63}
          y={45}
          textAnchor="middle"
          fill={LABEL}
          fontSize="1.9"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          R22.000
        </text>
        <text
          x={46}
          y={75}
          textAnchor="middle"
          fill={LABEL}
          fontSize="1.9"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          RTE-02
        </text>
      </motion.g>
    </svg>
  )
}
