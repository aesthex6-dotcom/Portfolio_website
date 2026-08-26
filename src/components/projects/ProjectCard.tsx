import { Github } from 'lucide-react'
import type { Project } from '@/types'
import { Tilt } from '@/components/ui/Tilt'
import { Icon } from '@/components/ui/Icon'
import { Reveal } from '@/components/ui/Reveal'
import { ProjectVisual } from './ProjectVisual'

interface ProjectCardProps {
  project: Project
  onOpen: (project: Project) => void
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <Reveal direction="up" className="h-full">
      <article className="h-full">
        <Tilt className="h-full">
        <div
          className="panel panel-hover group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl"
          onClick={() => onOpen(project)}
          role="button"
          tabIndex={0}
          aria-label={`Open ${project.title} case study`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onOpen(project)
            }
          }}
        >
          <ProjectVisual project={project} />

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {project.featured && (
                  <Icon name="star" size={16} className="fill-accent text-accent" aria-label="Featured" />
                )}
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                  {project.title}
                </h3>
              </div>
              <Icon name="arrow-up-right" size={16} className="shrink-0 text-faint transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
            </div>

            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{project.tagline}</p>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.tech.slice(0, 4).map((t) => (
                <span key={t} className="chip !px-2.5 !py-0.5 !text-[11px]">
                  {t}
                </span>
              ))}
              {project.tech.length > 4 && (
                <span className="chip !px-2.5 !py-0.5 !text-[11px]">
                  +{project.tech.length - 4}
                </span>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-edge pt-4">
              <div className="flex items-center gap-2 text-[13px] text-faint">
                <span className="font-mono">{project.year}</span>
                {project.metrics[0] && (
                  <span className="hidden items-center gap-1 sm:flex">
                    <span className="h-1 w-1 rounded-full bg-edge-strong" />
                    {project.metrics[0].label}:{' '}
                    <span className="text-muted">{project.metrics[0].value}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
                    aria-label={`${project.title} on GitHub`}
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
                    aria-label={`${project.title} live demo`}
                  >
                    <Icon name="arrow-up-right" size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </Tilt>
      </article>
    </Reveal>
  )
}
