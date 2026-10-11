import { achievements } from '@/data/achievements'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Reveal } from '@/components/ui/Reveal'
import { Icon, type IconName } from '@/components/ui/Icon'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const categoryIcon: Record<string, IconName> = {
  Hackathon: 'rocket',
  Competition: 'trophy',
  'Public speaking': 'mic',
  Research: 'flask',
  Secret: 'lock',
}

/** A quiet clue per secret badge — never the answer itself. */
const HINTS: Record<string, string> = {
  konami: 'A cheat code every 90s kid knows.',
  hire: 'The terminal accepts a very flattering command.',
  duck: 'Somewhere, someone needs help with a bug.',
  matrix: 'A white rabbit hides in plain sight.',
  snake: 'A very old game waits inside the terminal.',
}

export function Achievements() {
  const { isBadgeUnlocked, mode } = useUI()
  const publicItems = achievements.filter((a) => !a.secret)
  const secretItems = achievements.filter((a) => a.secret)

  return (
    <section id="achievements" className="scene">
      <div className="container-site">
        <SectionHeading
          numeral="06"
          eyebrow={t(mode, 'achievements.title')}
          titleLines={[t(mode, 'achievements.titleLines1'), t(mode, 'achievements.titleLines2')]}
          amplifyMark
        />

        {publicItems.length > 0 ? (
          <ol className="rule-list">
            {publicItems.map((a, i) => {
              const icon = categoryIcon[a.category] ?? 'award'
              return (
                <li key={a.id}>
                  <Reveal direction="left">
                    <div className="rule-row group grid-cols-[auto_1fr_auto]">
                      <span className="font-mono text-[11px] text-faint transition-colors duration-500 group-hover:text-accent">
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <span className="block">
                        <span className="flex flex-wrap items-baseline gap-x-3">
                          <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink md:text-2xl">
                            {a.title}
                          </h3>
                          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                            {a.category}
                          </span>
                        </span>
                        <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
                          {a.description}
                        </span>
                      </span>

                      <span className="flex items-center gap-4">
                        <span className="grid h-8 w-8 place-items-center rounded-full border border-edge text-muted">
                          <Icon name={icon} size={14} />
                        </span>
                        <span className="hidden font-mono text-[11px] text-faint sm:block">
                          {a.year}
                        </span>
                      </span>
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ol>
        ) : (
          <EmptyState
            icon={<Icon name="trophy" size={20} />}
            title={t(mode, 'achievements.emptyTitle')}
            description={t(mode, 'achievements.emptyDesc')}
          />
        )}

        {/* Secret badges — a ruled index of the easter eggs, not a card shelf. */}
        {secretItems.length > 0 && (
          <Reveal className="mt-16 md:mt-24">
            <div className="flex items-baseline justify-between border-t border-edge py-3">
              <p className="eyebrow">{t(mode, 'achievements.secretBadges')}</p>
              <span className="font-mono text-[11px] text-faint">
                {String(secretItems.length).padStart(2, '0')}
              </span>
            </div>
            <ol className="rule-list">
              {secretItems.map((a, i) => {
                const unlocked = isBadgeUnlocked(a.id)
                return (
                  <li key={a.id} className="rule-row grid-cols-[auto_1fr_auto]">
                    <span className="font-mono text-[11px] text-faint">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="block">
                      <span className="flex items-baseline gap-3">
                        <Icon
                          name={unlocked ? 'award' : 'lock'}
                          size={13}
                          className={cn('shrink-0', unlocked ? 'text-accent' : 'text-faint')}
                        />
                        <span className={cn('text-[15px] md:text-base', unlocked ? 'text-ink' : 'text-faint')}>
                          {unlocked ? a.title : '???'}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'mt-1 block text-[13px] leading-relaxed',
                          unlocked ? 'text-muted' : 'text-faint',
                        )}
                      >
                        {unlocked ? a.description : `Locked · hint: ${t(mode, 'achievements.lockedHint')}${HINTS[a.id] ?? 'find it.'}`}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                      {unlocked ? t(mode, 'achievements.unlocked') : t(mode, 'achievements.locked')}
                    </span>
                  </li>
                )
              })}
            </ol>
          </Reveal>
        )}
      </div>
    </section>
  )
}
