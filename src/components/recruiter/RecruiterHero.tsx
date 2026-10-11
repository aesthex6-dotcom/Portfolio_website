import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import { profile } from '@/data/profile'
import { recruiter } from '@/data/recruiter'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { scrollToId } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { GlowOrbs } from '@/components/ui/GlowOrbs'

/** House ease — cinematic, settled. Content entrances never pop. */
const EASE = [0.16, 1, 0.3, 1] as const

export function RecruiterHero() {
  const { mode } = useUI()
  const { setChatOpen } = useUI()

  return (
    <section id="top" className="relative overflow-hidden pt-24 md:pt-28">
      {/* quiet backdrop — no particles, just faint grid + ambient glow */}
      <div
        className="absolute inset-0 bg-grid-faint bg-[size:44px_44px] opacity-25 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black,transparent)]"
        aria-hidden
      />
      <GlowOrbs />

      <div className="container-site relative z-10 pb-20 md:pb-28">
        {/* Identity header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface/60 px-3.5 py-1.5 text-[12px] font-medium text-muted">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-ok" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            {profile.availability}
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-tight tracking-tight text-ink">
            {profile.name}
          </h1>
          <p className="mt-2 font-display text-xl font-semibold text-ink md:text-2xl">
            {recruiter.headline}
          </p>
          <p className="mt-2 font-mono text-[13px] text-accent">
            {profile.education.degree} · {profile.education.school}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-faint">
            <Icon name="location" size={14} />
            {profile.location}
          </p>
        </motion.div>

        {/* Premium summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          className="panel relative mt-10 overflow-hidden"
        >
          {/* neutral rail — a hairline, not a gradient */}
          <span className="absolute inset-y-0 left-0 w-px bg-edge-strong" aria-hidden />

          <div className="p-6 md:p-8">
            <p className="eyebrow mb-6">{t(mode, 'recruiter.heroTitle')}</p>

            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="font-display text-[15px] font-semibold text-ink">{t(mode, 'recruiter.currentFocus')}</h2>
                <ul className="mt-3 space-y-2.5">
                  {recruiter.currentFocus.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="font-display text-[15px] font-semibold text-ink">{t(mode, 'recruiter.lookingFor')}</h2>
                <ul className="mt-3 space-y-2.5">
                  {recruiter.lookingFor.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <Link to={profile.socials.resume} className="btn-primary !px-4 !py-2 !text-[13px]">
                <Icon name="file-down" size={15} />
                {t(mode, 'recruiter.downloadResume')}
              </Link>

              {profile.socials.github && (
                <a
                  href={profile.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !px-4 !py-2 !text-[13px]"
                >
                  <Github className="h-4 w-4" />
                  {t(mode, 'recruiter.viewGithub')}
                </a>
              )}

              <button
                type="button"
                onClick={() => scrollToId('contact')}
                className="btn-ghost !px-4 !py-2 !text-[13px]"
              >
                <Icon name="mail" size={15} />
                {t(mode, 'recruiter.contact')}
              </button>

              <button
                type="button"
                onClick={() => setChatOpen(true)}
                className="btn-ghost !px-4 !py-2 !text-[13px]"
              >
                <Icon name="bot" size={15} />
                {t(mode, 'recruiter.askAI')}
              </button>

              <button
                type="button"
                onClick={() => scrollToId('projects')}
                className="btn-ghost !px-4 !py-2 !text-[13px]"
              >
                <Icon name="rocket" size={15} />
                {t(mode, 'recruiter.viewBestProject')}
              </button>
            </div>

            {/* Reading time */}
            <p className="mt-6 flex items-center gap-2 border-t border-edge pt-4 font-mono text-[12px] text-faint">
              <Icon name="clock" size={14} aria-hidden />
              {t(mode, 'recruiter.readingTime')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
