import { useMemo, useState } from 'react'
import { MotionConfig } from 'framer-motion'
import type { ArchitectureSpec } from '@/types'
import { computeLayout } from '@/lib/architecture/layout'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { ArchitectureGraph } from './ArchitectureGraph'
import { ArchitectureTimeline } from './ArchitectureTimeline'

/**
 * Interactive Architecture Explorer for one project.
 *
 * Data-driven: everything comes from the project's `architecture.json`. On
 * desktop it renders the pan/zoom SVG graph; below 768px the same layout
 * becomes a vertical timeline. Clicking a node opens the design-doc card.
 */
export function ArchitectureExplorer({ spec }: { spec: ArchitectureSpec }) {
  const layout = useMemo(() => computeLayout(spec), [spec])
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <MotionConfig reducedMotion="user">
      <div>
        <div className="mb-5">
          <p className="eyebrow mb-1.5">Architecture</p>
          <h4 className="font-display text-lg font-semibold tracking-tight text-ink">
            {spec.title}
          </h4>
          {spec.intro && (
            <p className="mt-2 text-[13px] leading-relaxed text-muted">{spec.intro}</p>
          )}
        </div>

        {isDesktop ? (
          <ArchitectureGraph
            spec={spec}
            layout={layout}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={setSelectedId}
            onHover={setHoveredId}
          />
        ) : (
          <ArchitectureTimeline
            spec={spec}
            layout={layout}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        )}
      </div>
    </MotionConfig>
  )
}
