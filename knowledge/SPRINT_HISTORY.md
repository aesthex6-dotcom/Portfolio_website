# Sprint History

> A record of how this project got where it is. Two kinds of content here:
> **Documented** (sprints recorded in project memory, high confidence) and
> **Reconstructed** (inferred from code, comments, and file timestamps —
> approximate, do not cite as exact fact).

**Data-quality note:** the project is **not a git repository**, so there is no
commit log to reconstruct history from. File timestamps in the tree are the
main artifact. Sprint *numbers* before Sprint 7 were never recorded; the early
sprints below are labeled by content, not number.

---

## Documented sprints

### Sprint 7 — Hero: editorial spread ("the name IS the title")
*Completed 2026-08-07, verified.*

- The Hero stopped being a startup landing frame and became a cinematic
  editorial spread: **HIMANSHU / ARYA** in Sonder Regular dominating the
  top-left; **no role labels**; everything else composed off-axis (running
  head top-right, copy + CTA bottom-right, page furniture + availability
  bottom-left, thin scroll cue bottom-center).
- `HeroBackground.tsx` = layered light: faint grid, key light, brass tint,
  vignette, slow cursor parallax. **No particles, no blue gradients, no
  glass.** `prefers-reduced-motion` → static.
- Deleted Hero-only orphans: `ParticleField.tsx`, `useTypewriter.ts`,
  `ui/AnimatedText.tsx`. **Kept** `GlowOrbs.tsx` (RecruiterHero uses it) and
  `MagneticButton.tsx` (Contact uses it).
- Supporting copy in the Hero is still **TEMP** (marked in code) — this pass
  locked hierarchy/composition/balance, not final wording.
- Lodestar untouched — Hero is its hidden prologue; the star still emerges at
  Skills.

### Sprint 8 — Navigation redesign: "The Lodestar"
*Direction approved 2026-08-07/08; implemented (verified in code 2026-08-08).*

- The traditional navbar was dissolved and replaced by **The Lodestar**, a
  fixed top-right star that guides the visitor through story chapters.
- Concept came from merging two design concepts (A + B); the earlier pure-B
  "Orbital Compass" was **rejected**. User explicitly rejected: pulsing idle
  animation, forced radial symmetry, literal compass aesthetic. Kept from the
  explorations: progress ring, directional awareness.
