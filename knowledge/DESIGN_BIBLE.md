# Design Bible

> The non-negotiable design law of this project. If a change contradicts this
> document, the change is wrong — even if it "looks good" in isolation.
> Read this before touching any visual work.

---

## 1. The one-line mission

> **"We are NOT building a portfolio. We are building an experience that feels
> like exploring the mind of a builder."**

Design quality bar: **Apple / Linear / OpenAI / Vercel-grade**. Obsessive
micro-interactions, deliberate calm, zero bloat. Every pixel earns its place.

---

## 2. Design principles (non-negotiable)

| Principle | Meaning in practice |
|---|---|
| **Cinematic** | The site is a film: an opening (Hero + About as the prologue), chapters, scene-transition pacing. Light, not decoration. |
| **Premium** | Expensive materials: cool off-white on deep engineered charcoal, **lime-green as a functional-only accent** (never a background tint or hairline), hairlines instead of borders or shadows. |
| **Calm** | Nothing shouts. No pulsing idle elements, no competing motion. One point of emphasis at a time. |
| **Minimal** | If an element can be removed without losing meaning, remove it. |
| **Story-driven** | Navigation is a story guide (the Lodestar), not chrome. Scroll = reading a chapter. |
| **Editorial** | Typography leads. Asymmetric composition, running heads, page furniture, balanced lines. |
| **No component library** | Cards, rounded boxes, and repeated layouts are gone from content sections. Layout is editorial: ruled index rows, hairlines, hierarchy. Think magazine / architecture studio / luxury print — **not** dashboard, SaaS, or startup landing. |
| **Human** | Warm, honest, personal. Not a SaaS template. Never feels like a generic AI-generated page. |

### Inspirations
Phobos, Apple, Linear, Arc Browser — **not** copied, but the *feeling* they
share: restraint, craft, and a sense that a human cared. Phobos's
"COMPLEX PROBLEMS. DEPENDABLE OUTCOMES." chapter was studied (Sprint 9) for
its *philosophy* — declarative statements, hierarchy replacing decoration,
pacing — **never cloned pixel-for-pixel.**

### Textures — "the user should FEEL it, not notice it"
- **Film grain** (`.noise::before`): a **procedural 512px stitched
  `fractalNoise` plate** (`stitchTiles='stitch'` so it tiles seamlessly — no
  visible repeat), shuffled by a `steps(6)` transform keyframe (`grain-shift`,
  ~1.1s). `mix-blend-mode: soft-light`, opacity driven by
  `--grain-opacity`. A barely-there film on the whole page.
- **Paper tooth** (`.noise::after`): `opacity ~0.012`, `overlay` blend, a quiet
  SVG paper-grain pattern. Two layers, one intention: the screen stops being a
  screen. Global overlay in `App.tsx`.
- **Vignette** (`.vignette`, `App.tsx`): a radial darkening — `opacity` driven
  by `--vignette-opacity` (default 0.45). The vignette is the *room* the
  composition sits in; the grain lives inside it.
- **The Atmosphere system owns both**: `--grain-opacity` and
  `--vignette-opacity` are the two texture tokens it interpolates, so the mood
  control adjusts light *and* material together.

---

## 3. Design tokens — "Industrial"

*A precise, engineered charcoal.* One functional signature (lime). Everything
else is cool neutral. **Green is functional-only** — active nav, hover, focus,
progress, terminal prompt. Never a background tint or hairline. **No purple, no
blue, no gradients on text.**

| Token | Tailwind | Value | Usage |
|---|---|---|---|
| `--bg` | `bg-base` | `#171717` | Page ground — deep neutral charcoal (not pure black) |
| `--bg-soft` | `bg-soft` | `#1a1a1a` | Slightly lifted ground |
| `--surface` | `bg-surface` | `#1f1f1f` | Panels, cards |
| `--raised` | `bg-raised` | `#262626` | Hover/raised surfaces, scrollbar, code bg |
| `--line` | `border-edge` | `rgba(245,247,242,0.08)` | Hairlines — **the site's primary texture** |
| `--line-strong` | `border-edge-strong` | `rgba(245,247,242,0.18)` | Stronger hairline (hover, active) |
| `--text` | `text-ink` | `#f5f7f2` | Primary type — cool off-white |
| `--muted` | `text-muted` | `#a3a5a0` | Secondary type |
| `--faint` | `text-faint` | `#82847e` | Tertiary type, eyebrows, page furniture — **never darker than ~4.9:1 on charcoal** (raised from `#62635f` in Sprint 13, the invisible-text root fix) |
| `--accent` | `text/bg-accent` | `#c7ff38` | **The functional signature — lime.** Active, hover, focus, progress, terminal prompt. |
| `--accent-2` | `accent2` | `#d7ff6a` | Lime highlight (hover text) |
| `--accent-3` | `accent3` | `#a3d82c` | Deep lime for depth |
| `--ok` | `text-ok` | `#8fb88a` | Status — muted, editorial (functional signal, not decorative) |
| `--warn` | `text-warn` | `#a8a89e` | Status |
| `--danger` | `text-danger` | `#c48a8a` | Status |

