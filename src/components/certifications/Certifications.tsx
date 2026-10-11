import { certifications } from '@/data/certifications'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'

export function Certifications() {
  const { mode } = useUI()
  return (
    <section id="certifications" className="scene">
      <div className="container-site">
        <SectionHeading
          numeral="05"
          eyebrow={t(mode, 'certifications.eyebrow')}
          titleLines={[t(mode, 'certifications.titleLines1'), t(mode, 'certifications.titleLines2')]}
          description={t(mode, 'certifications.description')}
          amplifyMark
        />

        {certifications.length > 0 ? (
          <ol className="rule-list">
            {certifications.map((c, i) => {
              const row = (
                <>
                  <span className="font-mono text-[11px] text-faint transition-colors duration-500 group-hover:text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <span className="block">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink transition-transform duration-500 ease-out group-hover:translate-x-1 md:text-2xl">
                        {c.title}
                      </h3>
                      <span className="text-sm text-muted">{c.issuer}</span>
                    </span>
                    <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
                      {c.description}
                    </span>
                  </span>

                  <span className="flex items-center gap-4">
                    <span className="hidden font-mono text-[11px] text-faint sm:block">{c.year}</span>
                    {c.credentialUrl && (
                      <Icon
                        name="arrow-up-right"
                        size={18}
                        className="text-faint transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      />
                    )}
                  </span>
                </>
              )

              const rowClass =
                'rule-row group w-full grid-cols-[auto_1fr_auto] text-left'

              return (
                <li key={c.title}>
                  <Reveal direction="left">
                    {c.credentialUrl ? (
                      <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className={rowClass}>
                        {row}
                      </a>
                    ) : (
                      <div className={rowClass}>{row}</div>
                    )}
                  </Reveal>
                </li>
              )
            })}
          </ol>
        ) : (
          <EmptyState
            icon={<Icon name="graduation-cap" size={20} />}
            title={t(mode, 'certifications.emptyTitle')}
            description={t(mode, 'certifications.emptyDesc')}
          />
        )}
      </div>
    </section>
  )
}
