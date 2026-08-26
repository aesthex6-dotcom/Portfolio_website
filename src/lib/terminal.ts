/**
 * Interactive portfolio terminal — command processor.
 * The Terminal overlay renders the output; this file decides what each
 * command prints. Side-effecting commands (matrix, duck, game, sudo …)
 * call into `TerminalActions` provided by the UI store.
 */
import { profile } from '@/data/profile'
import { skills } from '@/data/skills'
import { projects } from '@/data/projects'
import { architectureBySlug } from '@/data/architecture'
import { experience } from '@/data/experience'
import { certifications } from '@/data/certifications'
import { achievements } from '@/data/achievements'
import { blogPosts } from '@/data/blog'

export type Tone = 'cmd' | 'ok' | 'accent' | 'info' | 'dim' | 'error' | 'heading' | 'warn' | 'raw'

export interface TermLine {
  text: string
  tone?: Tone
}

export interface CommandResult {
  lines: TermLine[]
  clear?: boolean
}

export interface TerminalActions {
  openSection: (id: string) => void
  navigate: (path: string) => void
  setHackerMode: (v: boolean) => void
  setMatrixActive: (v: boolean) => void
  setDuckVisible: (v: boolean) => void
  openSnake: () => void
  unlockBadge: (id: string) => void
  closeTerminal: () => void
}

export const BANNER: TermLine[] = [
  { text: '┌──────────────────────────────────────────────┐', tone: 'accent' },
  { text: '  HIMANSHU@PORTFOLIO · interactive résumé OS v1.0', tone: 'heading' },
  { text: '└──────────────────────────────────────────────┘', tone: 'accent' },
  { text: '' },
  { text: `Hi, I'm ${profile.name}. ${profile.roles.join(' · ')}.`, tone: 'info' },
  { text: `Type "help" to list available commands.`, tone: 'dim' },
  { text: '' },
]

const HELP: TermLine[] = [
  { text: 'Available commands', tone: 'heading' },
  { text: '' },
  { text: '  help', tone: 'cmd' },
  { text: '  about / whoami / education / goals', tone: 'cmd' },
  { text: '  skills [all]', tone: 'cmd' },
  { text: '  projects [slug]', tone: 'cmd' },
  { text: '  experience / certifications / achievements / blog', tone: 'cmd' },
  { text: '  contact / socials / resume', tone: 'cmd' },
  { text: '  github / stats / status', tone: 'cmd' },
  { text: '  ls / cat <file> / echo <text> / date', tone: 'cmd' },
  { text: '  banner / matrix / hack / duck / game / badges', tone: 'cmd' },
  { text: '  sudo hire-himanshu', tone: 'cmd' },
  { text: '  clear / exit', tone: 'cmd' },
  { text: '' },
  { text: 'Try: cat profile.md · cat about.md · sudo hire-himanshu', tone: 'dim' },
  { text: '' },
]

function listSkills(all = false): TermLine[] {
  const lines: TermLine[] = []
  for (const cat of skills) {
    lines.push({ text: `▸ ${cat.name}`, tone: 'accent' })
    const names = cat.skills.map((s) => s.name).join(', ')
    lines.push({ text: `    ${names}`, tone: 'info' })
    if (all) lines.push({ text: `    ${cat.blurb}`, tone: 'dim' })
  }
  return lines
}

