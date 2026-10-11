/**
 * Nav sections — order + ids drive the navbar and command palette.
 * Visible labels are resolved via the translation utility (t) using the
 * active mode from UIProvider; this file keeps only stable keys.
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
