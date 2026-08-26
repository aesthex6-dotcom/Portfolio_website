import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { twinReply } from '@/lib/twin/twin'
import { greeting } from '@/lib/twin/persona'
import { profile } from '@/data/profile'
import { cn } from '@/lib/utils'
import { useUI } from '@/store/ui'
import { useDraggableWindow } from '@/hooks/useDraggableWindow'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Icon } from '@/components/ui/Icon'

interface Message {
  role: 'user' | 'assistant'
  text: string
  links?: { label: string; url: string }[]
  chips?: string[]
}

type QuickItem = { label: string; question: string } | { label: string; href: string }

const QUICK_QUESTIONS: QuickItem[] = [
  { label: 'Who are you?', question: 'Tell me about yourself' },
  { label: 'Why AI?', question: 'Why did you choose AI?' },
  { label: 'Current Mission', question: "What's your current mission?" },
  { label: 'Best Project', question: 'Which is your best project?' },
  { label: 'Career Goals', question: 'What are your career goals?' },
  { label: 'Download Resume', href: '/resume' },
]

function TypingDots() {
  return (
    <span className="flex items-center gap-1.5 px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-accent"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 1, delay: i * 0.18 }}
        />
      ))}
    </span>
  )
}

/** Render assistant markdown in a small, chat-appropriate style. */
function TwinMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node: _node, ...props }) => (
          <a
            {...props}
            className="text-accent underline decoration-edge-strong underline-offset-2 hover:text-ink"
            target={props.href?.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
          />
        ),
        ul: ({ node: _node, ...props }) => (
          <ul className="my-1 list-disc space-y-0.5 pl-4 text-[var(--text-muted)]" {...props} />
        ),
        ol: ({ node: _node, ...props }) => (
          <ol className="my-1 list-decimal space-y-0.5 pl-4 text-[var(--text-muted)]" {...props} />
        ),
        p: ({ node: _node, ...props }) => (
          <p className="my-1 first:mt-0 last:mb-0 text-[var(--text-muted)]" {...props} />
        ),
        strong: ({ node: _node, ...props }) => (
          <strong className="font-semibold text-ink" {...props} />
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  )
}

