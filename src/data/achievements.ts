/**
 * ─────────────────────────────────────────────────────────────
 *  ACHIEVEMENTS — interactive cards.
 *
 *  Public achievements intentionally left empty — nothing to
 *  claim yet. Real milestones (hackathons, competitions, …) get
 *  appended here as they happen.
 *
 *  The `secret: true` entries are site easter eggs, not claimed
 *  achievements: they unlock when a visitor actually does the
 *  thing (Konami code, terminal commands, the duck, the game).
 *  Unlock ids are stable and tracked in localStorage.
 * ─────────────────────────────────────────────────────────────
 */
import type { Achievement } from '@/types'

export const achievements: Achievement[] = [
  {
    id: 'konami',
    title: 'Hacker Mode Discoverer',
    category: 'Secret',
    year: '·',
    description: 'Entered the Konami code and activated Hacker Mode. The terminal knows things.',
    secret: true,
  },
  {
    id: 'hire',
    title: 'Culturally Irresistible',
    category: 'Secret',
    year: '·',
    description: 'Ran sudo hire-himanshu. The algorithm approves this decision.',
    secret: true,
  },
  {
    id: 'duck',
    title: 'Rubber Duck Whisperer',
    category: 'Secret',
    year: '·',
    description: 'Summoned the rubber duck. Debugging got 10× calmer.',
    secret: true,
  },
  {
    id: 'matrix',
    title: 'Followed the White Rabbit',
    category: 'Secret',
    year: '·',
    description: 'Engaged the Matrix. There is no spoon.',
    secret: true,
  },
  {
    id: 'snake',
    title: 'Snake Charmer',
    category: 'Secret',
    year: '·',
    description: 'Beat the hidden terminal snake game.',
    secret: true,
  },
]

/** Public, non-secret achievements. */
export const publicAchievements = achievements.filter((a) => !a.secret)

/** Secret achievements (easter eggs) — hidden until unlocked. */
export const secretAchievements = achievements.filter((a) => a.secret)
