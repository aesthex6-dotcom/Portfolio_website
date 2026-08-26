import { useState } from 'react'
import { projects } from '@/data/projects'
import type { Project } from '@/types'
import { profile } from '@/data/profile'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { ProjectScene } from './ProjectScene'
import { ProjectModal } from './ProjectModal'

export function Projects() {
  const [active, setActive] = useState<Project | null>(null)

  return (
    <section id="projects" className="scene">
      <div className="container-site">
        <SectionHeading
          numeral="03"
          eyebrow="Projects"
          titleLines={["What I'm", "building"]}
          description="Each project is presented as a scene: scroll and watch it assemble, then open the full case study, architecture, challenges, and the lessons that stuck."
          amplifyMark
        />

        {projects.length > 0 ? (
          <>
            <ul className="divide-y divide-edge">
              {projects.map((p, i) => (
                <ProjectScene key={p.slug} project={p} index={i} onOpen={setActive} />
              ))}
            </ul>

            {profile.githubUsername && (
              <a
                href={`https://github.com/${profile.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost mt-4"
              >
                More on GitHub
              </a>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Icon name="folder" size={18} />}
            title="Projects coming soon"
            description="I'm currently building my first real products; they'll land here as they ship."
          />
        )}
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  )
}
