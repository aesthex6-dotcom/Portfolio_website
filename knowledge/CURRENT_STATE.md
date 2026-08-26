# Current State

> Where the project stands **today** (snapshot: 2026-08-09). Read this first
> to get oriented; read the other four docs for the *why* and the *next*.

**In one line:** a premium, dark, cinematic, fully data-driven portfolio for
Himanshu Arya — React + TypeScript + Tailwind + Framer Motion + Vite — with a
digital twin chat, interactive terminal, recruiter mode, the Lodestar
navigation guide, and (Sprint 9) a full **art-direction / editorial-system
pass**: no more component-library cards in content sections — ruled index
rows, masked typographic reveals, camera-like scroll, coordinated floating
controls. **Sprint 10 (refinement)**: Hero copy finalized, unified
micro-interactions + icon language, typography/spacing audit, and a
performance pass — one cinematic motion language everywhere. **Sprint 11
(Industrial art direction)**: the palette reset from "Warm Noir" to an
industrial, engineered system — deep charcoal + cool off-white + lime green
as a *functional-only* accent, a scroll-drawn blueprint background
(`EngineeredField`), and bolder architectural typography. **Sprint 12
(experience & premium interaction pass)**: every section earned one memorable
scroll-driven interaction — a living background (routing packet + graticule),
a premium portrait placeholder frame, About unfolding like a blueprint,
Skills as an instrument, Projects as cinematic presentation scenes, Contact as
a secure channel, and the floating controls raised into the composition. **Sprint 13 (refinement &
premium polish)**: no redesign — the root cause of invisible text fixed at the
token level (`--faint #62635f → #82847e`, all alpha overrides stripped),
procedural film grain (512px stitched fractalNoise, no visible repeat) + a
vignette layer, scroll-scrubbed `Reveal` (constructs/settles/rests, reverses
perfectly on scroll-up), condensed project-scene pacing, a new **Atmosphere**
mood control in the dock (not monitor brightness — lerps room light/grain/
vignette, perfectly smooth), real hover depth on panels/buttons/inputs, and the
navigation rail verified overlap-free as one system.
**Content is the remaining gap** (several fields and three projects are marked
placeholders). **This is the final sprint — the site stopped for user review.**

---

## 1. Tech stack

React 18 · TypeScript 5.5 (strict) · Vite 5 · Tailwind 3.4 (class dark mode,
CSS-variable tokens) · Framer Motion 11 · react-router-dom · react-markdown +
remark-gfm · lucide-react · clsx + tailwind-merge.
Manual chunk splitting (`vendor`, `motion`, `markdown`, `icons`) + lazy-loaded
heavy routes (blog, resume) keep the bundle lean. Path alias `@/` → `src/`.

**Not a git repository** — no version control yet (worth adding; history is
otherwise only in file timestamps).

---

## 2. What's implemented

### Routes
| Route | Page |
|---|---|
| `/` | Home (standard or recruiter mode) |
| `/blog/:slug` | Blog post |
| `/resume` | Resume (print-to-PDF A4, light theme) |
| `*` | NotFound |

### Home — standard mode (story order) — editorial system (Sprint 9)
Hero (editorial spread, scroll dolly, **premium portrait frame**) → About
(statement + ruled meta + journey timeline, **blueprint construction frame +
Education spec block**) → Skills (constellation + ruled "top picks" index,
**instrument diagnostics**) → Projects (**cinematic presentation scenes** +
case-study modals + architecture explorer) → Mission (ruled status rows +
pull-quote) → StatsBand (GitHub live stats + contribution heatmap) →
Certifications (reserved EmptyState / ruled rows) → Achievements (ruled rows +
secret badges as a ruled index) → Blog (reserved EmptyState / ruled rows) →
Contact (**secure-channel editorial spread**: mono "Channels" + scroll-drawn
Transmit line + ruled quick message).

Content sections use `.scene` + `.rule-row`/`.rule-list` + masked `MaskLines`
titles. Cards survive only as **overlay surfaces** (project modal, palette,
terminal).

### Home — recruiter mode ("Quick Overview")
RecruiterHero → RecruiterAbout → RecruiterSkills → RecruiterProjects →
Mission → RecruiterResumeCTA → Contact. Toggled by the floating
`RecruiterToggle` (also quiets decorative CSS motion via `html.recruiter-mode`).
**Note:** recruiter mode and the project case-study modal intentionally keep
the compact card layout — they are a separate quick-overview persona, not the
editorial reading experience. Not a regression.