- **Implemented** (see `src/components/lodestar/`):
  - Emergence fade-in (~1200ms) once the first chapter (Skills) enters view.
  - Progress ring (1.5px arc, scroll-driven stroke-dashoffset) + mobile top
    reading hairline.
  - Directional "filament" thread curving toward the next unseen chapter;
    fades out at the final chapter.
  - Hover constellation of chapter nodes (desktop, ≥1440px + hover capable);
    calm bottom-sheet chapter list on mobile. Esc closes; arrows + focus
    supported.
  - Current-chapter pill (subtle, when the right gutter has room).
  - Lodestar root owns the global **⌘K** (command palette) and **Ctrl+`**
    (terminal) shortcuts that the navbar used to own.
- Navbar's other affordances moved: section links → Lodestar; ⌘K stays;
  Terminal → ⌘K + footer; Résumé → Hero CTA + ⌘K + footer.
- Post-prologue chapters: Skills → Projects → Mission → Achievements → Blog →
  Contact (About stays the unnumbered prologue). Chapters filtered at runtime
  in recruiter mode (Achievements/Blog drop).
- ~~**Known minor issue (pre-existing, not a regression):** on mobile the
  Lodestar "H" button slightly overlaps the bottom-right CTA area.~~ **Resolved
  by Sprint 9's UtilityDock** (the bottom-right tools became one coordinated
  dock hidden through the hero cold-open); the note is a stale pre-Sprint-9
  artifact — verified overlap-free in Sprint 10.

### Sprint 9 — Art Direction: the editorial system
*Implemented 2026-08-08; verified (`tsc -b` + production build pass).*

Directive: the project is feature-complete; this sprint stops adding features
and starts *designing the experience*. Reference studied (philosophy only, not
cloned): **phobos.com.au** — "COMPLEX PROBLEMS. DEPENDABLE OUTCOMES." —
declarative statements, hierarchy replacing decoration, cinematic pacing.

- **"No more component library."** Card grids and rounded boxes dissolved in
  all content sections. New editorial system: `.scene` rhythm, `.rule-row` /
  `.rule-list` ruled indexes (number · content · meta), `.sonder-mark` chapter
  numerals (Sonder as a faint watermark), `.statement` declaratives,
  hairline-underlined contact form. Cards survive only as overlay surfaces
  (project modal, palette, terminal).
- **Motion language rebuilt around the camera, not the UI.** `Reveal` is now a
  directional clip-path curtain (no generic fade-ups); `MaskLines` sets title
  lines like a typesetter (line-by-line rise out of overflow-hidden boxes);
  the Hero gained a scroll **dolly** (frame lags the page, title lifts and
  recedes, different depths). House ease `--ease-cinematic [0.16,1,0.3,1]`.
  `useParallax` for scroll-linked transforms.
- **Textures:** film grain (soft-light, ~0.03) + paper tooth (overlay,
  ~0.012) — "the user should feel it, not notice it."
- **Button collisions fixed:** the bottom-right cluster became one coordinated
  `UtilityDock` (vinyl + chat share anchors, hide/show each other, dock hidden
  through the hero cold-open until past the fold).
- **Icons:** consistent Streamline Core Line language — single-weight line
  marks, hierarchy from size + tone, never color. Icons guide attention, not
  decorate space.
- **Sections converted:** About, Skills, Projects, Mission, Certifications,
  Achievements, Blog, Contact → editorial ruled indexes / reserved
  EmptyStates. Recruiter mode + project modal intentionally keep the compact
  card layout (separate persona, not a regression).
- **Verified:** `npx tsc -b` clean; `npm run build` clean. `rule-list` closing
  border lives on the list container so wrapped and unwrapped rows rule
  identically.

### Sprint 10 — Refinement: typography, micro-interactions, icons, performance
*Implemented 2026-08-09; verified (`npx tsc -b` + production build pass).*

A design-refinement pass (Tasks 13–20), not a feature sprint — survey the
system, then tighten it in four coordinated passes. No finished section was
redesigned.

- **Task 14 — Hero refinement.** The editorial spread from Sprint 7 got its
  finishing pass: a three-depth scroll dolly (frame lags `0→64`, title lifts
  `0→-72` and recedes `1→0.965`, furniture sinks slower `0→28` — one camera
  move, three depths, not UI movement). **TEMP copy finalized and markers
  removed**: running head "PORTFOLIO — 2026" (top-right), "EDITION 01 — 2026"
  + availability (bottom-left), "I design and build intelligent products — from
  the first idea to the shipped system." (bottom-right). The Sonder title
  remains the unmistakable focal point.
- **Task 15 — Scroll storytelling.** `SectionHeading` rewritten so every
  chapter header carries a scroll-linked camera: the faint Sonder chapter
  numeral drifts on the far plane (parallax, static under reduced motion), the
  description settles on the beat after the masked title lines. Layered, not
  simultaneous.
- **Task 16 — Micro-interaction system.** One global default
  `transitionDuration: '300ms'` unifies every un-duration'd hover/focus/press
  transition; deliberate 500ms editorial rows stay explicit. Buttons share one
  press language (`active:scale-95`, no translate pop). `:focus-visible` lost
  its artificial 2px radius — focus uses the tokens.
- **Task 17 — Icon system.** Remaining lucide icons swapped to Streamline Core
  Line glyphs (custom `command`, `loader`, `check`, `external-link`, …); lucide
  survives only for the GitHub octocat (logo-exempt). Icon sizes normalized to
  the 14px stroke grid.
- **Task 18 — Typography + spacing audit.** Verified the three-tier body scale
  (statement 15→16px · row descriptions 14→15px · meta 10–12px mono) across all
  sections; fixed the one drift (About intro was oversized). Heading hierarchy,
  section rhythm (`.scene` py-28 md:py-40), max-w line lengths, and ruled-index
  spacing all confirmed coherent.
- **Task 19 — Performance pass.** Persistent `will-change` hints removed in
  favor of Framer's lifecycle-managed `willChange: 'auto'` (`Reveal`, `Tilt`)
  — compositor layers exist only while animating. Content entrances still on
  the overlay ease were converted to the house cinematic ease `[0.16,1,0.3,1]`:
  **recruiter hero / skills / resume CTA and the project cards** (the last
  stragglers). Reduced-motion audit: the global CSS guard + per-component hook
  guards + Lodestar's threaded `reduced` prop + `MotionConfig
  reducedMotion="user"` on the architecture explorer cover every animation; the
  few infinite loops are transient or user-invoked (typing dots, playback
  equalizer, active-edge packet, scroll-cue hairline).

**Locked this sprint:** the house ease applies to *all* content entrances —
`[0.22,1,0.36,1]` is reserved for overlays (modal, palette, chat, soundtrack),
the Lodestar HUD and dock controls, and in-modal interactions. The Hero copy is
final.

### Sprint 11 — Art direction: the Industrial system
*Implemented 2026-08-09; verified (`npm run typecheck` + `npm run lint` + `npm
run build` all clean, 2327 modules in 25.49s).*

Directive: **CRITICAL — NEW ART DIRECTION.** A full visual-atmosphere reset
from "Warm Noir" to an **industrial, engineered, precise** aesthetic — the
portfolio as a spec sheet, not a warm editorial. Not futuristic, not cyberpunk,
not gamer, not flashy. Reference studied philosophy-only (again phobos.com.au);
nothing cloned.

- **Palette reset (tokens):** Warm ink-black + brass → deep neutral charcoal
  `#171717` (no warm undertone), cool off-white `#f5f7f2`, and **lime green
  `#c7ff38` as the single functional accent**. `--line/--text/--muted/--faint`
  all re-derived to cool off-white. Status colors muted to editorial greys
  (`--warn #a8a89e`, `--danger #c48a8a`).
