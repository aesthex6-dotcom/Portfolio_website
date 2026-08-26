import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { navSections } from '@/data/nav'
import { projects } from '@/data/projects'
import { blogPosts } from '@/data/blog'
import { profile } from '@/data/profile'
import { scrollToId } from '@/lib/utils'
import { useUI } from '@/store/ui'
import { Kbd } from '@/components/ui/Kbd'
import { Icon } from '@/components/ui/Icon'

interface PaletteItem {
  id: string
  label: string
  hint?: string
  group: string
  icon: ReactNode
  run: () => void
  keywords: string
}

function fuzzyScore(query: string, text: string): number {
  const q = query.toLowerCase()
  const t = text.toLowerCase()
  if (t.includes(q)) return 100 - t.indexOf(q)
  let score = 0
  let qi = 0
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      score += 10
      qi++
    }
  }
  return qi === q.length ? score : -1
}

export function CommandPalette() {
  const { paletteOpen, setPaletteOpen, openTerminal, setChatOpen } = useUI()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<PaletteItem[]>(() => {
    const go = (id: string) => () => {
      setPaletteOpen(false)
      navigate('/')
      requestAnimationFrame(() => setTimeout(() => scrollToId(id), 60))
    }

    const sections: PaletteItem[] = navSections.map((s) => ({
      id: `section-${s.id}`,
      label: s.label,
      group: 'Sections',
      icon: <Icon name="user" size={15} />,
      run: go(s.id),
      keywords: s.label,
    }))

    const projectItems: PaletteItem[] = projects.map((p) => ({
      id: `project-${p.slug}`,
      label: p.title,
      hint: p.tech.slice(0, 2).join(' · '),
      group: 'Projects',
      icon: <Icon name="folder" size={15} />,
      run: go('projects'),
      keywords: `${p.title} ${p.tech.join(' ')} ${p.tagline}`,
    }))

    const blogItems: PaletteItem[] = blogPosts.map((b) => ({
      id: `blog-${b.slug}`,
      label: b.title,
      hint: b.readingTime,
      group: 'Blog',
      icon: <Icon name="book-open" size={15} />,
      run: () => {
        setPaletteOpen(false)
        navigate(`/blog/${b.slug}`)
      },
      keywords: `${b.title} ${b.tags.join(' ')}`,
    }))

    const actions: PaletteItem[] = [
      {
        id: 'action-terminal',
        label: 'Open interactive terminal',
        group: 'Actions',
        icon: <Icon name="terminal" size={15} />,
        run: () => {
          setPaletteOpen(false)
          openTerminal()
        },
        keywords: 'terminal cli command prompt',
      },
      {
        id: 'action-chat',
        label: 'Ask the AI assistant',
        group: 'Actions',
        icon: <Icon name="bot" size={15} />,
        run: () => {
          setPaletteOpen(false)
          setChatOpen(true)
        },
        keywords: 'chat ai assistant ask questions',
      },
      {
        id: 'action-resume',
        label: 'View resume',
        group: 'Actions',
        icon: <Icon name="file" size={15} />,
        run: () => {
          setPaletteOpen(false)
          navigate('/resume')
        },
        keywords: 'resume cv pdf',
      },
      ...(profile.socials.github
        ? [
            {
              id: 'action-github',
              label: 'GitHub · ' + profile.githubUsername,
              group: 'External',
              icon: <Icon name="globe" size={15} />,
              run: () => window.open(profile.socials.github, '_blank', 'noopener'),
              keywords: 'github code repos',
            },
          ]
        : []),
      ...(profile.socials.linkedin
        ? [
            {
              id: 'action-linkedin',
              label: 'LinkedIn profile',
              group: 'External',
              icon: <Icon name="globe" size={15} />,
              run: () => window.open(profile.socials.linkedin, '_blank', 'noopener'),
              keywords: 'linkedin social',
            },
          ]
        : []),
      ...(profile.socials.email
        ? [
            {
              id: 'action-email',
              label: 'Email ' + profile.email,
              group: 'External',
              icon: <Icon name="mail" size={15} />,
              run: () => window.location.assign(profile.socials.email),
              keywords: 'email contact hire',
            },
          ]
        : []),
    ]

    return [...sections, ...projectItems, ...blogItems, ...actions]
  }, [setPaletteOpen, navigate, openTerminal, setChatOpen])

  const results = useMemo(() => {
    if (!query.trim()) return items
    const scored = items
      .map((it) => ({
        it,
        score: Math.max(fuzzyScore(query, it.label), fuzzyScore(query, it.keywords)),
      }))
      .filter((r) => r.score > -1)
      .sort((a, b) => b.score - a.score)
    return scored.map((r) => r.it)
  }, [query, items])

  useEffect(() => setIndex(0), [query])

  useEffect(() => {
    if (paletteOpen) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [paletteOpen])

  useEffect(() => {
    if (!paletteOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPaletteOpen(false)
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIndex((i) => Math.min(results.length - 1, i + 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIndex((i) => Math.max(0, i - 1))
      }
      if (e.key === 'Enter' && results[index]) {
        e.preventDefault()
        results[index].run()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [paletteOpen, results, index, setPaletteOpen])

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-ground/70 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPaletteOpen(false)
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
        >
          <motion.div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-edge bg-surface shadow-lift"
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-edge px-4">
              <Icon name="search" size={16} className="shrink-0 text-faint" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections, projects, blog, actions…"
                className="h-14 w-full bg-transparent text-[15px] text-ink placeholder:text-faint focus:outline-none"
                aria-label="Search commands"
              />
              <Kbd>esc</Kbd>
            </div>

            <div className="max-h-[46vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-faint">
                  No results for “{query}”.
                </p>
              )}
              {results.slice(0, 12).map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setIndex(i)}
                  onClick={item.run}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                    i === index ? 'bg-raised' : ''
                  }`}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-edge text-accent">
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate text-sm text-ink">{item.label}</span>
                  {item.hint && <span className="shrink-0 text-xs text-faint">{item.hint}</span>}
                  {i === index && <Icon name="arrow-right" size={15} className="shrink-0 text-accent" />}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 border-t border-edge px-4 py-2.5 text-[11px] text-faint">
              <span className="flex items-center gap-1">
                <Kbd className="!h-5">↑↓</Kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <Kbd className="!h-5">↵</Kbd> open
              </span>
              <span className="ml-auto flex items-center gap-1">
                <Icon name="command" size={14} /> {profile.firstName}·dev
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
