/**
 * The Digital Twin orchestrator.
 *
 * `twinReply(message, ctx)` answers as Himanshu by retrieving the best
 * matching section from `knowledge/*.md` and composing it in his voice.
 *
 * Offline-first and zero-key: the local engine answers from the knowledge
 * files. If `VITE_AI_ENDPOINT` + `VITE_AI_API_KEY` are configured, it instead
 * sends the persona + knowledge as the system prompt and delegates to the
 * remote model (same POST contract as the old assistant), falling back to
 * the local engine if the remote call fails.
 */
import { knowledgeSections, knowledgeAsPrompt } from './knowledge'
import { bestMatch } from './match'
import { fill, linksFor, chipsFor } from './compose'
import { buildSystemPrompt, fallbackReply, greeting } from './persona'
import type { TwinContext, TwinReply } from './types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function remoteTwin(message: string, ctx: TwinContext): Promise<string | null> {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT
  const key = import.meta.env.VITE_AI_API_KEY
  if (!endpoint || !key) return null
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        message,
        system: buildSystemPrompt(knowledgeAsPrompt()),
        history: ctx.history.slice(-8),
      }),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { text?: string; answer?: string }
    return data.text ?? data.answer ?? null
  } catch {
    return null
  }
}

/** Answer one user message as the digital twin. */
export async function twinReply(message: string, ctx: TwinContext): Promise<TwinReply> {
  // A little human-ish latency so the typing indicator reads naturally.
  await delay(400 + Math.random() * 400)

  const input = message.trim()
  if (!input) return { text: greeting(ctx.recruiter), topic: null }

  const remote = await remoteTwin(input, ctx)
  if (remote) return { text: remote }

  const { section, followUp } = bestMatch(input, knowledgeSections, ctx.topic)

  // The no-fabrication guardrail: if nothing matched, the fallback says so
  // plainly instead of inventing an answer.
  if (!section) return fallbackReply()

  const content = fill(section.content)
  const text = followUp
    ? `Sure, here's a bit more on that:\n\n${content}`
    : content

  return {
    text,
    links: linksFor(section),
    chips: chipsFor(section),
    topic: section.id,
  }
}