- **Green discipline (the core law):** green is **functional-only** — active
  nav/chapter, command-palette selection, terminal prompt, progress indicators,
  hover/focus, important emphasis. Six content/decorative violations fixed
  (certification issuer, modal tagline, two decorative rails, inline code,
  blockquote border) → neutral. Every accent usage audited and categorized;
  the page stays ~mostly monochrome.
- **EngineeredField (new living background):** a fixed, full-viewport SVG
  blueprint layer behind every scene — compass ring, crosshair, dimension arc +
  tick + `0°` label, datum baseline, dashed signal path with nodes, sparse
  construction lines. Each element draws itself in across a different scroll
  range (`pathLength={1}` + `strokeDashoffset` transforms), so reading the page
  reads like revealing an engineered system. **Neutral off-white strokes only —
  zero green.** Geometry kept in a central safe zone (x∈[28,72], y∈[24,72]) so
  it never crops at any aspect ratio (`preserveAspectRatio="xMidYMid slice"`).
  Reduced motion → static at ~60% draw.
- **Typography:** hero Sonder reduced `clamp(4.25rem,18vw,13.5rem)` →
  `clamp(3.25rem,13vw,9.5rem)` (impact without overwhelm — it is one element
  of the composition now, not the whole page). `.scene-title` and `.statement`
  display weights → `font-bold`, tracking tightened to `-0.035em`. Pull-quote
  weight up to match.
- **Texture tune:** film grain `0.03→0.035` + paper tooth `0.012→0.015` —
  the quieter `#171717` ground needs slightly more tooth to keep the print
  feel.
- **Light neutralized:** every warm/brass glow re-derived to cool
  `rgba(245,247,242,…)` — HeroBackground, GlowOrbs, ProjectVisual, Contact,
  SoundtrackPlayer fallback cover, NotFound canvas, SnakeGame palette
  (food/head → lime, body greys), Lodestar ring/halo/core, SkillConstellation
  category colors → 6-step monochrome grey ramp with **lime only on the active
  node/hover**.
- **Recruiter route** and overlay surfaces keep their card/compact layouts
  (separate quick-overview persona — not a regression).
- **Hacker mode** survives as the exception theme (warm phosphor green) — now
  it contrasts the lime default, and still reads correctly in both.

**Verified:** `npm run typecheck` ✅ · `npm run lint` ✅ · `npm run build` ✅.
Full warm-color residue sweep clean. Scroll audit clean (the only main-path
fade-up, ProjectCard, converted to a masked reveal). Dev server confirmed live
for manual review.

**Locked this sprint:** the palette is **Industrial** (charcoal + cool
off-white + functional lime). Green is functional-only — never decorative.
The `EngineeredField` blueprint layer is the fixed backdrop. Hacker mode is the
exception theme, not the default.

