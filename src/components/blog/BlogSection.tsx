import { Link } from 'react-router-dom'
import { blogPosts } from '@/data/blog'
import { formatDate } from '@/lib/utils'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { Reveal } from '@/components/ui/Reveal'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { Icon } from '@/components/ui/Icon'

export function BlogSection() {
  const { mode } = useUI()
  return (
    <section id="blog" className="scene">
      <div className="container-site">
        <SectionHeading
          numeral="07"
          eyebrow={t(mode,'blog.title')}
          titleLines={[t(mode, 'blog.titleLines1'), t(mode, 'blog.titleLines2')]}
          description={t(mode, 'blog.subtitle')}
          amplifyMark
        />

        {blogPosts.length > 0 ? (
          <ol className="rule-list">
            {blogPosts.map((post, i) => (
              <li key={post.slug}>
                <Reveal direction="left">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="rule-row group grid-cols-[auto_1fr_auto] w-full text-left"
                  >
                    <span className="font-mono text-[11px] text-faint transition-colors duration-500 group-hover:text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="block">
                      <span className="flex flex-wrap items-baseline gap-x-3">
                        <h3 className="font-display text-xl font-semibold tracking-[-0.02em] text-ink transition-transform duration-500 ease-out group-hover:translate-x-1 md:text-2xl">
                          {post.title}
                        </h3>
                        <span className="font-mono text-[11px] text-faint">
                          {formatDate(post.date, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                          {' · '}
                          {post.readingTime}
                        </span>
                      </span>
                      <span className="mt-1.5 block max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
                        {post.excerpt}
                      </span>
                      {post.tags.length > 0 && (
                        <span className="mt-3 block font-mono text-[11px] text-faint">
                          {post.tags.join(' · ')}
                        </span>
                      )}
                    </span>

                    <Icon
                      name="arrow-up-right"
                      size={18}
                      className="text-faint transition-all duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    />
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState
            icon={<Icon name="pen-line" size={20} />}
            title={t(mode,'blog.comingTitle')}
            description={t(mode, 'blog.comingDesc')}
          />
        )}
      </div>
    </section>
  )
}
