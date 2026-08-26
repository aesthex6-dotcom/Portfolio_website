/**
 * Layered layout for architecture diagrams.
 *
 * Nodes are ranked by longest path from the source nodes (Kahn's algorithm,
 * cycle-guarded) and arranged top-to-bottom in rows, left-to-right in
 * insertion order within a row. Edges run strictly downward as cubic béziers
 * from a node's bottom-center to its child's top-center.
 *
 * This naturally renders the classic `User → Frontend → Backend → Database`
 * spine AND small DAGs like this site's `twin → [knowledge, llm]` fan-out.
 * Keep the graph acyclic — a cycle collapses the layered layout into a row.
 */
import type { ArchitectureSpec } from '@/types'
import { clamp } from '@/lib/utils'

const NODE_H = 58
const ROW_PITCH = 132
const NODE_PITCH = 40
const PADDING = 40

/** Cubic bézier control points for one edge. */
export interface Bezier {
  x0: number
  y0: number
  x1: number
  y1: number
  x2: number
  y2: number
  x3: number
  y3: number
}

export interface LayoutNode {
  id: string
  label: string
  subtitle?: string
  tone?: 'accent' | 'accent2'
  x: number
  y: number
  w: number
  h: number
  rank: number
}

export interface LayoutEdge {
  id: string
  from: string
  to: string
  label?: string
  d: string
  labelX: number
  labelY: number
  bezier: Bezier
}

export interface LayoutResult {
  nodes: LayoutNode[]
  edges: LayoutEdge[]
  width: number
  height: number
}

function nodeWidth(n: ArchitectureSpec['nodes'][number]): number {
  const longest = Math.max(n.label.length, (n.subtitle ?? '').length)
  return clamp(120 + longest * 7.2, 150, 260)
}

