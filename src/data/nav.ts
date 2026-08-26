/**
 * Nav sections — order + labels drive the navbar and command palette.
 * Each id maps to a section on the home page.
 */
import type { NavSection } from '@/types'

export const navSections: NavSection[] = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'mission', label: 'Current Mission' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
]
