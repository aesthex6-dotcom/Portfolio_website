import { profile } from '@/data/profile'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { Icon } from '@/components/ui/Icon'

/** Compact About snapshot — the essentials, no journey timeline. */
export function RecruiterAbout() {
  const { mode } = useUI()
  return (
    <section id="about" className="relative scroll-mt-20 py-16 md:py-20">
      <div className="container-site">
        <SectionHeading
          eyebrow={t(mode, 'recruiter.aboutTitle')}
          title={t(mode, 'recruiter.aboutTitle')}
        />

        <div className="grid gap-5 md:grid-cols-3">
          <Reveal className="h-full">
            <div className="panel flex h-full flex-col p-6">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-edge text-muted">
                <Icon name="user" size={18} />
              </span>
              <h3 className="mt-4 font-display text-[15px] font-semibold text-ink">{t(mode, 'recruiter.aboutLabel')}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{profile.intro[0]}</p>
              <p className="mt-3 flex items-center gap-1.5 text-sm text-faint">
                <Icon name="location" size={14} />
                {profile.location}
              </p>
            </div>
          </Reveal>

          <Reveal className="h-full">
            <div className="panel flex h-full flex-col p-6">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-edge text-muted">
                <Icon name="graduation-cap" size={18} />
              </span>
              <h3 className="mt-4 font-display text-[15px] font-semibold text-ink">{t(mode, 'recruiter.educationLabel')}</h3>
              <p className="mt-2 text-sm font-medium text-ink">{profile.education.degree}</p>
              <p className="mt-1 text-sm text-muted">{profile.education.school}</p>
              <p className="mt-1 font-mono text-[12px] text-faint">{profile.education.period}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{profile.education.detail}</p>
            </div>
          </Reveal>

          <Reveal className="h-full">
            <div className="panel flex h-full flex-col p-6">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-edge text-muted">
                <Icon name="target" size={18} />
              </span>
              <h3 className="mt-4 font-display text-[15px] font-semibold text-ink">{t(mode, 'recruiter.goalsLabel')}</h3>
              <ul className="mt-3 space-y-3">
                {profile.goals.map((g) => (
                  <li key={g} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
