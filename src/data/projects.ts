/**
 * ─────────────────────────────────────────────────────────────
 *  PROJECTS — the showcase section.
 *  Each project renders a card + a detail modal. Add real projects
 *  here as you ship them — only what actually exists.
 *
 *  `image` is optional: drop a real screenshot at
 *  /public/projects/<slug>.png and set the path; otherwise the
 *  card renders a quiet cover plate from `glyph`.
 *  See `ProjectCard.tsx` / `ProjectModal.tsx` for the full shape.
 * ─────────────────────────────────────────────────────────────
 */
import type { Project } from '@/types'

/** Real, shipped projects — append here. */
export const projects: Project[] = [
  {
    slug: 'kumar-portfolio',
    title: 'My AI portfolio',
    tagline: 'This website: a premium AI portfolio with a digital twin that answers as me.',
    description:
      'This website itself, built to showcase engineering thinking, not just code.',
    longDescription:
      "This site is a hand-built engineering project as much as a portfolio. The centerpiece is the digital twin: an offline-first AI chat that answers in my voice by retrieving from plain markdown knowledge files; no API key required, and structurally unable to fabricate experience. Quick Overview, an interactive terminal with easter eggs, and this Architecture explorer are all real features designed and shipped together.",
    year: '2026',
    status: 'live',
    featured: true,
    glyph: 'K',
    tech: ['React', 'TypeScript', 'Vite', 'Tailwind', 'Framer Motion', 'Markdown'],
    github: '', // ✍️ add the real repo URL once this portfolio is public — empty hides the GitHub link
    metrics: [
      { label: 'Knowledge files', value: '7' },
      { label: 'Sections', value: '7' },
      { label: 'Easter eggs', value: '5' },
    ],
    features: [
      'Digital twin chat: a persona AI that answers from his knowledge files',
      'Quick Overview: a 60-second scannable dashboard',
      'Interactive terminal with easter eggs (try sudo hire-himanshu)',
      'Command palette (Ctrl+K) and Konami code',
      'Résumé generated from the same data files',
      'Interactive Architecture tab for every project',
    ],
    challenges: [
      'A zero-key AI chat that still feels human: retrieval, persona, and a no-fabrication guardrail with no API behind it',
      'Keeping every claim honest: no internships, certifications, or wins that do not exist yet',
      'A design system that stays premium across normal, recruiter, and easter-egg modes',
    ],
    lessons: [
      'Content is a product: the twin improves by editing markdown, not rewriting code',
      'Honesty is a feature: refusing to fabricate makes answers more credible, not less',
      'Data-driven UI means new features ship by adding files, not changing logic',
    ],
  },
]