### Sprint 12 — Experience & Premium Interaction Pass
*Implemented 2026-08-09; verified (`npm run typecheck` + `npm run lint` + `npm
run build` all clean, 2329 modules in 6.33s).*

Directive: make the site feel like a **premium engineered interactive product**,
not a static portfolio. **Color system LOCKED** (Industrial — no redesign). No
new widgets. No fabricated content. Every section gets one memorable,
scroll-driven interaction. **This is the final sprint — stop for user review
afterwards, no further sprints.**

- **Living background (§1).** `EngineeredField` evolved into a richer
  engineering visualization: a routing **packet** that travels node→node along
  the dashed signal path as you scroll (polyline interpolation, spring-free —
  a pure function of scroll progress, so it rewinds on scroll-up), 4 explicit
  node-opacity windows (nodes light as the packet reaches them), a second
  far-plane route line drawn in late-scroll, a concentric **graticule** (radii
  22/27/32 + 8 radial ticks) that fades in with depth, and faint mono coordinate
  labels (`Y70.000`, `R22.000`, `RTE-02`). All strokes neutral off-white (zero
  green), safe-zone geometry preserved, reduced motion → static at the fully
  drawn state.
- **Hero → premium portrait placeholder (§2).** New `ui/PhotoFrame.tsx` (the
  generalization of the deleted hero `PortraitFrame`): hairline border, 4 corner
  ticks, inner hairline, masked clip-path wipe-in, mono `FIG.`/label annotation
  row. `photo` empty → elegant aperture-circle "Photo reserved" placeholder,
  data-driven via `profile.photo` so a real portrait drops in later. Sits
  top-right of the right column at its own scroll depth (portraitY lag).
- **About → unfolding construction (§3).** The section draws itself like a
  blueprint: top/bottom hairlines scale across on scroll, 4 corner brackets
  grow in (per-corner origin), mono annotations (`SEC.01 — PROFILE`,
  `23.2158N · 77.4083E`). **Education** restructured into a spec block:
  header row, mono `SpecRow` label + dotted leader + value (Institution /
  Period / Location), and a `FIG.02 — CAMPUS` photo frame. **Research
  confirmed no suitable public-license daylight MANIT Bhopal exterior exists**
  (candidates are dusk/phone-quality or low-res) → kept the elegant data-driven
  placeholder per the brief rather than shipping a poor image.
- **Skills → diagnostics (§4).** The constellation stays, but reads as an
  instrument: instrument header bar (`Instrument · skill matrix`, live dot,
  `Categories/Nodes/Links/Stable` counters), `Proficiency` → **`signal: n/100`**
  in the readout, `SIG.{level}` in the ruled index, "Top capabilities — Ranked
  by signal · an honest current state". Lime stays reserved for the live dot and
  active node.
- **Projects → cinematic presentation scenes (§5).** Ruled rows → full
  presentation scenes (`ProjectScene`): visual **wipes in from one side, text
  from the other**, background plate (concentric circles + `R{n}` label) moves
  at its own parallax depth, metadata staggers in progressively
  (visual → title → body → status → stack → CTA), everything **exits together**
  on scroll-out via the outer wrapper. Flip alternates side per project.
  Case-study modal kept.
- **Contact → secure channel (§6).** No hacker aesthetic — professional and
  minimal: mono "Channels" framing ("05 routes"), a scroll-drawn **Transmit**
  line, ruled form fields with mono codes (`CHN.03 — MSG`, field 01/02/03),
  hairline corner ticks, "Opens your mail client" annotation.
- **Navigation → balanced composition (§7).** The floating control rail is
  **raised off the viewport floor**: new `--dock-bottom:
  clamp(4.5rem, 15vh, 7.5rem)` token in `index.css`; dock + chat + soundtrack
  panels all derive from it so the cluster stays coordinated from one number.
  Recruiter toggle aligned right-7 under the Lodestar.

**Verified:** `npm run typecheck` ✅ · `npm run lint` ✅ · `npm run build` ✅
(2329 modules, 6.33s). Hook-in-loop lint traps avoided (explicit array-literal
hook calls in `EngineeredField`); `MotionStyle` used where style props carry
`MotionValue`s; reduced motion honored at every new layer.

**Locked this sprint:** the floating control rail lives at `--dock-bottom`
(inside the composition, not pinned to the floor). Every new section interaction
is a pure function of scroll progress (reverses on scroll-up). Photo frames are
data-driven placeholders until real photography exists. **Final sprint — the
site stops for user review.**