### Global systems
- **The Lodestar** — navigation guide replacing the navbar (top-right star,
  progress ring, directional filament, hover constellation / mobile sheet,
  emergence after the prologue). Owns ⌘K + Ctrl+` shortcuts.
- **Command palette** (⌘K) — fuzzy-search sections, projects, blog, actions.
- **Terminal** (Ctrl+`) — 30+ commands incl. easter eggs and
  `sudo hire-himanshu`.
- **Digital twin chat** — offline, zero-key; answers from `knowledge/*.md` +
  live data. Structurally cannot fabricate.
- **Soundtrack player** — vinyl button, playlists (`src/data/playlists.json`).
- **UtilityDock** — the coordinated right-edge control rail (vinyl + chat + an
  **AtmosphereControl** mood button share one anchor and hide/show each other;
  the dock stays hidden through the hero cold-open until the visitor scrolls
  past the fold). Raised off the viewport floor via the
  `--dock-bottom: clamp(4.5rem, 15vh, 7.5rem)` token — dock, chat, and
  soundtrack panels all derive from that one number. No colliding buttons.
- **Atmosphere system** — a mood control (low / neutral / high), not monitor
  brightness. Low deepens the charcoal, closes the vignette, thickens the grain,
  softens highlights; high lifts the room. Interpolates ONLY the bg-family +
  faint + grain/vignette tokens over 900ms (JS rAF + easeOutCubic) so
  `html.hacker-mode` CSS still wins; persists
  `localStorage['portfolio:atmosphere']`; reduced motion snaps.
- **Easter eggs** — Konami code → Hacker Mode, Matrix rain, rubber duck,
  snake game; 5 secret badges persist in `localStorage` (`portfolio:badges`).
- **Film grain + vignette** overlays (procedural 512px stitched fractalNoise,
  no visible repeat), SkipLink, ScrollToTop, toast store.

---

## 3. Data layer status

Single source of truth = `src/data/*`. Table reflects *today*:

| File | Status | Notes |
|---|---|---|
| `profile.ts` | **Placeholders** | `email`, `githubUsername`, `socials.github`, `socials.linkedin` empty (`✍️`); stats honest zeros; age 18 |
| `skills.ts` | Filled | 5 categories, honest levels |
| `projects.ts` | ⚠️ **3 placeholders** | `kumar-portfolio` real + featured; `agentkit`, `gesturesense`, `mlab` are NOT shipped work — replace before going live; all GitHub URLs `<your-github>` |
| `experience.ts` | Empty `[]` | By design (no roles yet) |
| `certifications.ts` | Empty `[]` | By design |
| `achievements.ts` | Public empty; 5 secret | Secret = easter-egg unlock badges only |
| `blog.ts` + `src/content/posts/` | Empty | Drop `.md` + register metadata |
| `mission.ts` | Filled | 6 items + honesty quote |
| `nav.ts` | Filled | Footer + command-palette sections |
| `chapters.ts` | Filled | Lodestar chapters (post-prologue) |
| `recruiter.ts` | Filled | Recruiter-mode framing |
| `architecture/` | 1 real spec | `kumar-portfolio.json` + `_template.json` |

---

## 4. Design system status

The **"Industrial"** system is **fully established** (Sprint 11): charcoal
tokens, cool off-white, **lime-green as a functional-only accent**, Sonder hero,
Space Grotesk / Inter / JetBrains Mono, hairline texture, film grain + paper
tooth, masked reveals, house ease `[0.16, 1, 0.3, 1]`, and the fixed
`EngineeredField` blueprint background. As of **Sprint 9** the **editorial
system is implemented across all eight content sections** — the site no longer
reads as a React card-portfolio. Full reference:
[DESIGN_BIBLE.md](./DESIGN_BIBLE.md).

### What Sprint 9 changed (art-direction pass)
- Sections → `.scene` (consistent rhythm) with `.sonder-mark` chapter
  numerals; titles → `MaskLines` masked display lines.
- Card grids → `.rule-row`/`.rule-list` ruled indexes (About, Skills, Projects,
  Mission, Achievements, Certifications, Blog, Contact).
- `Reveal` → clip-path curtain reveals; Hero gained a scroll dolly (frame lags,
  title lifts + recedes).
- Bottom-right controls → one `UtilityDock` (no more button collisions).
- Icons → consistent Streamline line language (single-weight, no colored
  tiles). Verified: `tsc -b` + production `dist/` build pass.

### What Sprint 10 changed (refinement pass)
- **Hero copy finalized** — no more `TEMP` markers: running head
  "PORTFOLIO — 2026", furniture "EDITION 01 — 2026", supporting line
  "I design and build intelligent products — from the first idea to the
  shipped system."
- **Scroll storytelling** — `SectionHeading` rewrite: every chapter numeral
  drifts on the far plane (parallax) and the description settles on the beat
  after the masked title lines.
