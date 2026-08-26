import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { projects } from '@/data/projects'
import type { Project } from '@/types'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectModal } from '@/components/projects/ProjectModal'
import { cn } from '@/lib/utils'

/** Recruiter-friendly projects — featured first, the rest one click away. */
export function RecruiterProjects() {
  const [active, setActive] = useState<Project | null>(null)
  const [showAll, setShowAll] = useState(false)

  const featured = projects.filter((p) => p.featured)
  const rest = projects.filter((p) => !p.featured)

  return (
    <section id="projects" className="relative scroll-mt-20 py-16 md:py-20">
      <div className="container-site">
        <SectionHeading
          eyebrow="Projects"
          title="Featured work"
          description="The highlights first; everything else is one click away."
        />

        {projects.length === 0 ? (
          <EmptyState
            icon={<Icon name="folder" size={22} />}
            title="Projects coming soon"
            description="I'm currently building my first real projects; this space fills up as they ship."
          />
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p) => (
                <ProjectCard key={p.slug} project={p} onOpen={setActive} />
              ))}
            </div>

            {rest.length > 0 && (
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setShowAll((v) => !v)}
                  aria-expanded={showAll}
                  className="btn-ghost mx-auto flex items-center gap-2"
                >
                  <Icon
                    name="chevron-down"
                    size={15}
                    className={cn('transition-transform', showAll && 'rotate-180')}
                  />
                  {showAll ? 'Hide' : `Show all ${projects.length} projects`}
                </button>

                <AnimatePresence initial={false}>
                  {showAll && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-6 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                        {rest.map((p) => (
                          <ProjectCard key={p.slug} project={p} onOpen={setActive} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  )
}