### Sprint 13 — Refinement & Premium Polish
*Implemented 2026-08-09; verified (`npm run typecheck` + `npm run lint` + `npm
run build` all clean, 2331 modules in 16.18s).*

Directive: **do NOT redesign the site, do NOT change the color system or
information architecture, do NOT introduce another visual language.** First
review every Sprint 12 interaction — keep what's premium, refine what's
unfinished, remove what's gimmicky. Fix the system, not individual elements.
**This is the final sprint — stop after this refinement pass and wait for user
review.**

- **Invisible text — root cause, fixed at the token level.** `--faint`
  `#62635f → #82847e` (~5.1:1 vs the `#171717` ground); every
  `text-faint/XX` alpha override stripped. The quiet tier is now moody, never
  unreadable. The Atmosphere system extends the fix: faint is lerped per level
  but held ≥ ~4.9:1 (low `#7d7f76`, neutral `#82847e`, high `#8b8d87`).
- **Editorial clutter removed.** Decorative `— • |` separators in UI labels →
  `·`. Deliberate print-voice dashes kept in the Hero's edition labels
  (`EDITION 01 — 2026`, `PORTFOLIO — 2026`).
- **Grain & materiality.** Rebuilt film grain as a **procedural 512px stitched
  `fractalNoise` plate** (tiles seamlessly) shuffled by `steps(6)` transform
  keyframes — no visible repeat. Added a `.vignette` layer (default 0.45) the
  grain composes with; both are now token-driven (`--grain-opacity`,
  `--vignette-opacity`).
- **Scroll quality.** `Reveal` became **scroll-scrubbed**: progress drives the
  clip-path inset, opacity, and drift, so elements construct/settle/rest and
  **reverse perfectly on scroll-up**. The inert `delay`/`once` props (no-ops)
  were removed from the component and all 12 call sites.
- **Projects pacing.** `ProjectScene` condensed from six opacity cascades to
  **four deliberate scroll beats** (visual → title+body → metadata → CTA) —
  assembly reads as *positioned*, not timed. The redundant status badge is off
  in scene visuals (spec rows own it; cards keep it).
- **Hero portrait frame refined.** `PhotoFrame`: outer mount now has a top
  light + deep shadow, the photo fades in softly (`motion.img`), a legibility
  scrim protects the caption, and the "reserved" aperture gained a subtle
  radial light + crosshair. **Education placeholder kept** per the brief — no
  further image searches.
- **Micro-interactions.** Real depth replaces flat hovers: `panel-hover` /
  `btn-primary` / `btn-ghost` gained offset black shadows (hover + active);
  form inputs gained `hover:border-edge-strong` + a 1px lime underglow on focus
  (`focus:shadow-[0_1px_0_var(--accent)]`).
- **Navigation coordinated (as one system).** Verified Lodestar, Recruiter
  toggle, Soundtrack, AIChat, and Dock share one coordinate system — nothing
  overlaps, nothing competes. The chat trigger now yields to the soundtrack
  panel (`!isOpen && !chatOpen`), completing the "one panel open at a time"
  rule that the dock's docstring always stated.
- **Atmosphere system (NEW) — mood, not monitor brightness.** `store/
  atmosphere.tsx` + `AtmosphereControl` at the dock foot. Three levels lerp the
  room: low = deeper charcoal, stronger vignette, heavier grain, softer
  highlights; high = lighter charcoal, reduced grain, softer shadows, brighter
  surfaces. JS rAF + easeOutCubic (900ms) because unregistered custom properties
  snap under CSS transition. **Interpolates only bg-family + faint +
  grain/vignette — never accent/text/muted** — so `html.hacker-mode` CSS
  selectors still win over inline styles. Writes both `--x` and `--x-rgb` forms.
  Persists `localStorage['portfolio:atmosphere']`. First-run + reduced motion
  snap directly.
- **Template-feel sweep.** Walked every section page by page (plus Footer,
  Resume, NotFound); nothing needed a redesign.

**Verified:** `npm run typecheck` ✅ · `npm run lint` ✅ · `npm run build` ✅
(2331 modules, 16.18s).