- **Unified micro-interactions** — global default `transitionDuration: 300ms`,
  one press language (`active:scale-95`), token-based focus rings.
- **Icon language complete** — lucide down to the GitHub octocat only; all
  sizes normalized to the 14px Streamline grid.
- **Typography/spacing audit** — three-tier body scale confirmed; the one drift
  (About intro) fixed.
- **Performance pass** — `will-change` now lifecycle-managed
  (`willChange: 'auto'` in `Reveal` + `Tilt`); recruiter entrances + project
  cards converted to the house cinematic ease. One motion language everywhere.
- Verified: `npx tsc -b` + production `dist/` build pass (2026-08-09).

### What Sprint 11 changed (Industrial art direction)
- **Palette reset** — warm ink-black + brass → **deep neutral charcoal
  `#171717`**, cool off-white `#f5f7f2`, and **lime `#c7ff38` as the single
  functional accent**. All hairlines/type re-derived to cool off-white.
- **Green discipline** — green is functional-only: active nav/chapter,
  command-palette selection, terminal prompt, progress, hover/focus. Six
  content/decorative violations fixed to neutral; the page reads ~mostly
  monochrome.
- **`EngineeredField` background** — a fixed, full-viewport SVG blueprint
  layer (compass ring, crosshair, dimension arc, datum baseline, signal path)
  that draws itself in with scroll. Neutral off-white strokes, zero green.
- **Typography confidence** — hero Sonder scaled down to
  `clamp(3.25rem,13vw,9.5rem)` (impact without overwhelm); `.scene-title` /
  `.statement` to `font-bold`, tracking `-0.035em`.
- **Texture tune** — grain `0.03→0.035`, paper tooth `0.012→0.015`.
- **Warm light neutralized** — HeroBackground, GlowOrbs, ProjectVisual,
  Contact, NotFound, SoundtrackPlayer, SnakeGame, Lodestar, and the skills
  constellation all re-derived to cool neutrals (lime reserved for live/active
  states only).
- Verified: `npm run typecheck` + `npm run lint` + `npm run build` all pass
  (2026-08-09).

### What Sprint 12 changed (experience & premium interaction pass)
- **Living background** — `EngineeredField` gained a routing packet (travels
  node→node with scroll, rewinds on scroll-up), node-opacity windows, a
  far-plane second route line, a concentric graticule, and faint mono coordinate
  labels. Neutral off-white strokes, zero green, safe-zone preserved.
- **Hero portrait placeholder** — new `ui/PhotoFrame.tsx`: hairline + corner
  ticks + inner hairline + mono `FIG.`/label annotation + masked wipe-in;
  `photo` empty → elegant "Photo reserved" aperture placeholder. Data-driven via
  `profile.photo`.
- **About unfolding construction** — top/bottom hairlines + 4 corner brackets
  draw in with scroll, mono annotations (`SEC.01 — PROFILE`,
  `23.2158N · 77.4083E`). **Education** → spec block (`SpecRow` mono label +
  dotted leader + value) + `FIG.02 — CAMPUS` photo frame (placeholder kept —
  no suitable public-license daylight MANIT exterior found; data-driven so a
  real photo drops in).
- **Skills diagnostics** — instrument header (live dot + `Instrument · skill
  matrix` + Categories/Nodes/Links/Stable), `signal: n/100` readout, `SIG.{level}`
  index, "Ranked by signal · an honest current state".
- **Projects cinematic scenes** — `ProjectScene`: visual + text wipe in from
  opposite sides, background plate at its own parallax depth, metadata staggers
  progressively, everything exits together. Flip alternates sides per project.
- **Contact secure channel** — mono "Channels" framing, scroll-drawn Transmit
  line, ruled fields with codes (`CHN.03 — MSG`, field 01/02/03), corner ticks.
- **Raised control rail** — new `--dock-bottom: clamp(4.5rem,15vh,7.5rem)`
  token; dock + chat + soundtrack derive from it; Recruiter toggle aligned
  right-7 under the Lodestar.
- Verified: `npm run typecheck` + `npm run lint` + `npm run build` all pass
  (2026-08-09, 2329 modules in 6.33s). **Final sprint — stopped for user review.**

### What Sprint 13 changed (refinement & premium polish)
A refinement pass, not a redesign — the brief forbid touching the color system,
information architecture, or adding another visual language. It started by
reviewing every Sprint 12 interaction, then refined in coordinated passes.