function projectDetails(slug: string): TermLine[] {
  const p = projects.find((x) => x.slug === slug)
  if (!p) {
    return [
      { text: `Unknown project "${slug}". Try one of:`, tone: 'error' },
      { text: projects.map((x) => x.slug).join(' · '), tone: 'info' },
    ]
  }
  const lines: TermLine[] = [
    { text: `█ ${p.title}`, tone: 'heading' },
    { text: `  ${p.tagline}`, tone: 'accent' },
    { text: '' },
    { text: `  ${p.longDescription}`, tone: 'info' },
    { text: '' },
    { text: `  Tech   → ${p.tech.join(', ')}`, tone: 'info' },
    { text: `  Status → ${p.status}`, tone: p.status === 'live' ? 'ok' : 'info' },
    ...(p.demo ? ([{ text: `  Demo   → ${p.demo}`, tone: 'accent' }] as TermLine[]) : []),
    ...(p.github ? ([{ text: `  GitHub → ${p.github}`, tone: 'accent' }] as TermLine[]) : []),
    { text: '' },
    { text: '  Metrics:', tone: 'heading' },
    ...p.metrics.map((m) => ({ text: `  ${m.label.padEnd(28)} ${m.value}`, tone: 'info' as Tone })),
  ]
  if (architectureBySlug[p.slug]) {
    lines.push(
      { text: '', tone: 'raw' },
      { text: '  Architecture: interactive diagram → open the project modal', tone: 'heading' },
      { text: '  (hover nodes · click for role, why, alternatives, trade-offs)', tone: 'dim' },
    )
  }
  lines.push({ text: '', tone: 'raw' })
  lines.push({ text: `  Challenges: ${p.challenges.join(' ')}`, tone: 'info' })
  lines.push({ text: `  Lessons:    ${p.lessons.join(' ')}`, tone: 'info' })
  return lines
}

const FILES: Record<string, () => TermLine[]> = {
  'profile.md': () => [
    { text: '# profile.md', tone: 'heading' },
    { text: `name: ${profile.name}`, tone: 'info' },
    { text: `roles: ${profile.roles.join(', ')}`, tone: 'info' },
    { text: `location: ${profile.location}`, tone: 'info' },
    { text: `email: ${profile.email || '(not set yet)'}`, tone: 'info' },
    { text: `availability: ${profile.availability}`, tone: 'info' },
    { text: '', tone: 'raw' },
    { text: 'tip: cat about.md · cat projects.md · cat contact.md', tone: 'dim' },
  ],
  'about.md': () => [
    { text: '# about.md', tone: 'heading' },
    ...profile.intro.map((p): TermLine => ({ text: p, tone: 'info' })),
    { text: '', tone: 'raw' },
    { text: `education: ${profile.education.degree} @ ${profile.education.school}`, tone: 'info' },
  ],
  'skills.md': () => [{ text: '# skills.md', tone: 'heading' }, ...listSkills(true)],
  'projects.md': () => [
    { text: '# projects.md', tone: 'heading' },
    ...projects.map((p): TermLine => ({
      text: `- ${p.slug.padEnd(22)} ${p.title} · ${p.tagline}`,
      tone: 'info',
    })),
    { text: '', tone: 'raw' },
    { text: 'try: projects <slug>', tone: 'dim' },
  ],
  'contact.md': () => [
    { text: '# contact.md', tone: 'heading' },
    { text: `email:   ${profile.email || '(not set yet)'}`, tone: 'info' },
    { text: `github:  ${profile.socials.github || '(not set yet)'}`, tone: 'info' },
    { text: `linkedin:${profile.socials.linkedin || '(not set yet)'}`, tone: 'info' },
    { text: `resume:  ${profile.socials.resume}`, tone: 'info' },
  ],
  'README.md': () => [
    { text: '# README.md', tone: 'heading' },
    { text: `${profile.name} — Portfolio`, tone: 'info' },
    { text: profile.tagline, tone: 'info' },
  ],
}