**Locked this sprint:** `--faint` must never fall below ~4.9:1 on charcoal.
Grain is the procedural 512px stitched plate (no visible repeat). Every reveal
is a pure function of scroll progress (reverses on scroll-up). The Atmosphere
system is the mood control and is additive-only — it must never lerp
accent/text/muted or hacker-mode breaks. **Final sprint — the site stops for
user review.**

---

## Reconstructed timeline

*Inferred from file timestamps + code structure. Broad strokes, not exact.*

| Date (approx.) | What was happening |
|---|---|
| 2026-08-04 | Project scaffold: `package.json`, `vite.config.ts`, TS configs, ESLint/Prettier, Tailwind, `.env.example`, initial `index.html`. Blog posts folder created. |
| 2026-08-04 → 06 | Core build-out — the data-driven foundation: `src/data/*` single-source-of-truth files, all section components (About, Skills constellation, Projects + modals, Mission, Stats, Contact), layout shell, design system ("Warm Noir") in `index.css` + `tailwind.config.ts`. |
| 2026-08-06 | Feature wave: **digital twin** engine + `knowledge/*.md` files (7 files, 14:19–15:17), terminal, command palette, easter eggs, GitHub stats, recruiter mode, architecture explorer (`src/data/architecture/`), soundtrack. README rewritten to document it all (14:25). |
| 2026-08-07 | **Sprint 7** (Hero editorial spread, done) + **Sprint 8** kickoff (navigation redesign — product-design exercise first; user explicitly rejected code-first approaches). `.claude/` created. |
| 2026-08-08 | Lodestar implementation landed (15:48) · **Sprint 9 art-direction pass**: editorial system across all eight sections, masked reveals, Hero dolly, UtilityDock; `dist/` refreshed. |
| 2026-08-09 | **Sprint 10 refinement pass**: Hero copy finalized, `SectionHeading` scroll storytelling, unified micro-interactions, Streamline icon completion, typography/spacing audit, performance pass (auto `will-change`, uniform cinematic ease); `dist/` refreshed. |
| 2026-08-09 | **Sprint 11 — Industrial art direction**: palette reset (charcoal + cool off-white + functional lime), green-discipline audit, `EngineeredField` scroll-drawn blueprint background, hero typography confidence pass, texture tune, warm-light neutralization; `dist/` refreshed. |
| 2026-08-09 | **Sprint 12 — Experience & Premium Interaction Pass**: living background (routing packet, graticule, labels), hero portrait placeholder (`PhotoFrame`), About unfolding construction + Education spec block, Skills diagnostics, Projects cinematic scenes, Contact secure channel, raised floating control rail (`--dock-bottom`). Final sprint — stopped for user review. |
| 2026-08-09 | **Sprint 13 — Refinement & Premium Polish**: invisible-text root fix (`--faint` → `#82847e`, alpha overrides stripped), procedural 512px stitched grain + vignette, scroll-scrubbed `Reveal`, condensed ProjectScene pacing, PhotoFrame refinement, real hover depth, **Atmosphere mood control** (bg-family + faint + grain/vignette lerp, not accent/text/muted), navigation verified overlap-free, template-feel sweep. Final sprint — stopped for user review. |

---

## Locked design decisions (do not reopen casually)

**From the Hero (Sprint 7):**
- The name IS the title, in Sonder. No role label under it.
- Hero light = layered light only (no particles, no blue gradients, no glass).

**From the navigation (Sprint 8):**
- Guide placement is **top-right** (bottom-right is the tools cluster —
  Soundtrack + AIChat — and would read as chrome there).
- About is the unnumbered **prologue**; chapters start at Skills.
- Star is calm at idle: ~55–60% opacity, brightens on hover, **no pulse**.
- The guide is Home-only; other routes get a minimal "← Story" affordance.
- The Hero's "Ctrl+K" corner tag was removed/repositioned (it used to sit in
  the top-right corner the star now owns).

**From the art direction (Sprint 9):**
- Content sections are editorial, not card-based: `.rule-row` indexes +
  hairlines + typographic hierarchy. Overlays may still use `.panel`.
- Motion is a camera, not a UI: clip-path curtain reveals, masked display
  lines, scroll-linked dolly. No fade-up-everything, no bounce/spring.
- Sonder is reserved: hero title + faint `.sonder-mark` chapter numerals only.
- Bottom-right controls are one `UtilityDock` system, hidden until past the
  hero fold.
- Textures are two quiet layers (grain + paper tooth); the page is a print
  artifact, not a screen.

