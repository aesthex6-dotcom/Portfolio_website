/**
 * Architecture specs — one `src/data/architecture/<slug>.json` per project.
 *
 * Dropping a new `<slug>.json` file is the ONLY step needed to give a project
 * an interactive Architecture diagram (filename must equal the project slug).
 * Vite's eager glob bundles every JSON at build time, so nothing else changes.
 *
 * The glob generic is a cast, not validation — a malformed file would pass
 * TypeScript silently. Each spec runs through `isArchitectureSpec` instead,
 * and malformed files are skipped with a dev warning rather than crashing the
 * site (same graceful-fallback philosophy as the twin engine).
 */
import type { ArchitectureSpec } from '@/types'

const modules = import.meta.glob<{ default: ArchitectureSpec }>('./*.json', {
  eager: true,
})

/** Runtime shape check — the glob generic cannot validate JSON contents. */
function isArchitectureSpec(value: unknown): value is ArchitectureSpec {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Partial<ArchitectureSpec>
  if (typeof s.title !== 'string' || s.title.length === 0) return false
  if (!Array.isArray(s.nodes) || s.nodes.length === 0) return false
  if (!Array.isArray(s.edges)) return false
  return s.nodes.every(
    (n) =>
      typeof n === 'object' &&
      n !== null &&
      typeof (n as ArchitectureSpec['nodes'][number]).id === 'string' &&
      typeof (n as ArchitectureSpec['nodes'][number]).label === 'string' &&
      typeof (n as ArchitectureSpec['nodes'][number]).role === 'string' &&
      typeof (n as ArchitectureSpec['nodes'][number]).why === 'string' &&
      Array.isArray((n as ArchitectureSpec['nodes'][number]).alternatives) &&
      typeof (n as ArchitectureSpec['nodes'][number]).tradeoffs === 'string',
  )
}

export const architectureBySlug: Record<string, ArchitectureSpec> = {}
for (const [path, mod] of Object.entries(modules)) {
  const slug = path.slice(2, -5) // "./kumar-portfolio.json" → "kumar-portfolio"
  if (slug.startsWith('_')) continue // _template.json is a reference, not a spec
  if (!isArchitectureSpec(mod.default)) {
    if (import.meta.env.DEV) console.warn(`[architecture] skipping malformed spec: ${slug}`)
    continue
  }
  architectureBySlug[slug] = mod.default
}

export function getArchitecture(slug: string): ArchitectureSpec | undefined {
  return architectureBySlug[slug]
}
