/**
 * Shared types for the Digital Twin engine.
 */

/** A parsed unit of knowledge extracted from a `knowledge/*.md` file. */
export interface KnowledgeSection {
  /** Source filename without extension, e.g. `faq`. */
  file: string
  /** Stable id: `${file}-${slug(title)}`. Used for topic tracking. */
  id: string
  /** The `## Heading` that introduced this section. */
  title: string
  /** Phrases from the `**Keywords:**` line (or derived from the title). */
  keywords: string[]
  /** The answer body, still containing `{{placeholders}}`. */
  content: string
}

/** A clickable link the chatbot attaches to a reply. */
export interface TwinLink {
  label: string
  url: string
}

/** The reply the twin engine produces for one user message. */
export interface TwinReply {
  text: string
  links?: TwinLink[]
  /** Suggested follow-up questions shown as tappable chips. */
  chips?: string[]
  /** The matched section id — the engine's "current topic". */
  topic?: string | null
}

/** What the engine knows about the conversation so far. */
export interface TwinContext {
  /** Previous messages (user + assistant), oldest first. */
  history: { role: 'user' | 'assistant'; text: string }[]
  /** The last matched section id, if any. */
  topic?: string | null
  /** Whether the site is in recruiter mode. */
  recruiter: boolean
}
