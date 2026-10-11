import { useMemo, useState } from 'react'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { Icon, type IconName } from '@/components/ui/Icon'
import { skills } from '@/data/skills'
import { seededRandom } from '@/lib/utils'

const ICONS: Record<string, IconName> = {
  brain: 'brain',
  cpu: 'cpu',
  sparkles: 'sparkles',
  code: 'code',
  database: 'database',
  bot: 'bot',
}

/**
 * One material, one metal — a monochrome grey ramp across categories. The
 * constellation reads as a single engineered system, not a rainbow. Green is
 * reserved for the active/hovered node only (functional, never ambient).
 */
const CATEGORY_COLORS = ['#717171', '#7d7d7d', '#898989', '#949494', '#9e9e9e', '#a8a8a8']
const ACCENT = 'var(--accent)'

const VB_W = 900
const VB_H = 620
const CX = VB_W / 2
const CY = VB_H / 2

interface Node {
  id: string
  name: string
  level: number
  blurb: string
  category: string
  x: number
  y: number
  r: number
  color: string
  hub: number
}

function levelLabel(level: number): string {
  if (level >= 85) return 'Advanced'
  if (level >= 62) return 'Building'
  return 'Foundations'
}

/**
 * Interactive "neural constellation" of skills.
 * Hover a node → neighbors + links light up. Click → detail in the side
 * panel. The side panel works as a two-way legend (hover/click both ways).
 */