- **Invisible text — fixed at the system level (the root cause).** The token
  itself was too quiet on charcoal: `--faint` `#62635f → #82847e` (~5.1:1 vs the
  `#171717` ground), and every `text-faint/XX` alpha override was stripped. The
  Atmosphere system carries this forward: faint is lerped per level but never
  drops below ~4.9:1 against its ground (low `#7d7f76`, neutral `#82847e`, high
  `#8b8d87`).
- **Editorial clutter removed.** Decorative `— • |` separators in UI labels →
  `·`. Kept the deliberate print-voice dashes in the Hero's edition labels
  (`EDITION 01 — 2026`, `PORTFOLIO — 2026`).
- **Grain & materiality.** Rebuilt as a procedural 512px stitched
  `fractalNoise` plate shuffled by `steps(6)` transform keyframes — no visible
  repeat. Added a `.vignette` layer (default 0.45) the grain composes with.
- **Scroll quality.** `Reveal` is now scroll-**scrubbed** — progress drives the
  clip-path inset, opacity, and drift, so elements construct, settle, and rest,
  and scrolling up **perfectly reverses** the reveal. Inert `delay`/`once`
  props removed. Foreground/mid/background all respond at different depths.
- **Projects pacing.** `ProjectScene` condensed from six opacity cascades to
  four deliberate scroll beats (visual → title+body → metadata → CTA) so
  assembly reads as *positioned*, not timed; the redundant status badge is off
  in scene visuals (spec rows own it; cards keep it).
- **Micro-interactions.** Real depth replaces flat hovers: `panel-hover` /
  `btn-primary` / `btn-ghost` gained offset black shadows (hover + active);
  form inputs gained `hover:border-edge-strong` + a 1px lime underglow on focus
  (`focus:shadow-[0_1px_0_var(--accent)]`).
- **Atmosphere — mood, not brightness (NEW).** `store/atmosphere.tsx` +
  `AtmosphereControl` in the dock. Three levels lerp the room over 900ms
  (easeOutCubic) — low = deeper charcoal, stronger vignette, heavier grain,
  softer highlights; high = lighter charcoal, reduced grain, softer shadows,
  brighter surfaces. Interpolates only bg-family + faint + grain/vignette (NOT
  accent/text/muted) so hacker-mode CSS selectors still win; persists
  `localStorage['portfolio:atmosphere']`; reduced motion snaps.
- **Navigation coordinated.** Verified every floating element (Lodestar,
  Recruiter toggle, Soundtrack, AIChat, Dock) as one coordinate system — nothing
  overlaps, nothing competes. The chat button now yields to the soundtrack panel
  (`!isOpen && !chatOpen`), completing the "one panel open at a time" rule.
- **Template-feel sweep.** Walked every section page by page; nothing needed a
  redesign. Footer/Resume/NotFound audited and on-voice.
- Verified: `npm run typecheck` + `npm run lint` + `npm run build` all pass
  (2026-08-09, 2331 modules in 16.18s). **Final sprint — stopped for user review.**

### Hero — copy FINAL
The editorial spread + dolly exit + final wording are all done (name IS the
title). Hero copy locked in [SPRINT_HISTORY.md](./SPRINT_HISTORY.md).

### Known issue
**Resolved** — the mobile Lodestar "H" / bottom-right CTA overlap was a stale
pre-Sprint-9 artifact; the UtilityDock coordination fixed it. No outstanding
known issues.

---

## 5. Configuration & env

| Key | Purpose | Status |
|---|---|---|
| `VITE_GITHUB_TOKEN` | Raise GitHub API rate limit for stats | Optional, off |
| `VITE_AI_ENDPOINT` + `VITE_AI_API_KEY` | Real LLM for the twin | Optional, off |

SEO files (`public/robots.txt`, `public/sitemap.xml`) still reference
`example.com` / relative paths — not go-live ready.

---

## 6. Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server, `:5173` |
| `npm run build` | Typecheck (`tsc -b`) + production build → `dist/` |
| `npm run preview` | Serve the production build |
| `npm run typecheck` / `lint` / `format` | Quality gates |

A verified production `dist/` build exists (2026-08-09).

---

## 7. Navigation cheat-sheet for future sessions

- **Start here** → then [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md) for voice
  + honesty rules, [DESIGN_BIBLE.md](./DESIGN_BIBLE.md) for visual law.
- **Change content** → `src/data/*` (never hard-code into components).
- **Change the twin's knowledge** → the 7 files in `knowledge/` (NOT the 5
  docs — the twin imports only those 7).
- **Record what happened** → [SPRINT_HISTORY.md](./SPRINT_HISTORY.md).
- **Plan next** → [ROADMAP.md](./ROADMAP.md).

Cross-ref: [ROADMAP.md](./ROADMAP.md) · [SPRINT_HISTORY.md](./SPRINT_HISTORY.md)
