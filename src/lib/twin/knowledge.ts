/**
 * The knowledge layer of the Digital Twin.
 *
 * Imports every `knowledge/*.md` file as raw text (Vite `?raw`) and parses
 * it into `KnowledgeSection[]`. Adding a new `## Section` to any file (or a
 * brand new file) automatically extends the twin — no code changes.
 */
import personal from '../../../knowledge/personal.md?raw'
import education from '../../../knowledge/education.md?raw'
import projects from '../../../knowledge/projects.md?raw'
import skills from '../../../knowledge/skills.md?raw'
import goals from '../../../knowledge/goals.md?raw'
import mission from '../../../knowledge/mission.md?raw'
import faq from '../../../knowledge/faq.md?raw'
import { slugify } from '@/lib/utils'
import type { KnowledgeSection } from './types'

const FILES: { file: string; raw: string }[] = [
  { file: 'personal', raw: personal },
  { file: 'education', raw: education },
  { file: 'projects', raw: projects },
  { file: 'skills', raw: skills },
  { file: 'goals', raw: goals },
  { file: 'mission', raw: mission },
  { file: 'faq', raw: faq },
]

// Matches `**Keywords:** value` (colon inside the bold) and
// `**Keywords**: value` / `**Keywords :** value` variants.
const KEYWORDS_RE = /^\*\*\s*Keywords?\s*:?\s*\*\*\s*:?\s*(.+)$/i

/** Split one markdown file into `## Section` blocks. */
export function parseKnowledge(file: string, raw: string): KnowledgeSection[] {
  const sections: KnowledgeSection[] = []
  const lines = raw.split(/\r?\n/)
  let title: string | null = null
  let body: string[] = []

  const flush = () => {
    if (!title) return
    const keywords: string[] = []
    const contentLines: string[] = []
    for (const line of body) {
      const m = line.match(KEYWORDS_RE)
      if (m) keywords.push(...m[1].split(',').map((s) => s.trim()).filter(Boolean))
      else contentLines.push(line)
    }
    const content = contentLines.join('\n').trim()
    if (content) {
      sections.push({
        file,
        id: `${file}-${slugify(title)}`,
        title,
        keywords: keywords.length ? keywords : deriveKeywords(title),
        content,
      })
    }
    title = null
    body = []
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flush()
      title = line.slice(3).trim()
      body = []
    } else if (title !== null) {
      body.push(line)
    }
  }
  flush()
  return sections
}

/** If a section has no `**Keywords:**` line, derive phrases from its title. */
function deriveKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
}

export const knowledgeSections: KnowledgeSection[] = FILES.flatMap(({ file, raw }) =>
  parseKnowledge(file, raw),
)

export function getSection(id: string): KnowledgeSection | undefined {
  return knowledgeSections.find((s) => s.id === id)
}

/** The full knowledge set rendered as one prompt-friendly block. */
export function knowledgeAsPrompt(): string {
  return knowledgeSections
    .map((s) => `[${s.title}]\n${s.content}`)
    .join('\n\n')
}