export function SkillConstellation() {
  const { mode } = useUI()
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<Node | null>(null)

  const { hubs, nodes } = useMemo(() => {
    const n = skills.length
    const rand = seededRandom(42)

    const hubList = skills.map((cat, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2
      return {
        name: cat.name,
        angle,
        x: CX + Math.cos(angle) * 148,
        y: CY + Math.sin(angle) * 148,
        color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
        icon: cat.icon,
        blurb: cat.blurb,
        index: i,
      }
    })

    const nodeList: Node[] = []
    skills.forEach((cat, i) => {
      const hub = hubList[i]
      const k = cat.skills.length
      cat.skills.forEach((skill, j) => {
        const frac = (j - (k - 1) / 2) / Math.max(k, 1)
        const wedge = (Math.PI * 2) / n
        const angle = hub.angle + frac * wedge * 0.4 + (rand() - 0.5) * wedge * 0.12
        const radius = 210 + (j % 3) * 26 + rand() * 16
        nodeList.push({
          id: `${cat.name}:${skill.name}`,
          name: skill.name,
          level: skill.level,
          blurb: skill.blurb ?? `${skill.name} · ${cat.name}`,
          category: cat.name,
          x: CX + Math.cos(angle) * radius,
          y: CY + Math.sin(angle) * radius,
          r: 3 + (skill.level / 100) * 5,
          color: hub.color,
          hub: i,
        })
      })
    })

    return { hubs: hubList, nodes: nodeList }
  }, [])

  // `hovered` is either a node id ("Machine Learning:scikit-learn") or a
  // category prefix ("Machine Learning:") set by the legend.
  const isCategoryHover = hovered !== null && hovered.endsWith(':')
  const dim = (id: string) => {
    if (hovered === null) return false
    if (isCategoryHover) return !id.startsWith(hovered)
    return hovered !== id
  }

  const detail = selected ?? (hovered ? (nodes.find((nd) => nd.id === hovered) ?? null) : null)

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
      {/* Constellation */}
      <div className="panel relative overflow-hidden">
        {/* Instrument header — a diagnostics strip, not decoration. The lime
            dot is a live indicator: functional, not ambient. */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-edge px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-faint">
          <span className="flex items-center gap-2 text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {t(mode, 'skills.instrument')}
          </span>
          <span>{t(mode, 'skills.categories')}&nbsp;{String(skills.length).padStart(2, '0')}</span>
          <span>{t(mode, 'skills.nodes')}&nbsp;{String(nodes.length).padStart(2, '0')}</span>
          <span className="hidden md:inline">
            Links&nbsp;{String(nodes.length + skills.length).padStart(2, '0')}
          </span>
          <span className="ml-auto hidden sm:inline">{t(mode, 'skills.stable')}</span>
        </div>

        <div className="relative p-4">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="h-auto w-full select-none"
          role="img"
          aria-label="Interactive constellation of skills"
          onMouseLeave={() => setHovered(null)}
        >
          {/* faint link mesh from center */}
          {hubs.map((h, i) => (
            <line
              key={`c-${i}`}
              x1={CX}
              y1={CY}
              x2={h.x}
              y2={h.y}
              stroke={h.color}
              strokeWidth="1"
              opacity={0.18}
            />
          ))}
          {nodes.map((nd) => {
            const hub = hubs[nd.hub]
            return (
              <line
                key={`l-${nd.id}`}
                x1={hub.x}
                y1={hub.y}
                x2={nd.x}
                y2={nd.y}
                stroke={nd.color}
                strokeWidth="1"
                opacity={dim(nd.id) ? 0.05 : hovered === nd.id ? 0.6 : 0.2}
                style={{ transition: 'opacity 0.25s' }}
              />
            )
          })}

          {/* category hubs */}
          {hubs.map((h) => {
            const active = hovered !== null && hovered.startsWith(h.name + ':')
            return (
            <g
              key={h.name}
              opacity={active ? 1 : dim(h.name) ? 0.35 : 0.9}
            >
              <circle cx={h.x} cy={h.y} r={11} fill={active ? ACCENT : h.color} opacity={0.15} />
              <circle cx={h.x} cy={h.y} r={5.5} fill={active ? ACCENT : h.color} />
              <text
                x={h.x}
                y={h.y - 20}
                textAnchor="middle"
                className="fill-muted font-mono text-[11px] tracking-wide"
              >
                {h.name.toUpperCase()}
              </text>
            </g>
            )
          })}

          {/* skill nodes */}
          {nodes.map((nd) => (
            <circle
              key={nd.id}
              cx={nd.x}
              cy={nd.y}
              r={hovered === nd.id || selected?.id === nd.id ? nd.r + 2.5 : nd.r}
              fill={hovered === nd.id || selected?.id === nd.id ? ACCENT : nd.color}
              opacity={dim(nd.id) ? 0.08 : hovered === nd.id || selected?.id === nd.id ? 1 : 0.55}
              style={{ transition: 'opacity 0.25s, r 0.25s' }}
              onMouseEnter={() => setHovered(nd.id)}
              onClick={() => setSelected(nd.id === selected?.id ? null : nd)}
              role="button"
              tabIndex={0}
              aria-label={`${nd.name}, ${levelLabel(nd.level)} in ${nd.category}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ')
                  setSelected(nd.id === selected?.id ? null : nd)
              }}
              className="cursor-pointer"
            >
              <title>{nd.name}</title>
            </circle>
          ))}
        </svg>

        {/* floating tooltip */}
        {detail && (
          <div
            className="pointer-events-none absolute z-10 max-w-[220px] -translate-x-1/2 -translate-y-[120%] rounded-xl border border-edge bg-raised/95 p-3 shadow-lift backdrop-blur"
            style={{
              left: `${(detail.x / VB_W) * 100}%`,
              top: `${(detail.y / VB_H) * 100}%`,
            }}
          >
            <p className="font-display text-sm font-semibold text-ink">{detail.name}</p>
            <p
              className="mt-0.5 font-mono text-[10px] uppercase tracking-wider"
              style={{ color: detail.color }}
            >
              {detail.category} · {levelLabel(detail.level)}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{detail.blurb}</p>
          </div>
        )}
        </div>
      </div>

      {/* Two-way legend / detail panel */}
      <div className="space-y-5">
        <div className="panel p-5">
          <p className="eyebrow mb-4">Subsystems</p>
          <ul className="max-h-[420px] space-y-1 overflow-y-auto pr-1">
            {skills.map((cat, i) => {
              const iconName = ICONS[cat.icon] ?? 'brain'
              return (
                <li key={cat.name}>
                  <button
                    type="button"
                    className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-raised"
                    onMouseEnter={() => setHovered(`${cat.name}:`)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => {
                      const first = nodes.find((nd) => nd.category === cat.name)
                      if (first) setSelected(first)
                    }}
                  >
                    <Icon
                      name={iconName}
                      size={16}
                      className="shrink-0"
                      style={{ color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                    />
                    <span className="text-sm text-muted transition-colors group-hover:text-ink">
                      {cat.name}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-faint">
                      {cat.skills.length}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="panel min-h-[130px] p-5">
          <p className="eyebrow mb-3">Readout</p>
          {detail ? (
            <>
              <p className="font-display text-lg font-semibold text-ink">{detail.name}</p>
              <p
                className="mt-1 font-mono text-[11px] uppercase tracking-wider"
                style={{ color: detail.color }}
              >
                {detail.category} · {levelLabel(detail.level)}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{detail.blurb}</p>
              <p className="mt-3 font-mono text-[11px] text-faint">
                signal: {detail.level}/100
              </p>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-faint">
              Inspect the system: hover or click a node, or select a subsystem on the left. Every
              skill reads back to the same
              <span className="font-mono"> src/data/skills.ts</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
