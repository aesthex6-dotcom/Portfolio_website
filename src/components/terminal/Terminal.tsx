import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { BANNER, processCommand, type TermLine } from '@/lib/terminal'
import { scrollToId, cn } from '@/lib/utils'
import { profile } from '@/data/profile'
import { useUI } from '@/store/ui'

const toneClass: Record<string, string> = {
  cmd: 'text-ink',
  ok: 'text-ok',
  accent: 'text-accent',
  info: 'text-muted',
  dim: 'text-faint',
  error: 'text-danger',
  heading: 'font-semibold text-ink',
  warn: 'text-warn',
  raw: 'text-muted',
}

export function Terminal() {
  const {
    terminalOpen,
    closeTerminal,
    setHackerMode,
    setMatrixActive,
    setDuckVisible,
    setSnakeOpen,
    unlockBadge,
  } = useUI()
  const navigate = useNavigate()

  const [lines, setLines] = useState<TermLine[]>(BANNER)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset on open + focus
  useEffect(() => {
    if (terminalOpen) {
      setLines(BANNER)
      setInput('')
      setHistory([])
      setHistIdx(-1)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [terminalOpen])

  // Keep the scroll at the bottom as lines stream in.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  useEffect(() => {
    if (!terminalOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTerminal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [terminalOpen, closeTerminal])

  const run = (raw: string) => {
    const trimmed = raw.trim()
    const result = processCommand(trimmed, {
      openSection: (id) => {
        closeTerminal()
        setTimeout(() => scrollToId(id), 80)
      },
      navigate: (path) => {
        closeTerminal()
        navigate(path)
      },
      setHackerMode,
      setMatrixActive,
      setDuckVisible,
      openSnake: () => setSnakeOpen(true),
      unlockBadge,
      closeTerminal,
    })

    if (trimmed) {
      setHistory((h) => [...h, trimmed])
      setHistIdx(-1)
    }

    setLines((prev) => [
      ...prev,
      { text: `${profile.firstName.toLowerCase()}@portfolio:~$ ${trimmed}`, tone: 'cmd' },
      ...result.lines,
    ])
    if (result.clear) setLines([])
    setInput('')
  }

  const onInputKey = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      run(input)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.max(0, histIdx + 1)
      if (history[history.length - 1 - next] !== undefined) {
        setHistIdx(next)
        setInput(history[history.length - 1 - next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = histIdx - 1
      if (next < 0) {
        setHistIdx(-1)
        setInput('')
      } else {
        setHistIdx(next)
        setInput(history[history.length - 1 - next])
      }
    }
  }

  return (
    <AnimatePresence>
      {terminalOpen && (
        <motion.div
          className="fixed inset-0 z-[85] flex items-center justify-center bg-ground/80 p-3 backdrop-blur-sm md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && closeTerminal()}
          role="dialog"
          aria-modal="true"
          aria-label="Interactive portfolio terminal"
        >
          <motion.div
            className="flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-edge bg-[#0a0a10] shadow-lift"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Title bar */}
            <div className="flex items-center gap-2 border-b border-edge px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-[12px] text-faint">
                {profile.firstName.toLowerCase()}@portfolio · zsh
              </span>
              <button
                type="button"
                onClick={closeTerminal}
                className="ml-auto rounded-md px-2 py-0.5 font-mono text-[11px] text-faint transition-colors hover:bg-raised hover:text-ink"
              >
                esc
              </button>
            </div>

            {/* Output */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed"
            >
              {lines.map((line, i) => (
                <pre
                  key={i}
                  className={cn('whitespace-pre-wrap break-words', toneClass[line.tone ?? 'info'])}
                >
                  {line.text || ' '}
                </pre>
              ))}
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 border-t border-edge px-4 py-3 font-mono text-[13px]"
              onSubmit={(e) => {
                e.preventDefault()
                run(input)
              }}
            >
              <span className="shrink-0 text-accent">
                {profile.firstName.toLowerCase()}@portfolio:<span className="text-accent">~</span>$
              </span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKey}
                className="flex-1 bg-transparent text-ink caret-accent focus:outline-none"
                placeholder="type help"
                aria-label="Terminal input"
                spellCheck={false}
                autoComplete="off"
              />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
