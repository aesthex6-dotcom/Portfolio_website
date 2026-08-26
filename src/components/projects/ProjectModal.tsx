import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Github } from 'lucide-react'
import type { Project } from '@/types'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/Icon'
import { architectureBySlug } from '@/data/architecture'
import { ArchitectureExplorer } from './architecture/ArchitectureExplorer'
import { ProjectVisual } from './ProjectVisual'

interface ProjectModalProps {
  project: Project | null
  onClose: () => void
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [tab, setTab] = useState<'case-study' | 'architecture'>('case-study')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!project) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  // Reset to Case study whenever the active project changes (the modal stays
  // mounted through the AnimatePresence exit).
  useEffect(() => setTab('case-study'), [project?.slug])

  // Land at the top of the case study when switching tabs.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [tab])

  const hasArchitecture = !!project && !!architectureBySlug[project.slug]

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ground/75 p-4 backdrop-blur-sm md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} case study`}
        >
          <motion.div
            className="relative max-h-full w-full max-w-3xl overflow-hidden rounded-2xl border border-edge bg-surface shadow-lift"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-edge bg-ground/70 text-muted backdrop-blur transition-colors hover:text-ink"
              aria-label="Close"
            >
              <Icon name="x" size={16} />
            </button>

            <div ref={scrollRef} className="max-h-[calc(100vh-6rem)] overflow-y-auto">
              <ProjectVisual project={project} className="rounded-none" />

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="eyebrow mb-1.5">
                      {project.year} · {project.status}
                    </p>
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-ink md:text-3xl">
                      {project.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] text-muted">{project.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost !px-4 !py-2 !text-[13px]"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                    {project.demo && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary !px-4 !py-2 !text-[13px]"
                      >
                        <Icon name="external-link" size={15} />
                        Live
                      </a>
                    )}
                  </div>
                </div>

                {hasArchitecture && (
                  <div
                    role="tablist"
                    aria-label="Project sections"
                    className="mt-6 flex gap-6 border-b border-edge"
                  >
                    {(['case-study', 'architecture'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="tab"
                        aria-selected={tab === t}
                        onClick={() => setTab(t)}
                        className={cn(
                          'relative pb-3 text-sm font-medium transition-colors',
                          tab === t ? 'text-ink' : 'text-faint hover:text-muted',
                        )}
                      >
                        {t === 'case-study' ? 'Case study' : 'Architecture'}
                        {tab === t && (
                          <motion.div
                            layoutId="project-tab"
                            className="absolute inset-x-0 -bottom-px h-px bg-accent"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={tab}
                    role="tabpanel"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mt-6"
                  >
                    {tab === 'case-study' ? (
                      <div className="space-y-7">
                        <div>
                          <h4 className="eyebrow mb-3">Overview</h4>
                          <p className="text-[15px] leading-relaxed text-muted">
                            {project.longDescription}
                          </p>
                        </div>

                        {project.metrics.length > 0 && (
                          <div className="grid grid-cols-3 gap-3">
                            {project.metrics.map((m) => (
                              <div
                                key={m.label}
                                className="rounded-xl border border-edge bg-raised/50 p-4 text-center"
                              >
                                <p className="font-display text-lg font-semibold text-ink md:text-xl">
                                  {m.value}
                                </p>
                                <p className="mt-1 text-[11px] uppercase tracking-wider text-faint">
                                  {m.label}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div>
                          <h4 className="eyebrow mb-3">Features</h4>
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {project.features.map((f) => (
                              <li key={f} className="flex items-start gap-2 text-sm text-muted">
                                <Icon name="check" size={15} className="mt-0.5 shrink-0 text-ok" />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <h4 className="eyebrow mb-3">Challenges</h4>
                            <ul className="space-y-3">
                              {project.challenges.map((c) => (
                                <li
                                  key={c}
                                  className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                                >
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warn" />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h4 className="eyebrow mb-3">Lessons learned</h4>
                            <ul className="space-y-3">
                              {project.lessons.map((l) => (
                                <li
                                  key={l}
                                  className="flex items-start gap-2 text-sm leading-relaxed text-muted"
                                >
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ok" />
                                  {l}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="eyebrow mb-3">Stack</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((t) => (
                              <span key={t} className="chip">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        {project.github && (
                          <div className="flex items-center justify-between border-t border-edge pt-4 text-[13px] text-faint">
                            <span>Take a closer look:</span>
                            <a
                              href={project.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-accent hover:text-ink"
                            >
                              source <Icon name="arrow-up-right" size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      hasArchitecture && (
                        <ArchitectureExplorer spec={architectureBySlug[project.slug]} />
                      )
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
