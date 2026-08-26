# Brand Guidelines

> Who Himanshu is, how he speaks, and the rules that keep the site honest.
> Brand = the person + the voice + the honesty core. The visual system is in
> [DESIGN_BIBLE.md](./DESIGN_BIBLE.md); this file is the *content* brand.

---

## 1. Brand essence

**Himanshu Arya** is an aspiring machine-learning engineer who builds real
things and refuses to pretend otherwise. The brand is built on one idea:

> **Learning by building — and honest before impressive.**

Everything on the site — the copy, the digital twin, the "Current Mission",
the empty certifications section — is a consequence of that. The emptiness is
a feature, not a bug.

### Identity facts (source: `src/data/profile.ts`)
- **Name:** Himanshu Arya (first name: Himanshu)
- **Age:** 18 (as recorded; keep honest as it changes)
- **Education:** B.Tech ECE, MANIT Bhopal, 2024–2028, second year
- **Location:** Bhopal, India · Open to remote
- **Roles:** Aspiring ML Engineer · ECE Student at MANIT · LLM & AI Agent
  Builder · Full Stack Developer
- **Tagline:** "Building intelligent products that solve real problems."
- **Availability:** Open to first ML / AI internship

---

## 2. Values & philosophy

Values (from `src/lib/twin/persona.ts`):
**Authenticity · Curiosity · Continuous learning · Building things ·
Problem solving · Shipping projects.**

The engineering philosophy the twin and the copy both repeat:
- Learning by building is better than endless tutorials.
- Building products matters more than collecting certificates.
- Using AI to learn faster is not cheating.
- If someone already solved a problem, learn from them and move forward.
- Real projects matter more than fake experience.
- UX matters as much as good code.
- Software should solve real problems.

### The mission quote (used as a sign-off)
> "I'm not trying to impress with fake experience. I'm building real
> skills—one project at a time." — `src/data/mission.ts`

---

## 3. Voice & tone

How Himanshu talks (applies to site copy **and** the twin):
- Friendly, curious, calm, occasionally humorous. Never arrogant, never
  overly formal, never a generic AI assistant.
- Simple and concrete — examples over jargon.
- **Honest above all.** If something isn't known: *"I haven't explored that
  deeply yet."* Never invent experience, internships, certifications, or
  achievements.
- Short answers. No walls of text.
- Occasionally shows excitement — celebrates cool technology.

Copy style notes: lowercase mono labels ("open terminal"), warm first-person,
no hype words, no "passionate about innovation" filler.

---

## 4. The three modes

| Mode | What it is | Trigger |
|---|---|---|
| **Standard** | The cinematic story: prologue + chapters | Default |
| **Recruiter Mode** ("Quick Overview") | A ~60-second scannable hiring dashboard. Quiet decorative motion, condensed sections, honest framing | Floating toggle (`RecruiterToggle`) |
| **Hacker Mode** | Easter-egg theme: brass → warm phosphor green | Konami code / `hack` terminal command |

Recruiter-mode copy lives in `src/data/recruiter.ts` (headline: "Aspiring
Machine Learning Engineer"; current focus: AI Agents, Machine Learning, LLM
Applications, Full Stack Development; looking for ML/AI/SWE internships).

---

## 5. Content rules (hard rules)

1. **No fabrication, ever.** Experience, internships, hackathons,
   certifications, achievements, stats — only what's real. Empty sections stay
   empty until real results land (`src/data/experience.ts` and
   `certifications.ts` are intentionally `[]`).
2. **Placeholders are marked.** Anything not real is visibly flagged in the
   code (`✍️ TO FILL`, `⚠️ PLACEHOLDER`, `TEMP`). Never ship a placeholder as
   real content.
3. **Honest numbers.** The hero stats show 0 hackathons / 0 internships / 0
   research papers until real milestones happen.
4. **The digital twin cannot lie.** Its engine is *structurally* unable to
   fabricate: it answers only from the knowledge files, and falls back to
   "I haven't explored that deeply yet." Preserve this property — it is the
   site's most distinctive trust feature.

---

## 6. The digital twin persona

The floating chat ("AIChat") answers as Himanshu. It is a separate *engine*
(`src/lib/twin/`) that retrieves from the `knowledge/*.md` files — which are
**also** a key source for this knowledge base.

- Offline-first, zero-key by default. Answers from `knowledge/personal.md`,
  `education.md`, `projects.md`, `skills.md`, `goals.md`, `mission.md`,
  `faq.md` + live data via `{{placeholders}}`.
- If `VITE_AI_ENDPOINT` + `VITE_AI_API_KEY` are set, it delegates to a real
  LLM using the persona + knowledge as the system prompt, and falls back to
  the local engine on failure.
- Identity/personality/honesty rules are centralized in
  `src/lib/twin/persona.ts` (also reused for the remote-LLM system prompt).

**Important for future Claude sessions:** the `knowledge/` folder now holds
*two* kinds of files — the twin's content files (the 7 listed above, imported
by `src/lib/twin/knowledge.ts`) and this project knowledge base
(`DESIGN_BIBLE.md`, `BRAND_GUIDELINES.md`, `SPRINT_HISTORY.md`, `ROADMAP.md`,
`CURRENT_STATE.md`). The twin only imports the 7 content files; the docs are
for humans/Claude, not the chatbot. **Keep the twin's 7 files and the docs
distinct.**

---

## 7. Messaging quick reference

- **Hero (TEMP copy — not finalized):** "NO. 001 — 2026" · "I design and
  build intelligent products — from the first idea to the shipped system." ·
  "Portfolio · 2026". See `src/components/hero/Hero.tsx` (marked `TEMP`).
- **Current mission items** (`src/data/mission.ts`): building AI-powered
  products · learning ML/DL · exploring LLMs/agents/RAG · improving full
  stack · preparing for internships · solving real-world problems through AI.
- **Skill story** (`src/data/skills.ts`): ML & AI · Deep Learning · LLMs ·
  AI Agents & Automation · Full Stack. Honest levels, "learning not expert."

---

## 8. Brand assets & status

| Asset | Status |
|---|---|
| Email / GitHub / LinkedIn | **Empty** — set in `src/data/profile.ts` when ready |
| Real project repo URLs | **Placeholder** (`<your-github>` in `projects.ts`) |
| Résumé | Generated from data → `/resume`; print-to-PDF A4 |
| Domain / sitemap | **Not set** — `sitemap.xml` uses `example.com` |
| Logo | `public/favicon.svg` (custom) |

Cross-ref: [ROADMAP.md](./ROADMAP.md) (the fill-in checklist) ·
[CURRENT_STATE.md](./CURRENT_STATE.md)
