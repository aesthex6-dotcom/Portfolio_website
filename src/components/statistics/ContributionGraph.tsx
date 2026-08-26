const WEEKS = 52
const DAYS = 7

/**
 * GitHub-style contribution heatmap.
 *
 * Renders *only* real data: pass a flat array of length 52 × 7 (week-major).
 * When no real values are supplied it renders nothing — no demo data is ever
 * shown, so the site never fabricates contribution activity.
 */
export function ContributionGraph({ values }: { values?: number[] }) {
  const hasReal = Boolean(values && values.length === WEEKS * DAYS)
  if (!hasReal) return null

  const grid = values as number[]
  const today = new Date()
  const todayIdx = (today.getDay() + 6) % 7 // Monday-first

  const levelColor = (lvl: number) => {
    if (lvl <= 0) return 'rgba(255,255,255,0.05)'
    const alpha = [0.18, 0.38, 0.62, 0.9][lvl - 1]
    return `color-mix(in srgb, var(--accent) ${alpha * 100}%, var(--bg))`
  }

  const dayLabel = ['M', '', 'W', '', 'F', '', '']

  const monthLabels: { at: number; label: string }[] = []
  const d = new Date()
  d.setDate(d.getDate() - (todayIdx + 1))
  for (let w = WEEKS - 1; w >= 0; w--) {
    const m = d.toLocaleString('en-US', { month: 'short' })
    if (!monthLabels.find((l) => l.label === m)) monthLabels.unshift({ at: w, label: m })
    d.setDate(d.getDate() - 7)
  }

  const cell = 11
  const gap = 3

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="eyebrow">Contribution activity</p>
        <div className="flex items-center gap-1.5 text-[10px] text-faint">
          <span>less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span
              key={l}
              className="h-2.5 w-2.5 rounded-[3px]"
              style={{ background: levelColor(l) }}
            />
          ))}
          <span>more</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-2 no-scrollbar">
        <div className="inline-flex">
          {/* day labels */}
          <div className="mr-2 flex flex-col" style={{ gap }}>
            {dayLabel.map((l, i) => (
              <span key={i} className="h-[11px] text-[9px] leading-[11px] text-faint">
                {l}
              </span>
            ))}
          </div>

          <div className="relative">
            {/* month labels */}
            <div className="relative mb-1.5 h-4">
              {monthLabels.map((m) => (
                <span
                  key={m.at}
                  className="absolute text-[9px] text-faint"
                  style={{ left: m.at * (cell + gap) }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div
              className="grid grid-flow-col"
              style={{ gridTemplateRows: `repeat(${DAYS}, ${cell}px)`, gap: `${gap}px` }}
            >
              {grid.map((lvl, i) => (
                <div
                  key={i}
                  className="rounded-[3px]"
                  style={{ width: cell, height: cell, background: levelColor(lvl) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
