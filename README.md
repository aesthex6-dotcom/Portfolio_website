# Himanshu Arya — AI/ML Engineer Portfolio

A premium, dark, cinematic single-page portfolio for an AI/ML engineer — built to feel **expensive**: Apple/Linear/OpenAI/Vercel-grade design, obsessive micro-interactions, and a handful of genuinely delightful "whoa" features. No glassmorphism, no rainbow gradients, no bloat.

Built with **React + TypeScript + Tailwind + Framer Motion + Vite**.

```
npm install
npm run dev        → http://localhost:5173
npm run build      → production build in dist/
```

---

## ✨ Features

**The essentials**

- **Cinematic Hero** — mouse-reactive particle constellation (Canvas2D, deliberately chosen over Three.js for performance), typewriter role rotation, animated headline, count-up stats, smooth scroll.
- **Interactive About** — click-to-expand journey timeline (2024 → now), education snapshot, goals.
- **Skills as a constellation** — an SVG neural-network graph with two-way hover linking, not a progress bar in sight.
- **Projects showcase** — premium cards with tilt + case-study modals (metrics, architecture, challenges, lessons learned).
- **Experience timeline**, **Certifications**, **Achievements** — all data-driven.
- **Markdown blog** — drop a `.md` file into `src/content/posts/`; it appears automatically.
- **Resume page** — generated from the _same_ data files, print-to-PDF (`Ctrl+P`, A4-ready, light theme).

**The "whoa" features**

