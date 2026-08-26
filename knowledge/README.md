# 📖 Digital Twin — Knowledge Files

These markdown files are the chatbot's entire knowledge. It answers *from
these files* — nothing is hardcoded in the chat logic. To teach the chatbot
something new, edit these files. No code changes needed.

## How it works

Each file is split into **`## Section`** blocks. Every section is a
knowledge item the chatbot can be asked about:

```markdown
## Why AI
**Keywords:** why ai, reason, motivation, passion, love, career
The actual answer, written in Himanshu's voice…
```

- **`## Heading`** — the topic. The chatbot picks a section by matching the
  user's question against its keywords, so write headings naturally.
- **`**Keywords:**`** *(optional)* — comma-separated phrases that trigger
  this section. Whole-phrase matches score highest, so prefer full phrases
  like `why ai` over single words like `ai`.
- **Body** — everything after the keywords line is the answer. Keep it
  conversational and honest. Markdown works (bold, lists, links).

## Placeholders

The chatbot fills these live from the site's data files — so dynamic lists
never get duplicated here:

| Placeholder | Filled with |
|---|---|
| `{{name}}`, `{{firstName}}`, `{{age}}` | Who he is (`src/data/profile.ts`) |
| `{{degree}}`, `{{school}}`, `{{period}}` | Education (`profile.ts`) |
| `{{location}}`, `{{availability}}` | Location / availability (`profile.ts`) |
| `{{roles}}`, `{{intro}}` | Roles / intro paragraphs (`profile.ts`) |
| `{{goals}}` | Career goals bullets (`profile.ts`) |
| `{{mission}}`, `{{missionQuote}}` | Current mission (`src/data/mission.ts`) |
| `{{skills}}` | Skill category bullets (`src/data/skills.ts`) |
| `{{projectsList}}`, `{{bestProject}}`, `{{projectCount}}` | Real projects (`src/data/projects.ts`) |
| `{{overview}}` | The auto-composed 60-second summary |
| `{{contactLinks}}` | Live contact links (`profile.ts`) |

A placeholder can have a fallback for when its data is empty:
`{{bestProject|the one I'm building right now}}` → uses the fallback text if
the data is empty.

## Voice guidelines

Write like Himanshu talks:

- Friendly, curious, calm, occasionally humorous.
- Simple and concrete — use examples, avoid jargon.
- Honest above all. If something isn't known, say
  *"I haven't explored that deeply yet."* — never invent experience,
  internships, certifications, or achievements.
- Short answers. No walls of text.

## Adding a new topic

1. Open the file that fits (or create `knowledge/whatever.md`).
2. Add a new `## Heading`, an optional `**Keywords:**` line, and the answer.
3. Save. The chatbot picks it up immediately (Vite hot-reloads it).
