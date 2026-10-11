import { useState } from 'react'
import { projects } from '@/data/projects'
import type { Project } from '@/types'
import { profile } from '@/data/profile'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Icon } from '@/components/ui/Icon'
import { ProjectScene } from './ProjectScene'
import { ProjectModal } from './ProjectModal'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'

export function Projects() {
  const { mode } = useUI()
  const [active, setActive] = useState<Project | null>(null)

  return (
    <section id="projects" className="scene">
      <div className="container-site">
        <SectionHeading
          numeral="03"
          eyebrow={t(mode, 'projects.title')}
          titleLines={[t(mode, 'projects.titleLines1'), t(mode, 'projects.titleLines2')]}
          description={t(mode, 'projects.description')}
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
                {t(mode, 'projects.moreGitHub')}
              </a>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Icon name="folder" size={18} />}
            title={t(mode, 'projects.comingTitle')}
            description={t(mode, 'projects.comingDescription')}
          />
        )}
      </div>

      <ProjectModal project={active} onClose={() => setActive(null)} />
    </section>
  )
}
