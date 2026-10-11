import { Github } from 'lucide-react'
import type { ReactNode } from 'react'
import { useRef } from 'react'
import { profile } from '@/data/profile'
import { Icon } from '@/components/ui/Icon'
import { useCountUp } from '@/hooks/useCountUp'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { useInView } from 'framer-motion'
import { useGitHub } from './useGitHub'

function StatTile({
  icon,
  label,
  value,
  suffix,
}: {
  icon: ReactNode
  label: string
  value: number | null
  suffix?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const n = useCountUp(value ?? 0, { start: inView && value !== null })
  const displayValue = value === null ? '—' : n

  return (
    <div
      ref={ref}
      className="flex flex-col items-center gap-2 rounded-xl border border-edge bg-raised/50 p-5 min-w-[140px]"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-edge text-muted">
        {icon}
      </span>
      <div className="flex flex-col items-center">
        <p className="font-display text-xl font-semibold leading-none text-ink">
          {displayValue}
          {suffix}
        </p>
        <p className="text-[11px] uppercase tracking-wider text-faint">{label}</p>
      </div>
    </div>
  )
}

export function GitHubStats() {
  const { mode } = useUI()
  const { user, summary, loading, userFailed } = useGitHub(profile.githubUsername)

  if (loading && !user) {
    return (
      <div className="flex flex-wrap items-stretch gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[90px] animate-pulse rounded-xl border border-edge bg-raised/40 flex-1 min-w-[140px]"
          />
        ))}
      </div>
    )
  }

  if (userFailed) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-edge bg-raised/40 p-4 font-mono text-[12px] text-faint">
        <Github className="h-4 w-4" />
        GitHub stats temporarily unavailable.
      </p>
    )
  }

  // User data available - show stats with appropriate fallbacks
  const hasUser = user !== null
  const hasSummary = summary !== null

  if (!hasUser) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-edge bg-raised/40 p-4 font-mono text-[12px] text-faint">
        <Github className="h-4 w-4" />
        GitHub stats temporarily unavailable.
      </p>
    )
  }

  // Distinguish between "API returned 0" (legitimate) vs "API failed" (show —)
  // For user fields: use actual value if user succeeded, null if failed
  // For summary fields: use summary if available, otherwise from user, null if repos failed
  const reposValue = hasSummary ? (summary?.repos ?? user?.public_repos ?? null) : (user?.public_repos ?? null)
  const starsValue = hasSummary ? (summary?.stars ?? null) : null
  const followersValue = user?.followers ?? null
  const forksValue = hasSummary ? (summary?.forks ?? null) : null

  return (
    <div className="flex flex-wrap items-stretch gap-4">
      <StatTile
        icon={<Github className="h-4 w-4" />}
        label={t(mode, 'stats.repositories')}
        value={reposValue}
      />
      <StatTile
        icon={<Icon name="star" size={16} />}
        label={t(mode, 'stats.stars')}
        value={starsValue}
      />
      <StatTile
        icon={<Icon name="users" size={16} />}
        label={t(mode, 'stats.followers')}
        value={followersValue}
      />
      <StatTile
        icon={<Icon name="git-fork" size={16} />}
        label={t(mode, 'stats.forks')}
        value={forksValue}
      />
    </div>
  )
}
