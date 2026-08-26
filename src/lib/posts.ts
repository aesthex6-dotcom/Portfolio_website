import type { BlogPostMeta } from '@/types'
import { blogPosts } from '@/data/blog'

// Import every markdown file in src/content/posts as a raw string at build time.
const modules = import.meta.glob<string>('/src/content/posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export interface PostContent {
  meta: BlogPostMeta
  content: string
}

export function getPost(slug: string): PostContent | null {
  const meta = blogPosts.find((p) => p.slug === slug)
  if (!meta) return null
  const content = modules[`/src/content/posts/${slug}.md`]
  return content ? { meta, content } : null
}

export function getAllPostSlugs(): string[] {
  return blogPosts.map((p) => p.slug)
}
