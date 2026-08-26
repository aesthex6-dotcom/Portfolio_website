import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPost } from '@/lib/posts'
import { blogPosts } from '@/data/blog'
import { formatDate } from '@/lib/utils'
import { usePageMeta } from '@/hooks/usePageMeta'
import { Icon } from '@/components/ui/Icon'
import { NotFound } from './NotFound'

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : null

  usePageMeta(post ? `${post.meta.title} · Himanshu Arya` : 'Post not found · Himanshu Arya', post?.meta.excerpt)

  if (!post) return <NotFound />

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 2)

  return (
    <article className="relative pt-32 md:pt-40">
      <div className="container-site max-w-3xl">
        <Link
          to="/"
          state={{ scrollTo: 'blog' }}
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink"
        >
          <Icon name="arrow-left" size={15} />
          Back to blog
        </Link>

        <header>
          <div className="flex items-center gap-3 font-mono text-[12px] text-faint">
            <Icon name="book-open" size={14} />
            {formatDate(post.meta.date, { year: 'numeric', month: 'long', day: 'numeric' })}
            <span className="h-1 w-1 rounded-full bg-edge-strong" />
            {post.meta.readingTime}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink md:text-4xl">
            {post.meta.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.meta.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        </header>

        <hr className="my-8 border-edge" />

        <div className="prose-custom text-[15px]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>

        <hr className="my-10 border-edge" />

        <div>
          <p className="eyebrow mb-4">Keep reading</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="panel panel-hover group flex flex-col p-5"
              >
                <span className="font-mono text-[11px] text-faint">{p.readingTime}</span>
                <h3 className="mt-2 flex-1 font-display text-[15px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
                  {p.title}
                </h3>
                <span className="mt-3 inline-flex items-center gap-1 text-[13px] text-accent">
                  Read <Icon name="arrow-right" size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
