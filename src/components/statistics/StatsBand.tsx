import { profile } from '@/data/profile'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/ui/Reveal'
import { Icon } from '@/components/ui/Icon'
import { GitHubStats } from './GitHubStats'
import { ContributionGraph } from './ContributionGraph'

/**
 * A live "command center" band: GitHub identity + stats + activity heatmap.
 * Hidden entirely until a real GitHub username is set in src/data/profile.ts —
 * the site never shows fabricated numbers.
 */
export function StatsBand() {
  if (!profile.githubUsername) return null
  return (
    <section id="stats" className="relative scroll-mt-20 py-24 md:py-32">
      <div className="container-site">
        <SectionHeading
          eyebrow="Live · GitHub"
          title="The numbers behind the work"
          description="Fetched from the public GitHub API with caching; no build step required."
        />

        <Reveal>
          <div className="panel overflow-hidden">
            <div className="flex flex-col gap-10 p-6 md:flex-row md:items-start md:justify-between md:p-8">
              <div className="flex flex-col items-start gap-6 md:max-w-sm">
                <div className="flex flex-col items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-edge bg-raised font-display text-lg font-semibold text-ink">
                    {profile.firstName[0]}
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <p className="font-display text-base font-semibold text-ink">
                      @{profile.githubUsername}
                    </p>
                    <a
                      href={profile.socials.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[13px] text-accent hover:text-ink transition-colors"
                    >
                      view profile <Icon name="arrow-up-right" size={14} />
                    </a>
                  </div>
                </div>
                <div className="w-full">
                  <GitHubStats />
                </div>
              </div>

              <div className="min-w-0 flex-1 border-t border-edge pt-6 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <ContributionGraph />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
