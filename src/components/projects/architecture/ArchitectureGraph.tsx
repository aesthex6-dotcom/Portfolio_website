import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ArchitectureSpec } from '@/types'
import { Icon } from '@/components/ui/Icon'
import {
  sampleBezier,
  type LayoutEdge,
  type LayoutResult,
  type LayoutNode,
} from '@/lib/architecture/layout'
import { usePanZoom } from '@/hooks/usePanZoom'
import { clamp, cn } from '@/lib/utils'
import { ArchitectureDetailCard } from './ArchitectureDetailCard'

interface ArchitectureGraphProps {
  spec: ArchitectureSpec
  layout: LayoutResult
  selectedId: string | null
  hoveredId: string | null
  onSelect: (id: string | null) => void
  onHover: (id: string | null) => void
}

/** A single traveling "packet" along an edge — framer keyframes, no SMIL. */
function EdgePacket({ edge }: { edge: LayoutEdge }) {
  const sample = useMemo(() => sampleBezier(edge.bezier), [edge])
  return (
    <motion.circle
      r={2.5}
      fill="var(--accent)"
      initial={{ cx: sample.xs[0], cy: sample.ys[0] }}
      animate={{ cx: sample.xs, cy: sample.ys }}
      transition={{
        duration: 2.6,
        times: sample.times,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  )
}

function ZoomButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-8 w-8 place-items-center text-muted transition-colors hover:bg-raised hover:text-ink"
    >
      {children}
    </button>
  )
}

