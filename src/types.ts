/**
 * Shared domain types. Every data file in `src/data` returns one of these
 * shapes, so components, the resume generator, the terminal and the AI
 * assistant all read from the same source of truth.
 */

export interface TimelineItem {
  year: string
  title: string
  subtitle: string
  description: string
  tags?: string[]
}

export interface Education {
  degree: string
  school: string
  period: string
  detail: string
  photo?: string // campus/portrait URL — empty → reserved frame
}

export interface SocialLinks {
  github: string
  linkedin: string
  email: string
  resume: string
}

export interface ProfileStats {
  label: string
  value: number
  suffix?: string
}

export interface Profile {
  name: string
  firstName: string
  roles: string[]
  tagline: string
  intro: string[]
  location: string
  availability: string
  email: string
  githubUsername: string
  photo?: string // portrait URL — empty → premium reserved frame
  socials: SocialLinks
  education: Education
  journey: TimelineItem[]
  goals: string[]
  stats: ProfileStats[]
}

export interface SkillNode {
  name: string
  level: number // 0-100 — drives node radius in the constellation
  blurb?: string
}

export interface SkillCategory {
  name: string
  icon: string // key into the icon map in SkillConstellation
  blurb: string
  skills: SkillNode[]
}

export interface ProjectMetric {
  label: string
  value: string
}

export interface Project {
  slug: string
  title: string
  tagline: string
  description: string
  longDescription: string
  year: string
  status: 'live' | 'active' | 'archived' | 'research'
  featured: boolean
  glyph: string // monogram shown in the visual placeholder
  tech: string[]
  github: string
  demo?: string
  image?: string // optional real screenshot path/URL
  metrics: ProjectMetric[]
  features: string[]
  challenges: string[]
  lessons: string[]
}

/** One node in a project's interactive architecture diagram. */
export interface ArchitectureNode {
  id: string
  label: string
  subtitle?: string
  /** Visual emphasis: primary accent (default) or the optional/alt accent2. */
  tone?: 'accent' | 'accent2'
  role: string // what this component does in the system
  why: string // why this technology/choice was made
  alternatives: string[] // options considered instead
  tradeoffs: string // the honest trade-off
}

export interface ArchitectureEdge {
  from: string
  to: string
  label?: string
}

/** Data-driven architecture spec — one `architecture.json` per project. */
export interface ArchitectureSpec {
  title: string
  intro?: string
  nodes: ArchitectureNode[]
  edges: ArchitectureEdge[]
}

export interface Experience {
  role: string
  company: string
  type: string // Internship · Freelance · Research · Leadership
  period: string
  location: string
  current?: boolean
  summary: string
  bullets: string[]
  tags: string[]
}

/** Current Mission — honest, in-progress focus areas. */
export type MissionStatus = 'active' | 'learning' | 'building'

export interface MissionItem {
  title: string
  status: MissionStatus // drives the badge: 🟢 Active · 🟡 Learning · 🚧 Building
  detail?: string
}

export interface Certification {
  title: string
  issuer: string
  year: string
  credentialUrl?: string
  description: string
}

export interface Achievement {
  id: string // stable id — used for secret-badge unlock tracking
  title: string
  category: string // Hackathon · Competition · Public speaking · Research
  year: string
  description: string
  secret?: boolean // easter-egg badge — hidden until unlocked
}

export interface BlogPostMeta {
  slug: string
  title: string
  date: string
  excerpt: string
  tags: string[]
  readingTime: string
  featured?: boolean
}

export interface NavSection {
  id: string
  label: string
}

/** One track in the soundtrack playlist. */
export interface Track {
  id: string
  title: string
  artist: string
  /** Mood bucket the track belongs to — groups the playlist in the player. */
  mood: string
  duration: number // seconds
  url: string
  /** Two hex colors for the generated cover gradient. */
  artwork?: { from: string; to: string }
  /** Human-readable attribution for legally-usable audio. */
  source?: string
  license?: string
}
