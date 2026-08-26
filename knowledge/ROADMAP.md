# Roadmap

> Where this project is going. Statuses: **ACTIVE** (in flight),
> **PENDING** (planned, needs a decision or trigger), **NOT STARTED** (empty
> until real results land — by design). Nothing here is invented; every item
> traces to a marker in the code, a project-memory note, or a README promise.

---

## 1. Design polish — complete (Sprint 10, 2026-08-09)

The two ACTIVE polish items below were both resolved in Sprint 10 — recorded
in [SPRINT_HISTORY.md](./SPRINT_HISTORY.md).

- ✅ **Hero supporting copy — FINAL.** "PORTFOLIO — 2026" running head,
  "EDITION 01 — 2026" furniture, and the supporting line "I design and build
  intelligent products — from the first idea to the shipped system." All
  `TEMP` markers removed (`Hero.tsx`).
- ✅ **Lodestar mobile overlap — resolved.** Was a stale pre-Sprint-9 artifact;
  the Sprint 9 `UtilityDock` coordination fixed it. Verified overlap-free in
  Sprint 10.
- **Recruiter mode + project modal — editorial or stay compact?** Still ruled
  **keep as-is** (a separate quick-overview persona, recorded in
  [CURRENT_STATE.md](./CURRENT_STATE.md) §2/§4). Sprint 10 only unified their
  *motion* (house ease) — not their card layout.

---

## 2. ACTIVE — navigation decisions record

The Lodestar is implemented. The design *direction* is locked (top-right,
prologue + chapters, calm star). Remaining taste-level decisions should be
recorded here as they land so future sessions don't re-litigate them. The
natural candidates (as discussed during design):
- Optional quiet **wordmark** top-left after emergence (was floated; not
  implemented — decide whether it stays absent).
- Whether **clicking the star advances to the next chapter** (the star
  currently opens the constellation/sheet; a next-chapter advance was an
  option).

Record rulings in [SPRINT_HISTORY.md](./SPRINT_HISTORY.md) when made.

---

## 3. PENDING — pre-launch content checklist

*Everything below is a fill-in. Set each as the real thing becomes available.
Marked with `✍️` in the code.*

| Item | Where | Notes |
|---|---|---|
| Email address | `src/data/profile.ts` → `email`, `socials.email` | Empty → hidden from UI |
| GitHub username | `src/data/profile.ts` → `githubUsername` | **Hides the live stats band** until set |
| GitHub profile link | `src/data/profile.ts` → `socials.github` | Empty → hidden |
| LinkedIn link | `src/data/profile.ts` → `socials.linkedin` | Empty → hidden |
| Real project repo URLs | `src/data/projects.ts` → each `.github` | Currently `<your-github>` placeholders |
| **Replace the 3 placeholder projects** | `src/data/projects.ts` → `agentkit`, `gesturesense`, `mlab` | Marked `⚠️ PLACEHOLDER PROJECTS — REPLACE BEFORE GOING LIVE`. Swap for real code + screenshots |
| Real project screenshots | `/public/projects/<slug>.png` + `image` field | Optional; quiet cover plate renders from `glyph` until then |
| Contribution heatmap data | `ContributionGraph` `values` array | Renders **nothing** unless a real `52×7` week-major array is passed; wire from `src/lib/github.ts` |

### Not-started content (deliberately empty — only fill with real results)
- **Experience** (`src/data/experience.ts`) — internships/freelance/research
- **Certifications** (`src/data/certifications.ts`)
- **Public achievements** (`src/data/achievements.ts`) — only the 5 secret
  easter-egg badges exist by design
- **Blog posts** (`src/content/posts/` + `src/data/blog.ts`) — drop a `.md`
  file + register metadata; appears automatically

---

## 4. PENDING — optional feature enablement

| Feature | Trigger | Effect |
|---|---|---|
| Live GitHub stats reliability | `VITE_GITHUB_TOKEN` in `.env` | Raises API rate limit 60 → 5000 req/hr for the stats band |
| Real LLM for the digital twin | `VITE_AI_ENDPOINT` + `VITE_AI_API_KEY` | Twin delegates to a real model; falls back to the offline engine on failure |

Both are optional — the site is fully functional offline without them.

---

## 5. PENDING — deployment & go-live

| Task | Where | Notes |
|---|---|---|
| Choose a production domain | — | Needed for SEO files + sharing |
| Fix `sitemap.xml` | `public/sitemap.xml` | Currently `https://example.com/` (explicit `Replace example.com` comment) |
| Fix `robots.txt` | `public/robots.txt` | Sitemap line is a relative path; set the absolute production URL |
| SPA rewrite | host config | Vercel/Netlify do this automatically; manual for other hosts |
| Deploy | `npm run build` → `dist/` | Any static host |
| Verify `/resume` print | — | Print-to-PDF A4, light theme |

---

## 6. Evergreen guidance

- **Source of truth layering:** `src/data/*` = live content · `knowledge/`
  (7 twin files) = the twin's voice · `knowledge/` (5 docs) = project memory ·
  `src/content/posts/` = blog.
- When a design decision lands, **record it in SPRINT_HISTORY.md** so it isn't
  re-debated.
- When the launch checklist completes, **update CURRENT_STATE.md** (the
  placeholder/empty tables).

Cross-ref: [CURRENT_STATE.md](./CURRENT_STATE.md) · [SPRINT_HISTORY.md](./SPRINT_HISTORY.md)