export function ArchitectureGraph({
  spec,
  layout,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: ArchitectureGraphProps) {
  const { view, svgRef, onPointerDown, onPointerMove, onPointerUp, onPointerCancel, zoomIn, zoomOut, reset, didDrag } =
    usePanZoom({ width: layout.width, height: layout.height })

  const specNodeById = useMemo(() => new Map(spec.nodes.map((n) => [n.id, n])), [spec])
  const hovered: LayoutNode | undefined = hoveredId
    ? layout.nodes.find((n) => n.id === hoveredId)
    : undefined
  const selected = selectedId ? specNodeById.get(selectedId) ?? null : null

  const isActive = (id: string) => hoveredId === id || selectedId === id

  // Hover tooltip tracks the node through pan/zoom, in container screen-space.
  const tooltipPos = hovered
    ? {
        left: clamp(
          (((hovered.x + hovered.w / 2) * view.k + view.x) / layout.width) * 100,
          14,
          86,
        ),
        top: (((hovered.y + hovered.h / 2) * view.k + view.y) / layout.height) * 100,
      }
    : null
  const flipTooltip = tooltipPos !== null && tooltipPos.top > 55

  return (
    <div className="relative overflow-hidden rounded-xl border border-edge bg-ground">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="h-auto w-full touch-none select-none bg-grid-faint"
        role="img"
        aria-label="Interactive architecture diagram"
        data-testid="arch-graph"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onMouseLeave={() => onHover(null)}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {/* edges */}
          {layout.edges.map((edge) => {
            const active = isActive(edge.from) || isActive(edge.to)
            return (
              <g key={edge.id}>
                <path
                  d={edge.d}
                  className="fill-none"
                  style={{
                    stroke: 'var(--line-strong)',
                    strokeWidth: 1.2,
                    opacity: active ? 0.9 : 0.5,
                    transition: 'opacity 0.25s',
                  }}
                />
                <path
                  d={edge.d}
                  className="fill-none animate-flow"
                  style={{
                    stroke: 'var(--accent)',
                    strokeWidth: 1.1,
                    strokeDasharray: '10 6',
                    opacity: active ? 0.55 : 0.3,
                    transition: 'opacity 0.25s',
                  }}
                />
                {active && <EdgePacket edge={edge} />}
                {edge.label && (
                  <text
                    x={edge.labelX}
                    y={edge.labelY}
                    textAnchor="middle"
                    fontSize={9}
                    className="font-mono"
                    style={{
                      fill: 'var(--muted)',
                      paintOrder: 'stroke',
                      stroke: 'var(--bg)',
                      strokeWidth: 3,
                      opacity: active ? 1 : 0.75,
                    }}
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}

          {/* nodes */}
          {layout.nodes.map((n) => {
            const active = isActive(n.id)
            const tone = n.tone === 'accent2' ? 'var(--accent-2)' : 'var(--accent)'
            return (
              <motion.g
                key={n.id}
                style={{ x: n.x }}
                initial={{ opacity: 0, y: n.y + 14 }}
                animate={{ opacity: 1, y: n.y }}
                transition={{ delay: 0.15 + n.rank * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                role="button"
                tabIndex={0}
                aria-label={`${n.label}${n.subtitle ? ` · ${n.subtitle}` : ''}. Click for details.`}
                className="cursor-pointer outline-none"
                onMouseEnter={() => onHover(n.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(n.id)}
                onBlur={() => onHover(null)}
                onClick={() => {
                  if (!didDrag()) onSelect(n.id === selectedId ? null : n.id)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(n.id === selectedId ? null : n.id)
                  }
                }}
              >
                <g
                  style={{
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                    transition: 'transform 0.25s ease, filter 0.25s ease',
                    filter: active ? `drop-shadow(0 0 10px ${tone}55)` : undefined,
                  }}
                >
                  <rect
                    x={0}
                    y={0}
                    width={n.w}
                    height={n.h}
                    rx={12}
                    className="fill-surface"
                    style={{
                      stroke: active ? tone : 'var(--line)',
                      strokeWidth: active ? 1.5 : 1,
                      transition: 'stroke 0.25s',
                    }}
                  />
                  <rect x={0} y={12} width={3} height={n.h - 24} rx={1.5} fill={tone} />
                  <text
                    x={16}
                    y={26}
                    fontSize={13}
                    fontWeight={600}
                    className="font-display"
                    fill="var(--text)"
                  >
                    {n.label}
                  </text>
                  {n.subtitle && (
                    <text x={16} y={42} fontSize={9.5} className="font-mono" fill="var(--faint)">
                      {n.subtitle}
                    </text>
                  )}
                </g>
              </motion.g>
            )
          })}
        </g>
      </svg>

      {/* zoom controls */}
      <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-edge bg-raised/90 backdrop-blur">
        <ZoomButton onClick={zoomIn} label="Zoom in">
          <Icon name="plus" size={14} />
        </ZoomButton>
        <ZoomButton onClick={zoomOut} label="Zoom out">
          <Icon name="minus" size={14} />
        </ZoomButton>
        <ZoomButton onClick={reset} label="Reset view">
          <Icon name="maximize" size={14} />
        </ZoomButton>
      </div>

      {/* hint */}
      <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] text-faint">
        scroll to zoom · drag to pan · click a node
      </p>

      {/* hover tooltip */}
      {hovered && tooltipPos && (
        <div
          className={cn(
            'pointer-events-none absolute z-10 w-max max-w-[240px] -translate-x-1/2 rounded-lg border border-edge bg-raised/95 p-2.5 shadow-lift backdrop-blur',
            flipTooltip ? 'translate-y-[6px]' : '-translate-y-[115%]',
          )}
          data-testid="arch-tooltip"
          style={{ left: `${tooltipPos.left}%`, top: `${tooltipPos.top}%` }}
        >
          <p className="font-display text-xs font-semibold text-ink">{hovered.label}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
            {specNodeById.get(hovered.id)?.role}
          </p>
        </div>
      )}

      {/* floating detail card */}
      <AnimatePresence>
        {selected && (
          <ArchitectureDetailCard
            key={selected.id}
            node={selected}
            onClose={() => onSelect(null)}
            className="absolute inset-x-3 bottom-3 z-20"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