export function processCommand(raw: string, actions: TerminalActions): CommandResult {
  const input = raw.trim()
  const [cmd, ...rest] = input.split(/\s+/)
  const arg = rest.join(' ')

  if (!input) return { lines: [] }

  switch (cmd.toLowerCase()) {
    case 'clear':
      return { lines: [], clear: true }

    case 'help':
    case '?':
      return { lines: HELP }

    case 'banner':
      return { lines: BANNER }

    case 'about':
    case 'whoami':
      return {
        lines: [
          { text: `${profile.name} · ${profile.roles.join(' · ')}`, tone: 'heading' },
          { text: '', tone: 'raw' },
          ...profile.intro.map((p): TermLine => ({ text: p, tone: 'info' })),
          { text: '', tone: 'raw' },
          { text: `📍 ${profile.location} · ${profile.availability}`, tone: 'accent' },
        ],
      }

    case 'education':
      return {
        lines: [
          { text: profile.education.degree, tone: 'heading' },
          { text: profile.education.school, tone: 'info' },
          { text: profile.education.period, tone: 'dim' },
          { text: '', tone: 'raw' },
          { text: profile.education.detail, tone: 'info' },
        ],
      }

    case 'goals':
    case 'future':
      return { lines: profile.goals.map((g): TermLine => ({ text: `▸ ${g}`, tone: 'info' })) }

    case 'journey':
    case 'timeline':
      return {
        lines: profile.journey.flatMap((j): TermLine[] => [
          { text: `${j.year} · ${j.title}`, tone: 'accent' },
          { text: `  ${j.description}`, tone: 'info' },
        ]),
      }

    case 'skills':
      return { lines: [{ text: 'SKILL MATRIX', tone: 'heading' }, ...listSkills(arg === 'all')] }

    case 'projects':
      if (arg) return { lines: projectDetails(arg.toLowerCase()) }
      if (projects.length === 0)
        return {
          lines: [
            { text: 'PROJECTS', tone: 'heading' },
            { text: '  No published projects yet, building the first one now.', tone: 'info' },
            { text: '', tone: 'raw' },
            { text: '  Real, shipped projects will appear here.', tone: 'dim' },
          ],
        }
      return {
        lines: [
          { text: 'PROJECTS', tone: 'heading' },
          ...projects.map((p): TermLine => ({
            text: `  ${p.featured ? '★' : '·'} ${p.slug.padEnd(24)} ${p.title}`,
            tone: p.featured ? 'accent' : 'info',
          })),
          { text: '', tone: 'raw' },
          { text: 'try: projects <slug> for the full dossier', tone: 'dim' },
        ],
      }

    case 'experience':
      if (experience.length === 0)
        return {
          lines: [
            { text: 'EXPERIENCE', tone: 'heading' },
            {
              text: '  No internships or roles yet, looking for my first ML / AI internship.',
              tone: 'info',
            },
          ],
        }
      return {
        lines: [
          { text: 'EXPERIENCE', tone: 'heading' },
          ...experience.flatMap((e): TermLine[] => [
            { text: `  ${e.role} @ ${e.company}`, tone: 'accent' },
            { text: `  ${e.type} · ${e.period} · ${e.location}`, tone: 'dim' },
            { text: `  ${e.summary}`, tone: 'info' },
            ...(e.bullets.length ? [{ text: '', tone: 'raw' as Tone }] : []),
            ...e.bullets.map((b): TermLine => ({ text: `    - ${b}`, tone: 'info' })),
            { text: '', tone: 'raw' },
          ]),
        ],
      }

    case 'certifications':
    case 'certs':
      if (certifications.length === 0)
        return {
          lines: [
            { text: 'CERTIFICATIONS', tone: 'heading' },
            {
              text: '  None yet, currently learning and preparing for industry certifications.',
              tone: 'info',
            },
          ],
        }
      return {
        lines: [
          { text: 'CERTIFICATIONS', tone: 'heading' },
          ...certifications.map((c): TermLine => ({
            text: `  ✓ ${c.title} · ${c.issuer} (${c.year})`,
            tone: 'ok',
          })),
        ],
      }

    case 'achievements':
    case 'badges':
      actions.unlockBadge('badges')
      {
        const publicList = achievements.filter((a) => !a.secret)
        return {
          lines: [
            { text: 'ACHIEVEMENTS', tone: 'heading' },
            ...(publicList.length
              ? publicList.map((a): TermLine => ({ text: `  ◆ ${a.title} · ${a.year}`, tone: 'info' }))
              : ([
                  {
                    text: '  No public achievements yet, intentionally empty until real wins happen.',
                    tone: 'info',
                  },
                ] as TermLine[])),
            { text: '', tone: 'raw' },
            { text: '🔒 There are secret badges hidden around the site…', tone: 'dim' },
          ],
        }
      }

    case 'blog':
      if (blogPosts.length === 0)
        return {
          lines: [
            { text: 'LATEST WRITING', tone: 'heading' },
            { text: '  No posts yet, thoughts coming soon.', tone: 'info' },
          ],
        }
      return {
        lines: [
          { text: 'LATEST WRITING', tone: 'heading' },
          ...blogPosts.map((b): TermLine => ({
            text: `  📄 ${b.slug.padEnd(28)} ${b.title}`,
            tone: 'info',
          })),
          { text: '', tone: 'raw' },
          { text: 'try: open the Blog section on the site', tone: 'dim' },
        ],
      }

    case 'contact':
      actions.openSection('contact')
      return {
        lines: [
          { text: 'CONTACT', tone: 'heading' },
          { text: `  email:   ${profile.email || '(not set yet)'}`, tone: 'info' },
          { text: `  github:  ${profile.socials.github || '(not set yet)'}`, tone: 'info' },
          { text: `  linkedin:${profile.socials.linkedin || '(not set yet)'}`, tone: 'info' },
          { text: '', tone: 'raw' },
          { text: 'Scrolled you to the contact section ↓', tone: 'dim' },
        ],
      }

    case 'socials':
      return {
        lines: [
          { text: 'SOCIALS', tone: 'heading' },
          { text: `  github   ${profile.socials.github || '(not set yet)'}`, tone: 'info' },
          { text: `  linkedin ${profile.socials.linkedin || '(not set yet)'}`, tone: 'info' },
          { text: `  email    ${profile.socials.email || '(not set yet)'}`, tone: 'info' },
        ],
      }

    case 'resume':
    case 'cv':
      actions.navigate('/resume')
      return { lines: [{ text: 'Opening resume…', tone: 'ok' }] }

    case 'github':
      if (!profile.githubUsername)
        return {
          lines: [
            { text: 'GITHUB', tone: 'heading' },
            {
              text: '  Live GitHub stats are hidden until a real username is set in src/data/profile.ts.',
              tone: 'info',
            },
          ],
        }
      return {
        lines: [
          { text: 'GITHUB', tone: 'heading' },
          { text: `  @${profile.githubUsername} · ${profile.socials.github}`, tone: 'info' },
          { text: '  Check the stats band on the site for live numbers.', tone: 'dim' },
        ],
      }

    case 'status':
      return {
        lines: [
          { text: 'STATUS', tone: 'heading' },
          { text: `  status:       ${profile.availability}`, tone: 'ok' },
          { text: `  location:     ${profile.location}`, tone: 'info' },
          { text: `  focus:        LLM apps · agents · MCP`, tone: 'info' },
          { text: `  last update:  2026-08`, tone: 'dim' },
        ],
      }

    case 'stats':
      return {
        lines: profile.stats.map((s): TermLine => ({
          text: `  ${s.label.padEnd(28)} ${s.value}${s.suffix ?? ''}`,
          tone: 'accent',
        })),
      }

    case 'ls':
      return {
        lines: [
          {
            text: 'about.md  skills.md  projects.md  contact.md  README.md  resume/  .eggs/',
            tone: 'info',
          },
        ],
      }

    case 'cat':
      if (!arg) return { lines: [{ text: 'usage: cat <file>', tone: 'error' }] }
      return {
        lines: FILES[arg.toLowerCase()]?.() ?? [
          { text: `cat: ${arg}: no such file`, tone: 'error' },
        ],
      }

    case 'echo':
      return { lines: [{ text: arg, tone: 'info' }] }

    case 'date':
      return { lines: [{ text: new Date().toUTCString(), tone: 'info' }] }

    case 'sudo':
    case 'hire':
    case 'sudo-hire-himanshu':
      if (cmd === 'sudo') {
        if (arg.toLowerCase().includes('hire')) {
          actions.unlockBadge('hire')
          return {
            lines: [
              { text: '[sudo] password for himanshu: ******', tone: 'dim' },
              { text: '', tone: 'raw' },
              { text: '✔ ACCESS GRANTED', tone: 'ok' },
              { text: '', tone: 'raw' },
              { text: '🎉 CONGRATULATIONS. You have made an excellent decision.', tone: 'heading' },
              { text: `Himanshu is ${profile.availability.toLowerCase()}.`, tone: 'info' },
              {
                text: 'Recruiter bonus: he replies to emails with the same speed he ships projects.',
                tone: 'accent',
              },
              ...(profile.email
                ? ([{ text: `Send an offer → ${profile.email}`, tone: 'ok' }] as TermLine[])
                : ([{ text: 'Send an offer → use the contact section on the site', tone: 'ok' }] as TermLine[])),
            ],
          }
        }
        return {
          lines: [
            {
              text: 'sudo: command not found. Did you mean "sudo hire-himanshu"?' + ' 😉',
              tone: 'warn',
            },
          ],
        }
      }
      return { lines: [{ text: 'usage: sudo hire-himanshu', tone: 'error' }] }

    case 'hack':
    case 'hackermode':
      actions.setHackerMode(true)
      actions.unlockBadge('konami')
      return { lines: [{ text: '⌁ HACKER MODE ENGAGED · system theme overridden.', tone: 'ok' }] }

    case 'matrix':
      actions.setMatrixActive(true)
      actions.unlockBadge('matrix')
      return {
        lines: [
          { text: 'Wake up, Neo… The Matrix has you.', tone: 'accent' },
          { text: 'Press Esc to disengage.', tone: 'dim' },
        ],
      }

    case 'duck':
    case 'rubberduck':
      actions.setDuckVisible(true)
      actions.unlockBadge('duck')
      return {
        lines: [
          { text: '  (•_•)', tone: 'warn' },
          { text: '  <) )╯  QUACK · your rubber duck has arrived.', tone: 'warn' },
          { text: '  /   \\', tone: 'warn' },
          { text: '', tone: 'raw' },
          { text: 'Explain your problem to it. Debugging is 10× calmer now.', tone: 'dim' },
        ],
      }

    case 'game':
    case 'snake':
      actions.openSnake()
      actions.unlockBadge('snake')
      return {
        lines: [
          { text: '🐍 Launching NEURAL SNAKE… beat it to unlock a secret badge.', tone: 'ok' },
        ],
      }

    case 'exit':
    case 'quit':
      actions.closeTerminal()
      return { lines: [] }

    case 'eggs':
    case 'hint':
    case 'easter':
      return {
        lines: [
          { text: 'HIDDEN FEATURES', tone: 'heading' },
          { text: '  ↑↑↓↓←→←→BA        Konami → hacker mode', tone: 'info' },
          { text: '  matrix / hack      terminal commands', tone: 'info' },
          { text: '  duck               summon the duck', tone: 'info' },
          { text: '  game               retro snake', tone: 'info' },
          { text: '  sudo hire-himanshu    the legend', tone: 'info' },
          { text: '  Ctrl+K             command palette', tone: 'info' },
          { text: '  Ctrl+`             this terminal', tone: 'info' },
          { text: '  Also: try clicking things that look clickable.', tone: 'dim' },
        ],
      }

    default:
      return {
        lines: [
          { text: `zsh: command not found: ${cmd}`, tone: 'error' },
          { text: 'Type "help" for available commands.', tone: 'dim' },
        ],
      }
  }
}
