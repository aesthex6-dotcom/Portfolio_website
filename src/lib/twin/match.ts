/**
 * Retrieval: turns a user message into the best-matching knowledge section.
 *
 * Scoring is phrase-aware — every token of a keyword phrase must appear in
 * the message to score. This naturally disambiguates near-identical topics
 * (e.g. "why do you want an internship" → goals, "any internship experience?"
 * → the honest experience answer) without hardcoded rules.
 */
import type { KnowledgeSection } from './types'

export const tokens = (s: string): string[] =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

const FOLLOWUP_RE =
  /^(tell me more|more about that|and|what else|elaborate|explain more|go on|continue|sounds cool|sounds good|nice|interesting|anyway|also|how about|anything else|what about that|okay|alright)\b/i

export function isFollowUp(input: string): boolean {
  const t = input.trim().toLowerCase()
  if (!t) return false
  if (t.length <= 3) return true // "and?", "ok", "oh", "ya"
  return FOLLOWUP_RE.test(input)
}

export function scoreSection(input: string, section: KnowledgeSection): number {
  const lower = input.toLowerCase()
  const words = new Set(tokens(input))
  let score = 0
  for (const kw of section.keywords) {
    const kwTokens = tokens(kw)
    if (kwTokens.length && kwTokens.every((t) => words.has(t))) {
      score += 2 + kwTokens.length // longer matched phrases score higher
      // A distinctive word that appears verbatim beats a generic one ("who",
      // "about") that merely happens to share a token — breaks ties fairly.
      if (lower.includes(kw.toLowerCase())) score += 3
    }
  }
  // Title words give a small boost so headings without keywords still help.
  for (const w of tokens(section.title)) {
    if (words.has(w)) score += 0.5
  }
  return score
}

export interface MatchResult {
  section: KnowledgeSection | null
  /** True when the reply re-uses the current topic (a bare follow-up). */
  followUp: boolean
}

export function bestMatch(
  input: string,
  sections: KnowledgeSection[],
  topic?: string | null,
): MatchResult {
  let best: KnowledgeSection | null = null
  let bestScore = 0
  for (const s of sections) {
    const sc = scoreSection(input, s)
    if (sc > bestScore) {
      bestScore = sc
      best = s
    }
  }

  // A bare follow-up with no new topic ("tell me more", "and?") keeps the
  // conversation on the last matched section.
  if (bestScore === 0 && isFollowUp(input) && topic) {
    const sec = getById(sections, topic)
    if (sec) return { section: sec, followUp: true }
  }

  return { section: bestScore > 0 ? best : null, followUp: false }
}

function getById(sections: KnowledgeSection[], id: string): KnowledgeSection | undefined {
  return sections.find((s) => s.id === id)
}