### How tokens are wired
- Tokens are CSS variables in `src/index.css` (`:root`), mapped to Tailwind
  color names in `tailwind.config.ts` as `rgb(var(--x-rgb) / <alpha-value>)`.
  The `-rgb` triplet form keeps Tailwind opacity modifiers (`bg-x/50`) working.
- **Atmosphere (Sprint 13):** the mood control (`store/atmosphere.tsx`) writes
  BOTH the `--x` hex and `--x-rgb` triplet forms inline when it lerps, so
  Tailwind alpha utilities keep working across levels. It interpolates **only
  the bg-family + faint + grain/vignette** tokens — never accent/text/muted —
  because `html.hacker-mode` selectors must keep winning over inline styles.
  JS rAF + easeOutCubic (900ms), because unregistered custom properties snap
  under CSS transition. Persists `localStorage['portfolio:atmosphere']`.
- Shadows & textures are also tokens: `shadow-card` (inset hairline),
  `shadow-glow` / `shadow-glow-2` (lime glow, used sparingly), `shadow-lift`
  (deep black elevation), `bg-grid-faint` and `bg-dot-grid` (Linear-style grids).
- **Texture tokens**: `--grain-opacity` and `--vignette-opacity` (see §2) —
  the two tokens the Atmosphere system interpolates.

### Hacker mode (easter-egg theme)
Konami code / `hack` terminal command flips `html.hacker-mode` → the lime
signature is swapped for a **warm phosphor green** (`#8fd8a4` family) and the
ink scale shifts to a phosphor-tinted green. It is a *mode*, not the default —
the design must read correctly in both.

---

## 4. Typography

| Font | Role | Source |
|---|---|---|
| **Sonder** (`font-hero`) | The one display voice. **Hero title only.** Name IS the title. | Bundled: `src/assets/fonts/SonderRegular.otf` |
| **Space Grotesk** (`font-display`) | Headings, section titles, chapter labels | Google Fonts |
| **Inter** (`font-sans`) | Body, UI | Google Fonts |
| **JetBrains Mono** (`font-mono`) | Eyebrows, labels, terminal, meta — always uppercase + tracked | Google Fonts |

### Typographic conventions
- **Eyebrow**: `font-mono text-[10px] uppercase tracking-[0.28em] text-faint`
  — every section heading leads with one (`.eyebrow`).
- **Hero title**: Sonder, `text-[clamp(3.25rem,13vw,9.5rem)] leading-[0.84]
  tracking-[-0.02em]`, animates line-by-line out of `overflow-hidden` boxes
  (`110% → 0`). The name *is* the title — no role label under it. Sonder is
  used **sparingly**: the hero title and the faint `.sonder-mark` chapter
  numerals. Nothing else. That is what makes it unforgettable.
- **Section titles** (`.scene-title`): Space Grotesk, `clamp(2.1rem,4.6vw,
  3.85rem)`, `line-height 1.03`, `-0.03em` tracking. When set via `MaskLines`,
  each line lifts out of its own box, staggered — the motion of a typesetter
  setting a headline.
- **Chapter marks** (`.sonder-mark`): the section numeral (01–08) rendered as
  a giant faint Sonder watermark (`opacity ~0.055`), absolute top-right of each
  section heading. Numbering is felt, not read.
- **Display headings** get `letter-spacing: -0.02em`; `.text-balance` prevents
  orphan words.
- Buttons: `text-sm font-medium`. Body: `text-sm`–`text-[15px]`, `text-muted`
  by default.

---

## 5. Spacing & layout