- 🤖 **Digital twin chat** — a floating chat that answers as Himanshu, from editable knowledge files in [`knowledge/`](knowledge/README.md) + the site's live data. Works offline with zero keys; plug in a real LLM in 2 lines (see below).
- ⌨️ **Interactive terminal** (`Ctrl+`` or the nav button) — 30+ commands: `about`, `projects <slug>`, `sudo hire-himanshu`…
- ⌘ **Command palette** (`Ctrl+K`) — fuzzy-search sections, projects, blog posts, and actions.
- 📈 **Live GitHub stats band** — real user/repo numbers + a contribution heatmap, fetched from the public API with caching.
- **Hidden developer mode** — Konami code, and then some.

**Easter eggs** — see [the full reference](#-easter-eggs--secret-badges).

---

## 🗂 Project structure

```
knowledge/            # ✍️ digital twin knowledge files (EDIT THESE to teach the chatbot)
src/
├── components/
│   ├── ui/            # Reveal, SectionHeading, MagneticButton, Tilt, GlowOrbs…
│   ├── layout/        # Navbar, Footer, CommandPalette, ScrollToTop…
│   ├── hero/          # Hero + ParticleField (canvas)
│   ├── about/         # About + JourneyTimeline
│   ├── skills/        # SkillConstellation (SVG graph)
│   ├── projects/      # ProjectCard, ProjectModal (case study), ProjectVisual
│   ├── mission/       # Current Mission cards
│   ├── certifications/# Certifications cards
│   ├── achievements/  # Achievement cards
│   ├── blog/          # BlogSection + BlogCard
│   ├── contact/       # Contact
│   ├── statistics/    # GitHubStats, ContributionGraph, StatsBand
│   ├── terminal/      # Terminal overlay
│   ├── ai/            # AIChat (digital twin UI)
│   └── eggs/          # MatrixRain, RubberDuck, SnakeGame, KonamiListener
├── data/              # ★ single source of truth (EDIT THESE)
│   ├── profile.ts     # name, intro, journey, goals, stats, socials
│   ├── skills.ts      # 6 categories, each skill with level + blurb
│   ├── projects.ts    # full case studies
│   ├── experience.ts  # internships, research, freelance, leadership
│   ├── certifications.ts
│   ├── achievements.ts
│   ├── blog.ts        # post metadata + featured post
│   └── nav.ts         # nav sections
├── content/posts/     # 📝 blog posts (markdown)
├── hooks/             # useTypewriter, useKonami, useCountUp, useActiveSection…
├── lib/               # twin (digital twin), terminal, github client, posts, utils
├── pages/             # Home, BlogPostPage, ResumePage, NotFound
├── store/             # ui state (modals, hacker mode, badges), toast
├── App.tsx
└── types.ts
```

---

## ✏️ Making it yours

Everything you'd normally hard-code in a template lives in **`src/data/`** — edit one file and the hero, about, terminal, digital twin, resume, and contact all update together. The twin's *voice* and knowledge live separately in **`knowledge/`**.

| What you want to change                    | File                                                             |
| ------------------------------------------ | ---------------------------------------------------------------- |
| Name, intro, journey, goals, contact       | `src/data/profile.ts`                                            |
| Skills & levels                            | `src/data/skills.ts`                                             |
| Projects (incl. case-study fields)         | `src/data/projects.ts`                                           |
| Experience / certifications / achievements | `src/data/experience.ts`, `certifications.ts`, `achievements.ts` |
| Nav section labels & order                 | `src/data/nav.ts`                                                |
| Blog posts                                 | add a `.md` file to `src/content/posts/`                         |
| Colors, fonts, theme                       | `tailwind.config.ts` + `src/index.css` (CSS variables)           |

### Writing a blog post

Two steps, no build step:

1. **Write the body** — add a file at `src/content/posts/my-slug.md`. Plain markdown, GitHub-flavored (tables, code blocks) supported via remark-gfm.
2. **Register the metadata** — add an entry to `src/data/blog.ts`:

```ts
{
  slug: 'my-slug',            // must match the filename
  title: 'My first RAG pipeline',
  date: '2026-08-04',
  excerpt: 'A short teaser shown on the card and list.',
  tags: ['LLMs', 'RAG'],
  readingTime: '6 min read',
  featured: true,             // optional — pins it to the featured slot
}
```

The post route (`/blog/my-slug`) and terminal `blog` command pick it up automatically.

---

## 📈 Live GitHub stats

The stats band fetches from the public GitHub API and caches in `localStorage` (1 h TTL). Without a token you get the anonymous rate limit (60 req/h) — fine for occasional visits, but for reliable numbers set a token:

1. Create one at <https://github.com/settings/tokens> (any read scope works).
2. Copy `.env.example` → `.env` and set:

```
VITE_GITHUB_TOKEN=ghp_your_token
```

**Truthfulness:** the stats band stays hidden until you set `githubUsername` in `src/data/profile.ts`, and `ContributionGraph` renders **nothing** unless you pass a real flat `values` array (`52 × 7`, week-major) — no demo or fabricated data is ever shown. Wire it to GitHub's contributions API from `src/lib/github.ts` when you want a live heatmap.

---

## 🤖 Connecting a real LLM

By default the digital twin runs on a zero-key, fully-offline engine (`src/lib/twin/`) that retrieves answers from the editable [knowledge files](knowledge/README.md). To upgrade it to a real model, set two env vars:

```
VITE_AI_ENDPOINT=https://your-llm-proxy.example.com/chat
VITE_AI_API_KEY=sk-...
```

When configured, the twin sends its **persona + the knowledge files as the system prompt**, along with the message and recent history. Contract — it `POST`s JSON and expects plain text back:

```http
POST /chat
Authorization: Bearer sk-...
Content-Type: application/json

{ "message": "What has Himanshu built?", "system": "<persona + knowledge prompt>", "history": [] }
```

```http
200 OK
{ "text": "Himanshu is an ECE undergrad at MANIT Bhopal focused on machine learning, LLMs, and AI agents — see the About section…" }
```

Any OpenAI-compatible `/chat/completions` server works; adapt with a thin proxy. When either var is missing, the local engine answers instead — the site never breaks.

---

## ⌨️ Interactive terminal

Open with **`Ctrl+``** (backtick) or the nav button.

| Command                              | Does                             |
| ------------------------------------ | -------------------------------- |
| `help` / `?`                         | list commands                    |
| `about`, `whoami`                    | intro                            |
| `education`, `goals`                 | education & future plans         |
| `journey`, `timeline`                | the story, year by year          |
| `skills [all]`                       | skill matrix (compact or full)   |
| `projects <slug>`                    | full project dossier             |
| `experience`, `certifications`       | work & certs                     |
| `achievements`, `badges`             | badges (secret ones stay hidden) |
| `blog`, `status`, `stats`, `socials` | misc info                        |
| `ls`, `cat <file>`, `echo`, `date`   | unix-ish toys                    |
| `resume`, `cv`                       | go to the resume                 |
| `contact`                            | scroll to contact                |
| `matrix`, `hack`, `duck`, `game`     | summon the easter eggs           |
| `sudo hire-himanshu`                 | the legend                       |
| `exit`, `quit`, `clear`              | leave / clear                    |

`↑`/`↓` walk through history. `Esc` closes.

---

## 🥚 Easter eggs & secret badges

Badges persist in `localStorage` (`portfolio:badges`) and light up in the Achievements section.

| Trigger                             | What happens                                                  | Badge    |
| ----------------------------------- | ------------------------------------------------------------- | -------- |
| **Konami code** `↑↑↓↓←→←→BA`        | **Hacker Mode** — theme flips to phosphor-green               | `konami` |
| Type `hack` in the terminal         | Hacker Mode                                                   | `konami` |
| Type `matrix` in the terminal       | **Matrix rain** takeover (Esc to disengage)                   | `matrix` |
| Type `duck` in the terminal         | A draggable **rubber duck** appears — explain your bugs to it | `duck`   |
| Type `game` in the terminal         | **Retro snake** mini-game — score 10 to win                   | `snake`  |
| Type `sudo hire-himanshu`           | Grant the role. Permanently.                                  | `hire`   |
| Type `achievements` in the terminal | reveals the badge hint                                        | `badges` |

**Keyboard shortcuts:** `Ctrl+K` command palette · `Ctrl+`` terminal · `Esc`dismiss overlays ·`?` (from the Konami listener) shows a hints toast.

---

## 🧱 Tech stack

- **Vite 5** + **React 18** + **TypeScript 5.5** (strict)
- **Tailwind CSS 3.4** — CSS-variable design tokens, no glassmorphism
- **Framer Motion 11** — reveals, layout animations, spring physics
- **Canvas2D** for the particle constellation & matrix (perf over Three.js)
- **react-markdown + remark-gfm** — blog
- **react-router-dom 6** — routes
- **lucide-react** — icons

Manual chunk splitting keeps the initial bundle lean; all heavy routes (blog, resume) lazy-load.

---

## 🚀 Deployment

`npm run build` emits a static site in `dist/` — deploy anywhere (Netlify, Vercel, GitHub Pages, Cloudflare). For SPA routing add a rewrite to `index.html` (Vercel/Netlify do this automatically). Update the site URL in `public/robots.txt` + `public/sitemap.xml` before going live.

---

## 📜 Scripts

| Script              | What it does                            |
| ------------------- | --------------------------------------- |
| `npm run dev`       | dev server with HMR on `:5173`          |
| `npm run build`     | typecheck (`tsc -b`) + production build |
| `npm run preview`   | serve the production build locally      |
| `npm run typecheck` | TypeScript only                         |

---

MIT — build something intelligent with it.
