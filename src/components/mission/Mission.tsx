import { mission } from '@/data/mission'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import type { MissionStatus } from '@/types'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

/** Presentation map for mission statuses — a quiet dot + mono label. */
const STATUS: Record<MissionStatus, { label: string; dot: string }> = {
  active: { label: 'Active', dot: 'bg-ok' },
  learning: { label: 'Learning', dot: 'bg-warn' },
  building: { label: 'Building', dot: 'bg-accent' },
}

export function Mission() {
  const { mode } = useUI()
  return (
    <section id="mission" className="scene">
      <div className="container-site">
        <SectionHeading
          numeral="04"
          eyebrow={t(mode, 'mission.eyebrow')}
          titleLines={[t(mode, 'mission.title'), t(mode, 'mission.subtitle')]}
          description={t(mode, 'mission.description')}
          amplifyMark
        />

        <ol className="rule-list">
          {mission.items.map((item, i) => {
            const status = STATUS[item.status]
            return (
              <li key={item.title}>
                <Reveal direction="left">
                  <div className="rule-row grid-cols-[auto_1fr_auto]">
                    <span className="font-mono text-[11px] text-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-lg font-semibold tracking-[-0.02em] text-ink md:text-2xl">
                        {item.title}
                        <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} aria-hidden />
                      </h3>
                      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                        {item.detail}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                      {status.label}
                    </span>
                  </div>
                </Reveal>
              </li>
            )
          })}
        </ol>

        {/* Pull-quote — the mission's honesty, set large. */}
        <Reveal className="mt-20 md:mt-28">
          <figure className="border-t border-edge pt-10 md:pt-14">
            <div className="flex items-center gap-4">
              <span className="inline-block h-12 w-px bg-edge" aria-hidden />
              <span className="eyebrow">{t(mode, 'mission.honest')}</span>
            </div>
            <blockquote className="mt-8 max-w-4xl font-display text-2xl font-semibold leading-snug tracking-[-0.02em] text-ink md:text-4xl">
              {t(mode, 'mission.quoteText')}{' '}
              <span className="inline-block bg-accent px-1.5 py-0.5 text-ink">{t(mode, 'mission.quoteEmphasis')}</span>
            </blockquote>
          </figure>
        </Reveal>
      </div>
    </section>
  )
}