export function AIChat() {
  const { chatOpen, setChatOpen, recruiterMode } = useUI()
  const [messages, setMessages] = useState<Message[]>([])
  const [topic, setTopic] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery('(max-width: 639px)')
  const win = useDraggableWindow({ id: 'chat', defaultPos: { right: 24, bottom: 24 }, isMobile })

  useEffect(() => {
    if (chatOpen) {
      win.raise()
      setMessages([{ role: 'assistant', text: greeting(recruiterMode) }])
      setTopic(null)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  // `win.raise` is stable; `win` itself is recreated each render, so it must not be a dep.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen, recruiterMode, win.raise])

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim()
    if (!text || typing) return
    setInput('')
    const history = messages
    setMessages((m) => [...m, { role: 'user', text }])
    setTyping(true)
    const reply = await twinReply(text, { history, topic, recruiter: recruiterMode })
    setTyping(false)
    setTopic(reply.topic ?? null)
    setMessages((m) => [
      ...m,
      { role: 'assistant', text: reply.text, links: reply.links, chips: reply.chips },
    ])
  }

  const questions = recruiterMode
    ? [{ label: '60-sec overview', question: 'Give me a 60-second overview' }, ...QUICK_QUESTIONS]
    : QUICK_QUESTIONS

  // Escape closes the chat (only when not dragging).
  useEffect(() => {
    if (!chatOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setChatOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chatOpen, setChatOpen])

  const windowClass = isMobile
    ? 'no-print fixed inset-x-3 bottom-3 z-[75] flex max-h-[80vh] w-auto flex-col overflow-hidden rounded-2xl border border-edge bg-surface shadow-lift'
    : 'no-print flex w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-edge bg-surface shadow-lift'

  return (
    <AnimatePresence>
        {chatOpen && (
          <motion.div
            ref={win.ref}
            className={windowClass}
            style={isMobile ? undefined : win.style}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label={`Chat with ${profile.firstName}'s digital twin`}
            onPointerDown={win.raise}
          >
            {/* Header — drag handle on desktop */}
            <div
              {...(!isMobile ? win.bind : {})}
              className="border-b border-edge bg-raised/40 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent font-display text-base font-semibold text-base">
                    {profile.firstName[0]}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-raised bg-ok" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-sm font-semibold text-ink">{profile.name}</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-ok">
                    <span className="h-1.5 w-1.5 rounded-full bg-ok" />
                    digital twin · aims to reflect his thinking
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!isMobile && (
                    <button
                      type="button"
                      onClick={win.reset}
                      className="grid h-7 w-7 place-items-center rounded-full text-faint transition-colors hover:bg-raised hover:text-ink"
                      aria-label="Reset position"
                      title="Reset to default position"
                    >
                      <Icon name="target" size={13} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setChatOpen(false)}
                    className="grid h-8 w-8 place-items-center rounded-full text-faint transition-colors hover:bg-raised hover:text-ink"
                    aria-label="Close chat"
                  >
                    <Icon name="x" size={15} />
                  </button>
                </div>
              </div>
              <p className="mt-2 text-[10.5px] leading-snug text-[var(--text-muted)]">
                This Digital Twin is built from {profile.firstName}&apos;s projects, interests,
                writing, and goals. It aims to reflect how he thinks and communicates, but like any
                AI, it may occasionally make mistakes or lack context.
              </p>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="max-h-[46vh] min-h-[260px] space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m, i) => (
                <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                      m.role === 'user'
                        ? 'rounded-br-sm bg-accent text-base'
                        : 'rounded-bl-sm border border-edge bg-raised/50 text-[var(--text-muted)]',
                    )}
                  >
                    {m.role === 'assistant' ? (
                      <TwinMarkdown text={m.text} />
                    ) : (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    )}

                    {m.links && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.links.map((l) =>
                          l.url.startsWith('http') || l.url.startsWith('#') ? (
                            <a
                              key={l.label}
                              href={l.url}
                              target={l.url.startsWith('http') ? '_blank' : undefined}
                              rel="noopener noreferrer"
                              className="rounded-full border border-accent/30 px-2.5 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/10"
                            >
                              {l.label}
                            </a>
                          ) : (
                            <Link
                              key={l.label}
                              to={l.url}
                              className="rounded-full border border-accent/30 px-2.5 py-1 text-[11px] font-medium text-accent transition-colors hover:bg-accent/10"
                            >
                              {l.label}
                            </Link>
                          ),
                        )}
                      </div>
                    )}

                    {m.chips && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.chips.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => send(c)}
                            disabled={typing}
                            className="rounded-full border border-edge px-2.5 py-1 text-[11px] text-[var(--text-muted)] transition-colors hover:border-edge-strong hover:text-ink"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-edge bg-raised/50 px-3 py-1 text-[var(--text-muted)]">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Suggested questions */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-2">
              {questions.map((q) =>
                'href' in q ? (
                  <Link
                    key={q.label}
                    to={q.href}
                    className="shrink-0 rounded-full border border-edge px-2.5 py-1 text-[11px] text-[var(--text-muted)] transition-colors hover:border-edge-strong hover:text-ink"
                  >
                    {q.label}
                  </Link>
                ) : (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => send(q.question)}
                    className="shrink-0 rounded-full border border-edge px-2.5 py-1 text-[11px] text-[var(--text-muted)] transition-colors hover:border-edge-strong hover:text-ink"
                  >
                    {q.label}
                  </button>
                ),
              )}
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 border-t border-edge px-3 py-3"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask ${profile.firstName}…`}
                className="h-10 flex-1 rounded-full border border-edge bg-raised/50 px-4 text-[13px] text-ink placeholder:text-[var(--text-faint)] transition-[border-color,box-shadow] duration-300 hover:border-edge-strong focus:border-accent focus:outline-none"
                aria-label={`Ask ${profile.firstName}`}
              />
              <button
                type="submit"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-40"
                disabled={!input.trim()}
                aria-label="Send"
              >
                <Icon name="send" size={15} />
              </button>
            </form>
          </motion.div>
        )}
    </AnimatePresence>
  )
}