export function computeLayout(spec: ArchitectureSpec): LayoutResult {
  const ids = new Set(spec.nodes.map((n) => n.id))
  const out = new Map<string, string[]>()
  const indeg = new Map<string, number>()
  for (const n of spec.nodes) {
    out.set(n.id, [])
    indeg.set(n.id, 0)
  }
  const edges = spec.edges.filter((e) => ids.has(e.from) && ids.has(e.to))
  for (const e of edges) {
    out.get(e.from)!.push(e.to)
    indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1)
  }

  // ── Ranks: longest path from sources, cycle-guarded ──────────────────
  const rank = new Map<string, number>()
  const indeg2 = new Map(indeg)
  const queue = spec.nodes.filter((n) => (indeg.get(n.id) ?? 0) === 0).map((n) => n.id)
  let head = 0
  while (head < queue.length) {
    const u = queue[head++]
    for (const v of out.get(u) ?? []) {
      rank.set(v, Math.max(rank.get(v) ?? 0, (rank.get(u) ?? 0) + 1))
      indeg2.set(v, (indeg2.get(v) ?? 0) - 1)
      if (indeg2.get(v) === 0) queue.push(v)
    }
  }
  // Leftovers are cycle members — bump them past the deepest acyclic row.
  const maxRank = queue.reduce((m, u) => Math.max(m, rank.get(u) ?? 0), 0)
  let cycleNodes = 0
  for (const n of spec.nodes) {
    if (indeg2.get(n.id) !== 0) {
      rank.set(n.id, maxRank + 1)
      cycleNodes++
    }
  }
  if (cycleNodes > 0 && import.meta.env.DEV) {
    console.warn(`[architecture] cycle detected: ${cycleNodes} node(s) forced to the last row`)
  }

  // ── Group by rank, preserving spec insertion order within a row ──────
  const rows = new Map<number, string[]>()
  for (const n of spec.nodes) {
    const r = rank.get(n.id) ?? 0
    const list = rows.get(r) ?? []
    list.push(n.id)
    rows.set(r, list)
  }
  const rankKeys = [...rows.keys()].sort((a, b) => a - b)

  // ── Node boxes + row layout ──────────────────────────────────────────
  const widths = new Map(spec.nodes.map((n) => [n.id, nodeWidth(n)]))
  let canvasW = 0
  for (const list of rows.values()) {
    const rowW = list.reduce((s, id) => s + widths.get(id)!, 0) + NODE_PITCH * (list.length - 1)
    canvasW = Math.max(canvasW, rowW)
  }
  canvasW = Math.max(canvasW, 320)

  const positions = new Map<string, { x: number; y: number }>()
  for (const [r, list] of rows) {
    const rowW = list.reduce((s, id) => s + widths.get(id)!, 0) + NODE_PITCH * (list.length - 1)
    let x = (canvasW - rowW) / 2
    const y = PADDING + r * ROW_PITCH
    for (const id of list) {
      positions.set(id, { x, y })
      x += widths.get(id)! + NODE_PITCH
    }
  }

  const nodes: LayoutNode[] = spec.nodes.map((n) => {
    const p = positions.get(n.id)!
    return {
      id: n.id,
      label: n.label,
      subtitle: n.subtitle,
      tone: n.tone,
      x: p.x,
      y: p.y,
      w: widths.get(n.id)!,
      h: NODE_H,
      rank: rank.get(n.id) ?? 0,
    }
  })
  const byId = new Map(nodes.map((n) => [n.id, n]))

  // ── Edges as downward cubic béziers ──────────────────────────────────
  const layoutEdges: LayoutEdge[] = edges.map((e) => {
    const s = byId.get(e.from)!
    const t = byId.get(e.to)!
    const sx = s.x + s.w / 2
    const sy = s.y + s.h
    const ex = t.x + t.w / 2
    const ey = t.y
    const m = Math.max(24, (ey - sy) / 2)
    const bezier: Bezier = { x0: sx, y0: sy, x1: sx, y1: sy + m, x2: ex, y2: ey - m, x3: ex, y3: ey }
    const d = `M ${sx} ${sy} C ${sx} ${sy + m}, ${ex} ${ey - m}, ${ex} ${ey}`
    // Label anchored at the bézier midpoint (t = 0.5).
    const labelX = (bezier.x0 + 3 * bezier.x1 + 3 * bezier.x2 + bezier.x3) / 8
    const labelY = (bezier.y0 + 3 * bezier.y1 + 3 * bezier.y2 + bezier.y3) / 8
    return {
      id: `${e.from}→${e.to}`,
      from: e.from,
      to: e.to,
      label: e.label,
      d,
      labelX,
      labelY,
      bezier,
    }
  })

  return {
    nodes,
    edges: layoutEdges,
    width: canvasW + PADDING * 2,
    height: PADDING * 2 + (rankKeys.length - 1) * ROW_PITCH + NODE_H,
  }
}

/**
 * Sample a cubic bézier into `steps + 1` frames with arc-length
 * re-parameterization, so a traveling packet moves at constant visual speed
 * (uniform `t` would look fast in the middle, slow at the ends).
 */
export function sampleBezier(
  b: Bezier,
  steps = 28,
): { xs: number[]; ys: number[]; times: number[] } {
  const xs: number[] = []
  const ys: number[] = []
  const lens: number[] = [0]
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const mt = 1 - t
    const x = mt * mt * mt * b.x0 + 3 * mt * mt * t * b.x1 + 3 * mt * t * t * b.x2 + t * t * t * b.x3
    const y = mt * mt * mt * b.y0 + 3 * mt * mt * t * b.y1 + 3 * mt * t * t * b.y2 + t * t * t * b.y3
    xs.push(x)
    ys.push(y)
    if (i > 0) lens.push(lens[i - 1] + Math.hypot(x - xs[i - 1], y - ys[i - 1]))
  }
  const total = lens[steps]
  const times: number[] = new Array(steps + 1)
  for (let i = 0; i <= steps; i++) {
    const target = total * (i / steps)
    let j = 0
    while (j < steps && lens[j + 1] < target) j++
    const seg = lens[j + 1] - lens[j] || 1
    times[i] = (j + (target - lens[j]) / seg) / steps
  }
  return { xs, ys, times }
}
