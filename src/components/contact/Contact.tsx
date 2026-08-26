import { useRef, useState, type FormEvent, useMemo } from 'react'
import { motion, useScroll, useTransform, useVelocity } from 'framer-motion'
import { Github } from 'lucide-react'
import { profile } from '@/data/profile'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useUI } from '@/store/ui'

export function Contact() {
  const { openTerminal } = useUI()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  // The transmission line connects as the section opens — and disconnects as
  // you scroll back up.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  })

  // Velocity for spring modulation - faster scroll = snappier connection
  const velocity = useVelocity(scrollYProgress)
  const stiffness = useTransform(velocity, [-6, 6], [320, 200])
  const damping = useTransform(velocity, [-6, 6], [24, 34])

  const transmit = useTransform(scrollYProgress, [0, 1], [0, reduced ? 1 : 1])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio contact - ${form.name || 'new message'}`)
    const body = encodeURIComponent(`${form.message}\n\n${form.name} (${form.email})`)
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
  }

  const tileClass =
    'grid h-9 w-9 shrink-0 place-items-center rounded-full border border-edge text-muted transition-colors duration-500 group-hover:border-accent group-hover:text-accent'
  const arrowClass =
    'text-faint transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent'

  // Only count routes that lead somewhere — empty socials are hidden, so the
  // count always matches the rows actually rendered.
  const routeCount =
    (profile.socials.email ? 1 : 0) +
    (profile.socials.github ? 1 : 0) +
    (profile.socials.linkedin ? 1 : 0) +
    2 // Resume + Terminal are always available

  // Progressive form field reveals - each field draws in as scroll reaches it
  const formProgress = useScroll({
    target: ref,
    offset: ['start center', 'end start'],
  }).scrollYProgress

  const field0Opacity = useTransform(formProgress, [0.1, 0.3], reduced ? [1, 1] : [0, 1])
  const field0X = useTransform(formProgress, [0.1, 0.3], reduced ? [0, 0] : [24, 0])
  const field1Opacity = useTransform(formProgress, [0.2, 0.4], reduced ? [1, 1] : [0, 1])
  const field1X = useTransform(formProgress, [0.2, 0.4], reduced ? [0, 0] : [24, 0])
  const field2Opacity = useTransform(formProgress, [0.3, 0.5], reduced ? [1, 1] : [0, 1])
  const field2X = useTransform(formProgress, [0.3, 0.5], reduced ? [0, 0] : [24, 0])
  const submitOpacity = useTransform(formProgress, [0.45, 0.65], reduced ? [1, 1] : [0, 1])
  const submitX = useTransform(formProgress, [0.45, 0.65], reduced ? [0, 0] : [24, 0])

  // Channel list progressive reveal
  const channelProgress = useScroll({
    target: ref,
    offset: ['start end', 'center center'],
  }).scrollYProgress

  const channelOpacity = useTransform(channelProgress, [0, 0.5], reduced ? [1, 1] : [0, 1])
  const channelY = useTransform(channelProgress, [0, 0.5], reduced ? [0, 0] : [20, 0])

  // Pre-compute transition configs
  const enterTransition = useMemo(
    () => ({ stiffness, damping }),
    [stiffness, damping]
  )

  return (
    <section id="contact" ref={ref} className="scene overflow-hidden">
      {/* neutral glow backdrop — cool off-white, no color cast */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(245,247,242,0.03), transparent)',
        }}
        aria-hidden
      />

      <div className="container-site relative">
        <SectionHeading
          numeral="08"
          eyebrow="Contact"
          titleLines={["Let's build", "something intelligent"]}
          description="Open to ML engineering, applied research and AI infrastructure roles. I usually reply within 24–48 hours."
          amplifyMark
        />

        {/* Transmission line — the channel connects as the section opens,
            and disconnects as you scroll back up. */}
        <motion.div
          style={{ scaleX: transmit }}
          transition={enterTransition}
          className="mb-12 flex origin-left items-center gap-3"
        >
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.22em] text-faint">
            Transmit
          </span>
          <span className="h-px flex-1 bg-edge/70" aria-hidden />
          <Icon name="arrow-right" size={14} className="shrink-0 text-faint" aria-hidden />
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16">
          {/* Left — direct routes as a ruled index */}
          <motion.div
            style={{ opacity: channelOpacity, y: channelY }}
            transition={enterTransition}
          >
            <Reveal direction="left">
              <div className="mb-2 flex items-baseline justify-between gap-2">
                <p className="eyebrow">Channels</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                  {String(routeCount).padStart(2, '0')} routes
                </p>
              </div>
              <ol className="rule-list">
                {profile.socials.email && (
                  <li>
                    <a href={profile.socials.email} className="rule-row group grid-cols-[auto_1fr_auto]">
                      <span className={tileClass}>
                        <Icon name="mail" size={14} />
                      </span>
                      <span className="block">
                        <span className="block font-display text-base font-semibold text-ink">Email</span>
                        <span className="mt-0.5 block text-sm text-muted">{profile.email}</span>
                      </span>
                      <Icon name="arrow-up-right" size={16} className={arrowClass} />
                    </a>
                  </li>
                )}
                {profile.socials.github && (
                  <li>
                    <a
                      href={profile.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rule-row group grid-cols-[auto_1fr_auto]"
                    >
                      <span className={tileClass}>
                        <Github className="h-[14px] w-[14px]" />
                      </span>
                      <span className="block">
                        <span className="block font-display text-base font-semibold text-ink">GitHub</span>
                        <span className="mt-0.5 block text-sm text-muted">{profile.githubUsername}</span>
                      </span>
                      <Icon name="arrow-up-right" size={16} className={arrowClass} />
                    </a>
                  </li>
                )}
                {profile.socials.linkedin && (
                  <li>
                    <a
                      href={profile.socials.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rule-row group grid-cols-[auto_1fr_auto]"
                    >
                      <span className={tileClass}>
                        <Icon name="linkedin" size={14} />
                      </span>
                      <span className="block">
                        <span className="block font-display text-base font-semibold text-ink">LinkedIn</span>
                        <span className="mt-0.5 block text-sm text-muted">Profile</span>
                      </span>
                      <Icon name="arrow-up-right" size={16} className={arrowClass} />
                    </a>
                  </li>
                )}
                <li>
                  <a href={profile.socials.resume} className="rule-row group grid-cols-[auto_1fr_auto]">
                    <span className={tileClass}>
                      <Icon name="file-down" size={14} />
                    </span>
                    <span className="block">
                      <span className="block font-display text-base font-semibold text-ink">Resume</span>
                      <span className="mt-0.5 block text-sm text-muted">PDF, one page</span>
                    </span>
                    <Icon name="arrow-up-right" size={16} className={arrowClass} />
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={openTerminal}
                    className="rule-row group w-full cursor-pointer grid-cols-[auto_1fr_auto] text-left"
                  >
                    <span className={tileClass}>
                      <Icon name="terminal" size={14} />
                    </span>
                    <span className="block">
                      <span className="block font-display text-base font-semibold text-ink">Terminal</span>
                      <span className="mt-0.5 block text-sm text-muted">Say hello the old way</span>
                    </span>
                    <Icon name="arrow-up-right" size={16} className={arrowClass} />
                  </button>
                </li>
              </ol>

              <div className="mt-12 border-t border-edge pt-8">
                <p className="eyebrow">Availability</p>
                <p className="mt-3 font-display text-lg font-semibold text-accent">
                  {profile.availability}
                </p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
                  If you&apos;re hiring for a role that matches what I&apos;m building toward, I&apos;d
                  love to hear about it.
                </p>
              </div>
            </Reveal>
          </motion.div>

          {/* Right — quick message (opens the email client) */}
          <Reveal>
            {profile.email ? (
              <motion.form
                onSubmit={onSubmit}
                className="relative mt-2 border-t border-edge pt-8"
                style={{ opacity: channelOpacity, y: channelY }}
                transition={enterTransition}
              >
                {/* Corner ticks — the message plate is sealed. */}
                <span className="absolute -left-px -top-px h-3 w-3 border-l border-t border-edge-strong" aria-hidden />
                <span className="absolute -right-px -top-px h-3 w-3 border-r border-t border-edge-strong" aria-hidden />

                <div className="mb-8 flex items-baseline justify-between gap-2">
                  <p className="eyebrow">Incoming message</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                    CHN.03 · MSG
                  </p>
                </div>
                <div className="space-y-8">
                  <label className="block">
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-[10px] text-faint">01</span>
                      <span className="eyebrow">Your name</span>
                    </span>
                    <motion.input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      style={{ opacity: field0Opacity, x: field0X }}
                      transition={enterTransition}
                      className="mt-3 w-full border-b border-edge bg-transparent pb-3 pt-1 text-[15px] text-ink placeholder:text-faint transition-[border-color,box-shadow] duration-300 hover:border-edge-strong focus:border-accent focus:shadow-[0_1px_0_var(--accent)] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-[10px] text-faint">02</span>
                      <span className="eyebrow">Your email</span>
                    </span>
                    <motion.input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@company.com"
                      style={{ opacity: field1Opacity, x: field1X }}
                      transition={enterTransition}
                      className="mt-3 w-full border-b border-edge bg-transparent pb-3 pt-1 text-[15px] text-ink placeholder:text-faint transition-[border-color,box-shadow] duration-300 hover:border-edge-strong focus:border-accent focus:shadow-[0_1px_0_var(--accent)] focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-[10px] text-faint">03</span>
                      <span className="eyebrow">The problem</span>
                    </span>
                    <motion.textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell me about the role, the team, the problem…"
                      style={{ opacity: field2Opacity, x: field2X }}
                      transition={enterTransition}
                      className="mt-3 w-full resize-none border-b border-edge bg-transparent pb-3 pt-1 text-[15px] text-ink placeholder:text-faint transition-colors focus:border-accent focus:outline-none"
                    />
                  </label>
                </div>

                <motion.div
                  style={{ opacity: submitOpacity, x: submitX }}
                  transition={enterTransition}
                  className="mt-10 flex items-center justify-between gap-6 border-t border-edge pt-6"
                >
                  <div>
                    <p className="font-mono text-[12px] text-faint">{profile.availability}</p>
                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
                      Opens your mail client
                    </p>
                  </div>
                  <button type="submit" className="btn-primary">
                    <Icon name="send" size={15} />
                    Send message
                  </button>
                </motion.div>
              </motion.form>
            ) : (
              <EmptyState
                icon={<Icon name="mail" size={20} />}
                title="No inbox to send to yet"
                description="Once my real email is live, a quick message form will appear here. Until then, the direct links on the left are the fastest way to reach me."
                className="mt-2"
              />
            )}
          </Reveal>
        </div>
      </div>
    </section>
  )
}