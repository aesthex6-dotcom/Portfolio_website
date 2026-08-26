# The Soundtrack — Track Credits & Licensing

Audit record for every audio file used in the Soundtrack player. All tracks
are sourced from **Mixkit Free Stock Music** (`https://mixkit.co/free-stock-music/`)
and hosted locally under `public/audio/` (no hotlinking, no remote streaming).

Source of truth for the playlist itself: `src/data/playlists.json` (version 3).

---

## License — Mixkit Stock Music Free License

Verified 2026-08-11 from the official terms at
`https://mixkit.co/license/` (modal: *Stock Music Free License*).

> "Items under the Mixkit Stock Music Free License can be used in your
> commercial and non-commercial projects for free."
>
> "You're permitted to **download, copy, modify, distribute and publicly
> perform** the Music Items on any **web** or social media platform, including
> internet-based video on demand services, podcasts and advertisements."
>
> "You're not allowed to use them in CDs or DVDs, video games or tv or radio
> broadcast. You're also not allowed to remix them (or incorporate in a
> music-only track), claim them as your own or register them on any rights
> management service."

**Verdict for this website:** permitted. The files are downloaded and hosted
locally on a personal portfolio website — a "web platform" use under the
license. No attribution is *required*, but the source of each track is
recorded here for transparency. The audio files are used as-is (not remixed,
not repackaged as a music-only product).

---

## Tracks

| # | Title | Artist | Duration | Source URL | Original audio asset | Local file (`public/audio/`) |
|---|---|---|---|---|---|---|
| 1 | Serene View | Arulo | 1:54 | https://mixkit.co/free-stock-music/serene-view/ | https://assets.mixkit.co/music/443/443.mp3 | `serene-view.mp3` |
| 2 | Sleepy Cat | Alejandro Magaña (A. M.) | 1:59 | https://mixkit.co/free-stock-music/sleepy-cat/ | https://assets.mixkit.co/music/135/135.mp3 | `sleepy-cat.mp3` |
| 3 | Sweet September | Arulo | 1:39 | https://mixkit.co/free-stock-music/sweet-september/ | https://assets.mixkit.co/music/282/282.mp3 | `sweet-september.mp3` |
| 4 | Feedback Dreams | Eugenio Mininni | 2:29 | https://mixkit.co/free-stock-music/feedback-dreams/ | https://assets.mixkit.co/music/588/588.mp3 | `feedback-dreams.mp3` |
| 5 | Vastness | Andrew Ev | 3:50 | https://mixkit.co/free-stock-music/vastness/ | https://assets.mixkit.co/music/184/184.mp3 | `vastness.mp3` |
| 6 | Forest Walk | Eugenio Mininni | 2:54 | https://mixkit.co/free-stock-music/forest-walk/ | https://assets.mixkit.co/music/607/607.mp3 | `forest-walk.mp3` |
| 7 | Opalescent | Eugenio Mininni | 4:44 | https://mixkit.co/free-stock-music/opalescent/ | https://assets.mixkit.co/music/593/593.mp3 | `opalescent.mp3` |

Durations were read from the downloaded MP3 files (MPEG frame-header parse)
and match Mixkit's published track durations.

---

## Playlist notes

- **Order & arc** (one continuous late-night coding session):
  *Late Night* — Serene View (arrival/calm) → Sleepy Cat (cozy) → Sweet
  September (focused coding) · *Dream State* — Feedback Dreams (dreamy) →
  Vastness (deeper concentration) · *Atmosphere* — Forest Walk (atmospheric)
  → Opalescent (cinematic finish).
- **Genre:** Lo-Fi Beats, Chillout, Ambient (Mixkit genres for the selected
  tracks).
- **Artwork:** Mixkit provides no track artwork for reuse, so the player uses
  the existing generated gradient covers (`artwork.from/to` in
  `playlists.json`) — no third-party images are bundled.
