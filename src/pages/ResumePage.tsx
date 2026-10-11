import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import { profile } from '@/data/profile'
import { Icon } from '@/components/ui/Icon'
import { skills } from '@/data/skills'
import { experience } from '@/data/experience'
import { projects } from '@/data/projects'
import { certifications } from '@/data/certifications'
import { publicAchievements } from '@/data/achievements'
import { usePageMeta } from '@/hooks/usePageMeta'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'

/**
 * Resume page — generated entirely from `src/data/*`, so you edit one
 * source and both the site and the PDF stay in sync.
 * "Download PDF" triggers the browser's print → Save as PDF flow.
 */
export function ResumePage() {
  const { mode } = useUI()
  usePageMeta(`${profile.name} · Resume`, `Resume for ${profile.name}, ${profile.roles[0]}.`)

  return (
    <div
      className="print-page relative pb-24 pt-28 md:pt-32"
      style={
        {
          background: 'var(--bg-soft)',
          '--text': '#0f172a',
          '--text-rgb': '15 23 42',
          '--muted': '#475569',
          '--muted-rgb': '71 85 105',
          /* Faint tuned for the light paper: #94a3b8 read at 2.56:1 — strained.
             #64748b holds 4.76:1 on white, so the 11px mono metadata stays legible. */
          '--faint': '#64748b',
          '--faint-rgb': '100 116 139',
          '--bg': '#ffffff',
          '--bg-rgb': '255 255 255',
          '--bg-soft': '#eef0f5',
          '--bg-soft-rgb': '238 240 245',
          '--surface': '#ffffff',
          '--surface-rgb': '255 255 255',
          '--raised': '#f8fafc',
          '--raised-rgb': '248 250 252',
          '--line': 'rgba(15,23,42,0.12)',
          '--line-strong': 'rgba(15,23,42,0.22)',
          /* Light-theme green relatives: dark enough to clear 4.5:1 on white. */
          '--accent': '#5f7a1f',
          '--accent-rgb': '95 122 31',
          '--ok': '#4a7c3f',
          '--ok-rgb': '74 124 63',
        } as CSSProperties
      }
    >
      {/* Toolbar */}
      <div className="no-print container-site mb-6 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <Icon name="arrow-left" size={15} />
          {t(mode, 'resume.backToPortfolio')}
        </Link>
        <div className="flex items-center gap-2">
          {profile.socials.github && (
            <a
              href={profile.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !px-4 !py-2 !text-[13px]"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {profile.socials.linkedin && (
            <a
              href={profile.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost !px-4 !py-2 !text-[13px]"
              aria-label="LinkedIn"
            >
              <Icon name="linkedin" size={15} />
            </a>
          )}
          {profile.socials.email && (
            <a
              href={profile.socials.email}
              className="btn-ghost !px-4 !py-2 !text-[13px]"
              aria-label="Email"
            >
              <Icon name="mail" size={15} />
            </a>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-primary !px-4 !py-2 !text-[13px]"
          >
            <Icon name="download" size={15} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Paper */}
      <div className="container-site max-w-3xl">
        <article className="print-page overflow-hidden rounded-2xl border border-edge bg-surface p-8 shadow-lift md:p-12">
          {/* Header */}
          <header className="border-b border-edge pb-8">
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
              {profile.name}
            </h1>
            <p className="mt-2 font-display text-lg font-medium text-accent">
              {profile.roles.join(' · ')}
            </p>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{profile.tagline}</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[12px] text-muted">
              {profile.email && <span>{profile.email}</span>}
              {profile.socials.github && <span>{profile.socials.github.replace('https://', '')}</span>}
              <span>{profile.location}</span>
              <span className="text-ok">{profile.availability}</span>
            </div>
          </header>

          {/* Summary */}
          <section className="pt-8">
            <h2 className="eyebrow mb-3">Summary</h2>
            <p className="text-sm leading-relaxed text-muted">{profile.intro[0]}</p>
          </section>

          {/* Experience */}
          <section className="pt-8">
            <h2 className="eyebrow mb-4">Experience</h2>
            {experience.length === 0 ? (
              <p className="text-sm text-muted">
                Looking for my first ML / AI internship. This section will fill with real roles as
                they happen.
              </p>
            ) : (
            <div className="space-y-6">
              {experience.map((e) => (
                <div key={e.role + e.company}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-[15px] font-semibold text-ink">
                      {e.role} · <span className="font-medium text-muted">{e.company}</span>
                    </h3>
                    <span className="font-mono text-[11px] text-faint">{e.period}</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-faint">
                    {e.type} · {e.location}
                  </p>
                  <p className="mt-1.5 text-sm text-muted">{e.summary}</p>
                  <ul className="mt-2 space-y-1">
                    {e.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                      >
                        <span className="mt-2 h-1 w-2 shrink-0 rounded-full bg-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            )}
          </section>

          {/* Projects */}
          <section className="pt-8">
            <h2 className="eyebrow mb-4">Selected Projects</h2>
            {projects.length === 0 ? (
              <p className="text-sm text-muted">
                No published projects yet. I&apos;m building my first one now. Real, shipped projects
                land here as they happen.
              </p>
            ) : (
            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.slug}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-display text-[15px] font-semibold text-ink">{p.title}</h3>
                    <span className="font-mono text-[11px] text-faint">{p.year}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{p.description}</p>
                  <p className="mt-1 font-mono text-[11px] text-faint">{p.tech.join(' · ')}</p>
                </div>
              ))}
            </div>
            )}
          </section>

          {/* Skills */}
          <section className="pt-8">
            <h2 className="eyebrow mb-4">Skills</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {skills.map((cat) => (
                <div key={cat.name}>
                  <h3 className="font-display text-[13px] font-semibold text-ink">{cat.name}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-muted">
                    {cat.skills.map((s) => s.name).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Education + certs + achievements */}
          <section className="pt-8">
            <h2 className="eyebrow mb-4">Education &amp; Credentials</h2>
            <div className="space-y-5">
              <div>
                <h3 className="font-display text-[15px] font-semibold text-ink">
                  {profile.education.degree}
                </h3>
                <p className="text-sm text-muted">
                  {profile.education.school} · {profile.education.period}
                </p>
              </div>
              {certifications.map((c) => (
                <div key={c.title}>
                  <h3 className="font-display text-[15px] font-semibold text-ink">{c.title}</h3>
                  <p className="text-sm text-muted">
                    {c.issuer} · {c.year}
                  </p>
                </div>
              ))}
              {publicAchievements.length > 0 && (
                <div>
                  <h3 className="eyebrow mb-2 !text-[10px]">Achievements</h3>
                  <ul className="space-y-1">
                    {publicAchievements.map((a) => (
                      <li key={a.id} className="flex items-start gap-2 text-sm text-muted">
                        <span className="mt-2 h-1 w-2 shrink-0 rounded-full bg-accent" />
                        {a.title} · {a.year}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <footer className="mt-10 border-t border-edge pt-5 text-center font-mono text-[11px] text-faint">
            {profile.name} · Resume
          </footer>
        </article>
      </div>
    </div>
  )
}
