/**
 * Composition: turns a matched knowledge section into a finished reply.
 *
 * `fill()` resolves `{{placeholders}}` from the site's live data files, so
 * the prose lives in `knowledge/*.md` while dynamic lists (projects, skills,
 * mission, contact links) stay single-sourced in `src/data/`.
 */
import { profile } from '@/data/profile'
import { skills } from '@/data/skills'
import { projects } from '@/data/projects'
import { mission } from '@/data/mission'
import { recruiter } from '@/data/recruiter'
import type { KnowledgeSection, TwinLink } from './types'

const bullets = (arr: string[]) => arr.map((x) => `• ${x}`).join('\n')

const missionBullets = mission.items.map((m) => `• ${m.title}`).join('\n')
const skillsBullets = skills
  .map((c) => `• ${c.name}: ${c.skills.map((s) => s.name).join(', ')}`)
  .join('\n')

const projectsList = projects.length
  ? bullets(projects.map((p) => `${p.title} · ${p.tagline}`))
  : "Right now I'm mid-build on my first real projects; they'll show up here as soon as they're working."

const bestProject = projects.length
  ? `My best project right now is **${projects[0].title}**: ${projects[0].tagline}.`
  : "My best project is the one I'm building right now. I'd rather show you something authentic than claim work I can't back up; it lands in the Projects section as soon as it's real."

const overview = [
  `**${profile.name}** · ${recruiter.headline} · ${profile.availability} · ${profile.location}.`,
  '',
  `🎓 ${profile.education.degree} at ${profile.education.school} (${profile.education.period}).`,
  '',
  '🧠 Skills:',
  skillsBullets,
  '',
  '🚀 Current focus:',
  missionBullets,
  '',
  `📦 ${projectsList}`,
  '',
  '📄 The full résumé is one click away.',
].join('\n')

const age =
  profile.stats.find((s) => s.label.toLowerCase() === 'age')?.value?.toString() ?? '18'

const DATA: Record<string, string> = {
  name: profile.name,
  firstName: profile.firstName,
  age,
  degree: profile.education.degree,
  school: profile.education.school,
  period: profile.education.period,
  location: profile.location,
  availability: profile.availability,
  roles: profile.roles.join(', '),
  intro: profile.intro.join('\n\n'),
  goals: bullets(profile.goals),
  mission: missionBullets,
  missionQuote: `${mission.quote.text} ${mission.quote.emphasis}`,
  skills: skillsBullets,
  projectsList,
  bestProject,
  projectCount: String(projects.length),
  overview,
  contactLinks: profile.email ? `Or email me directly at ${profile.email}.` : '',
}

/** Resolve `{{key}}` (and optional `{{key|fallback}}`) placeholders. */
export function fill(text: string): string {
  return text.replace(/\{\{(\w+)(?:\|([^}]*))?\}\}/g, (match, key: string, fallback?: string) => {
    const value = DATA[key]
    if (value !== undefined && value !== '') return value
    return fallback !== undefined ? fallback : match
  })
}

/* ── Links + suggested follow-ups per matched section ────────────────── */

const socialLinks: TwinLink[] = [
  profile.socials.email ? { label: 'Email me', url: profile.socials.email } : null,
  profile.socials.linkedin ? { label: 'LinkedIn', url: profile.socials.linkedin } : null,
  profile.socials.github ? { label: 'GitHub', url: profile.socials.github } : null,
].filter((l): l is TwinLink => l !== null)

const LINKS: Record<string, TwinLink[]> = {
  'personal-who-i-am': [{ label: 'About →', url: '#about' }],
  'projects-projects': [{ label: 'Projects →', url: '#projects' }],
  'projects-best-project': [{ label: 'Projects →', url: '#projects' }],
  'skills-skills': [{ label: 'Skills →', url: '#skills' }],
  'mission-current-mission': [{ label: 'Current Mission →', url: '#mission' }],
  'goals-career-goals': [{ label: 'View resume →', url: '/resume' }],
  'faq-why-hire-me': [{ label: 'View resume →', url: '/resume' }],
  'faq-experience': [{ label: 'Current Mission →', url: '#mission' }],
  'faq-contact': [...socialLinks, { label: 'Download resume →', url: '/resume' }],
  'faq-resume': [{ label: 'View resume →', url: '/resume' }],
  'faq-about-this-website': [
    { label: 'Projects →', url: '#projects' },
    { label: 'View resume →', url: '/resume' },
  ],
  'faq-60-second-overview': [{ label: 'View resume →', url: '/resume' }],
  'faq-hidden-features': [{ label: 'Open the terminal →', url: '#terminal' }],
}

const CHIPS: Record<string, string[]> = {
  'personal-who-i-am': ["Why did you choose AI?", "What's your current mission?"],
  'personal-why-ece': ["Why did you choose AI?", "What's your current mission?"],
  'education-education': ['What are your career goals?', 'What skills do you have?'],
  'projects-best-project': ['What are you working on now?', 'Show me your resume'],
  'skills-skills': ['Which is your best project?', "What's your current mission?"],
  'goals-career-goals': ['Why do you want an internship?', 'Show me your resume'],
  'goals-why-an-internship': ['What are your career goals?', 'Why should I hire you?'],
  'mission-current-mission': ['Which is your best project?', 'Why did you choose AI?'],
  'faq-why-ai': ["What's your current mission?", 'Which is your best project?'],
  'faq-why-hire-me': ['What experience do you have?', 'Show me your resume'],
  'faq-experience': ['Which is your best project?', "What's your current mission?"],
  'faq-contact': ['Show me your resume', 'Why should I hire you?'],
  'faq-60-second-overview': ['Why should I hire you?', 'Show me your resume'],
}

export function linksFor(section: KnowledgeSection): TwinLink[] | undefined {
  return LINKS[section.id]
}

export function chipsFor(section: KnowledgeSection): string[] | undefined {
  return CHIPS[section.id]
}