- Content column: `.container-site` → `max-w-6xl` (`72rem`), `px-6 md:px-10`.
- Major sections use the `.scene` utility: `py-28 md:py-40`, `scroll-mt-24`.
  Consistent vertical rhythm; scroll-margin clears nothing but the hairline —
  the guide floats, it doesn't take layout space.
- **Ruled index rows** (`.rule-row`): the workhorse of the editorial system —
  a grid (`grid-cols-[auto_1fr_auto]` etc.), `border-t` hairline, `py-6 md:py-8`,
  number · content · meta. Lists close with `.rule-list` (bottom hairline on the
  container, so every row reads identically whether or not it's the last).
- Editorial asymmetry over centered stacks — the Hero is the purest example
  (title top-left, copy + CTA bottom-right, furniture bottom-left); every
  section spreads across the page rather than stacking centered cards.
- Dividers are **hairlines**, never full-strength borders.
- Fixed overlay stack (z-index, top-down): film grain `z-60`, Lodestar +
  reading hairline `z-65`, **UtilityDock (right-edge tools) `z-70`**, Recruiter
  toggle `z-80`, overlays (palette, terminal, chat) above.
- **The right-edge control rail is one coordinated system** (the `UtilityDock`):
  vinyl player + chat share one anchor and hide/show each other, and the dock
  stays hidden during the hero cold-open until the visitor has scrolled past
  the fold. No colliding controls, no competing widgets.
- **The rail is raised off the viewport floor** — anchored at
  `--dock-bottom: clamp(4.5rem, 15vh, 7.5rem)` (`src/index.css`) so the tools
  sit inside the composition, not pinned to the corner. The soundtrack + chat
  panels derive their open position from the same token, so everything stays
  coordinated from one number. The Recruiter toggle aligns right-7 under the
  Lodestar. **One panel open at a time** (Sprint 13 enforced it fully): the chat
  trigger yields to the soundtrack panel, the vinyl yields to chat + soundtrack;
  the atmosphere control sits at the dock foot (safe under the 72px soundtrack
  floor). Nothing overlaps, nothing competes.

---

## 6. Signature components

| Component | What it is | Where |
|---|---|---|
| `.scene` | Section frame — rhythm (`py-28 md:py-40`) + `scroll-mt-24` | `src/index.css` |
| `.rule-row` / `.rule-list` | The ruled index — the editorial workhorse | `src/index.css` |
| `.sonder-mark` | Giant faint Sonder chapter numeral, absolute top-right of a heading | `src/index.css` |
| `.statement` | Oversized uppercase declarative ("few words, well placed") | `src/index.css` |
| `.panel` / `.panel-hover` | Elevated surface — kept for **overlays only** (modal, palette, terminal). Content sections no longer use cards. | `src/index.css` |
| `.chip` | Editorial tag — mono, uppercase, hairline, no fill (small tag contexts only) | `src/index.css` |
| `.btn-primary` | **The one loud object** — inverted ivory pill | `src/index.css` |
| `.btn-ghost` | Quiet bordered pill | `src/index.css` |
| `MagneticButton` | CTA with magnetic hover pull | `src/components/ui/MagneticButton.tsx` |
| `Reveal` | **Scroll-scrubbed clip-path mask reveal** — progress drives the directional curtain (`up/left/right`), so elements construct/settle/rest and **reverse perfectly on scroll-up**. Slow, deliberate, one element at a time. Not a fade-up. | `src/components/ui/Reveal.tsx` |
| `MaskLines` | Masked display type — each title line rises out of its box, staggered | `src/components/ui/MaskLines.tsx` |
| `SectionHeading` | `.sonder-mark` + `.scene-kicker` (hairline + eyebrow) + `MaskLines` title + narrow description column | `src/components/ui/SectionHeading.tsx` |
| `EmptyState` | Honest "not yet" — a *reserved editorial space* (hairline + mono "Reserved" + display line), never an empty box | `src/components/ui/EmptyState.tsx` |
| `UtilityDock` | The coordinated right-edge rail (vinyl + chat), raised off the viewport floor via `--dock-bottom`, hidden until past the hero fold | `src/components/layout/UtilityDock.tsx` |
| `PhotoFrame` | Premium photo frame — hairline border, corner ticks, inner hairline, mono `FIG.`/label annotation row, masked wipe-in. `photo` empty → elegant "reserved" placeholder (aperture circle), data-driven so a real photo drops in | `src/components/ui/PhotoFrame.tsx` |
| `ProjectScene` | Cinematic project presentation — visual wipes in from one side, text from the other, background plate at its own parallax depth, metadata staggers in **four deliberate scroll beats** (visual → title+body → metadata → CTA), everything exits together on scroll-out | `src/components/projects/ProjectScene.tsx` |
| `AtmosphereControl` + `store/atmosphere.tsx` | The mood control (low / neutral / high) in the dock — lerps bg-family + faint + grain/vignette over 900ms like adjusting the room's lighting. Mood, not monitor brightness. | `src/components/layout/AtmosphereControl.tsx`, `src/store/atmosphere.tsx` |
| `useParallax` | Scroll-linked camera moves (respects reduced motion) | `src/hooks/useParallax.ts` |
| `GlowOrbs` | Soft ambient orbs (kept for RecruiterHero) | `src/components/ui/GlowOrbs.tsx` |
| `EngineeredField` | The fixed blueprint layer behind every scene — compass ring, crosshair, dimension arc, datum baseline, signal path; draws itself in with scroll. Neutral off-white strokes only. | `src/components/background/EngineeredField.tsx` |
| `.noise` | Film grain + paper tooth, global (`App.tsx`) | `src/index.css` |

---

## 7. Motion language — "camera movement, not UI movement"

- **House ease**: `--ease-cinematic = [0.16, 1, 0.3, 1]` (the cubic-bezier
  behind `Reveal` / `MaskLines` / every content entrance). **Sprint 10 locked
  one motion language**: all content entrances use it — recruiter route and
  project cards included. The older `[0.22, 1, 0.36, 1]` is reserved for
  overlays (modal, palette, chat, soundtrack), the Lodestar HUD + dock
  controls, and in-modal interactions. When unsure, use `--ease-cinematic`;
  durations are long and calm (0.8–1.2s), never snappy.
- **Reveals are masked curtains, not fades.** `Reveal` wipes the composition
  in via a directional clip-path (top/bottom/left/right) with a whisper of
  opacity and drift — as if a camera settles on a frame. **Sprint 13 made them
  scroll-scrubbed** (progress drives the mask), so elements *construct, settle,
  and rest* — and scrolling up perfectly reverses the reveal. One element at a
  time. **No fade-up on every section, no bounce, no springy cards.**
- **Everything scroll-driven is a pure function of scroll progress.** No
  spring-smoothed offsets for reveals, no "plays once then done" entrances —
  if the visitor scrolls back up, the composition assembles in reverse. (The
  Lodestar filament is the one deliberate spring exception, and it's HUD.)
- **Performance is part of the calm.** `will-change` is lifecycle-managed
  (`willChange: 'auto'` on `Reveal` / `Tilt`) so compositor layers exist only
  while animating — no persistent GPU hints. Reduced motion is honored at every
  layer: a global CSS guard, per-component hook guards, and `MotionConfig
  reducedMotion="user"` on the architecture explorer.
- **Titles set like a typesetter** (`MaskLines`): each display line is cradled
  in an overflow-hidden box and rises `112% → 0`, staggered ~0.12s. Headlines
  that deserve the camera use this; body copy never does.
- **Scroll-linked camera moves**: the Hero performs a slow dolly-out — the
  frame drifts down and lags the page (`frameY 0→56`) while the title lifts
  (`titleY 0→-64`) and recedes (`scale 1→0.97`, origin bottom-left), giving the
  title and frame different depths. See `useParallax` for reusable
  scroll-linked transforms. Nothing floats for no reason.
- **Scroll-driven HUD**: Lodestar progress ring (stroke-dashoffset), mobile top
  reading hairline (`scaleX`), directional filament (spring-smoothed angle).
- **Keyframes** (Tailwind): `blink, float, pulse-soft, gradient-x, shimmer,
  scan, orbit-spin, marquee, flow (SVG stroke-dash), spin-slow`.
- **Reduced motion is a first-class citizen**: every interactive component
  checks `usePrefersReducedMotion`; `Reveal` and `MaskLines` collapse to static
  under it; a global `prefers-reduced-motion` block quiets CSS animation.
- **Calm rule**: no idle pulsing on the Lodestar star (static ~55–60% opacity,
  brightens on hover). One animated thing per view, at most.
- **Quality bar**: if an animation could appear in a YouTube tutorial, remove
  it. Awwwards-jury handcraft, Apple-restraint, still beautiful in five years.

---

## 8. The story structure (navigation as chapters)

1. **Act I — cold open (prologue):** Hero + About as full-viewport cinematic
   scenes with **zero visible navigation**. The visitor enters the story
   before the guide appears.
2. **Emergence:** the Lodestar fades in (~1200ms, opacity-only) as the first
   true chapter (Skills) enters the viewport. Persistent after that.
3. **The Lodestar** (top-right): ~3px cool off-white core + lime halo, progress ring,
   and a "filament" (thread of light) curving toward the next unseen chapter.
   Hover opens an organic **constellation** of chapter nodes; mobile opens a
   calm bottom sheet. Replaces the traditional navbar.
4. Chapters (post-prologue): Skills → Projects → Mission → Achievements →
   Blog → Contact. About is the unnumbered prologue.

Details: `src/components/lodestar/*`, `src/data/chapters.ts`,
`src/hooks/useLodestar.ts`.

---

## 9. The don'ts (explicit no-nos)

- ❌ **No glassmorphism** (no translucent frosted panels as a style).
- ❌ **No rainbow / multi-hue gradients**, and **no gradients on text**.
- ❌ **No purple, no blue** — the palette is cool-neutral charcoal + lime only.
- ❌ **Green is functional-only.** Never a background tint, hairline, icon
  color, or decorative flourish — active states, hover, focus, progress, and
  the terminal prompt only. The field stays mostly monochrome.
- ❌ **No particles / Three.js** — the constellation uses Canvas2D/SVG for perf.
- ❌ **No progress bars** for skills — skills are a constellation graph.
- ❌ **No literal compass / radar / orbital-spin aesthetics** in the guide.
- ❌ **No idle animation / pulsing** on the Lodestar star.
- ❌ **No clutter**: if the chrome can be quieter, make it quieter.
- ❌ **No card grids / rounded boxes in content sections** — the editorial
  system is ruled index rows, hairlines, and typographic hierarchy. (Cards
  survive only as overlay surfaces: modal, palette, terminal.)
- ❌ **No generic fade-up on every section**, no bounce, no springy reveals, no
  zoom-in-everywhere, no stock Framer presets, no floating objects for no
  reason, no excessive blur, no RGB effects, no glowing gradients. Motion is
  calm, slow, intentional — camera movement, not UI movement.
- ❌ **No fake data**: never ship a UI that displays invented experience,
  stats, or placeholders as real content (see `BRAND_GUIDELINES.md`).
- ❌ **No faint text below ~4.9:1 on its ground** — Sprint 13's root-cause fix.
  The quiet tier (eyebrows, furniture, meta) is *moody*, never unreadable; no
  `text-faint/XX` alpha overrides, and the Atmosphere system lerps faint but
  keeps it above the floor at every level.

---

## 10. Where the design lives in code

| Concern | File |
|---|---|
| Design tokens, fonts, base styles, `.scene` / `.rule-row` / `.sonder-mark` / `.noise` | `src/index.css` |
| Tailwind token mapping, shadows, keyframes | `tailwind.config.ts` |
| Hero editorial spread + scroll dolly + layered light | `src/components/hero/Hero.tsx`, `HeroBackground.tsx` |
| Background blueprint layer (scroll-drawn SVG mechanism) | `src/components/background/EngineeredField.tsx` |
| Navigation guide | `src/components/lodestar/*`, `src/hooks/useLodestar.ts` |
| Editorial section composition | `src/components/{about,skills,projects,mission,certifications,achievements,blog,contact}/*` |
| Coordinated floating tools (vinyl + chat + atmosphere) | `src/components/layout/UtilityDock.tsx` |
| Atmosphere mood control (lerp tokens, persistence) | `src/store/atmosphere.tsx`, `src/components/layout/AtmosphereControl.tsx` |
| Shared UI primitives (Reveal, MaskLines, SectionHeading, EmptyState, Icon) | `src/components/ui/*` |
| Fonts | `src/assets/fonts/SonderRegular.otf` |

Cross-ref: [BRAND_GUIDELINES.md](./BRAND_GUIDELINES.md) · [CURRENT_STATE.md](./CURRENT_STATE.md)
