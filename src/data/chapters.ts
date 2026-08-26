/**
 * Lodestar chapters — the body of the story after the cinematic prologue
 * (Hero + About). Each id maps to a section on the home page.
 *
 * Unlike `navSections` (which powers the footer and command palette and still
 * includes About), these are the post-prologue anchors the Lodestar guides the
 * visitor through. Chapters that aren't rendered on the page (e.g. Achievements
 * and Blog in recruiter mode) are filtered out at runtime by `useLodestar`.
 */
export interface Chapter {
  id: string
  label: string
}

export const chapters: Chapter[] = [
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'mission', label: 'Mission' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
]