**From Sprint 10 (refinement):**
- One motion language: **all content entrances use the house ease**
  `[0.16,1,0.3,1]` (recruiter route + project cards converted). The overlay
  ease `[0.22,1,0.36,1]` is reserved for overlays (modal, palette, chat,
  soundtrack), the Lodestar HUD/dock controls, and in-modal interactions.
- `will-change` is lifecycle-managed (`willChange: 'auto'`) — no persistent
  compositor hints. Composer layers exist only while animating.
- Hero copy is **final** (running head "PORTFOLIO — 2026", furniture "EDITION
  01 — 2026", supporting line "I design and build intelligent products — from
  the first idea to the shipped system.").

**From Sprint 11 (art direction — Industrial):**
- The palette is **Industrial**: deep neutral charcoal (`#171717` family),
  cool off-white (`#f5f7f2`), and **lime green (`#c7ff38`) as a functional-only
  accent**. Active nav/chapter, hover, focus, progress, terminal prompt —
  never a background tint or hairline. The page reads mostly monochrome.
- The `EngineeredField` blueprint layer is the fixed backdrop behind every
  scene; it draws itself in with scroll. Neutral strokes only.
- Hacker mode is the exception theme (warm phosphor green), not the default.
- Hero Sonder is confident but composed: `clamp(3.25rem,13vw,9.5rem)` — one
  element of the composition, not the whole page.
- Body-copy scale is fixed at three tiers (statement 15→16px · rows 14→15px ·
  meta mono 10–12px); don't reintroduce oversized intro paragraphs.

**From Sprint 12 (experience & premium interaction pass):**
- The floating control rail sits **inside the composition**, anchored at
  `--dock-bottom: clamp(4.5rem, 15vh, 7.5rem)` — not pinned to the viewport
  floor. Dock, chat, and soundtrack panels all derive from this one token.
- Every scroll-driven interaction must be a **pure function of scroll
  progress** (reverses naturally on scroll-up) and collapse to static under
  reduced motion.
- Photo frames (`PhotoFrame`) are data-driven: empty `photo` → elegant
  "reserved" placeholder. No fake imagery — a real photo drops into the
  `profile.photo` / `profile.education.photo` fields later.
- Projects are **presentation scenes**, not cards: visual + text enter from
  opposite sides, background at its own parallax depth, metadata staggers in,
  all exit together. (Recruiter mode keeps `ProjectCard` — separate persona.)

**From Sprint 13 (refinement & premium polish):**
- `--faint` is the quiet tier's floor: never below ~4.9:1 on its ground, no
  `text-faint/XX` alpha overrides. It was the root cause of invisible text.
- Grain is the procedural 512px stitched `fractalNoise` plate shuffled by
  `steps(6)` — the one approved grain recipe. No repeating texture, ever.
- Every scroll-driven interaction is a pure function of scroll progress and
  reverses perfectly on scroll-up (scroll-scrubbed `Reveal`; no plays-once
  entrances).
- The Atmosphere system is **additive-only**: it interpolates bg-family + faint
  + grain/vignette and must NEVER touch accent/text/muted (hacker-mode CSS
  selectors depend on it). Mood, not monitor brightness.
- The floating rail enforces **one panel open at a time** — chat yields to
  soundtrack, vinyl yields to both; the atmosphere control sits at the dock
  foot safely under the 72px soundtrack floor.

**Rejected / never adopt:**
- ❌ Pulsing idle animation · ❌ forced radial symmetry · ❌ literal compass /
  orbital-spin navigation · ❌ glassmorphism · ❌ rainbow gradients · ❌
  particles/Three.js where Canvas2D/SVG suffices · ❌ fake content of any kind ·
  ❌ generic fade-up reveals · ❌ card grids in content sections · ❌ glow/RGB
  effects · ❌ floating decoration for no reason.

---

## Stale memory notes

- An earlier project-memory note ("awaiting the user's rulings on 4 open
  decisions… NO code until explicit green-light") is **out of date**: the
  Lodestar is implemented and mounted in `App.tsx`. Treat the **code as the
  source of truth** for resolved decisions; the open items that remain are
  recorded in [ROADMAP.md](./ROADMAP.md).

Cross-ref: [CURRENT_STATE.md](./CURRENT_STATE.md) · [ROADMAP.md](./ROADMAP.md)
