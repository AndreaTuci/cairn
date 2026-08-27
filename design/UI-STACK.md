# UI Stack — cairn guide

> The contract. Written once at kickoff, read by every later session instead of asking again.
> When something here changes, change it here — not in a chat message that nobody can find later.

## What we are building

An internal guide to cairn: three static pages, `/`, `/riferimento` and `/composizione`. Read by
designers who do not write code and by developers, on the same page. The brief lives at
`design/BRIEF-guida.md` and holds the real copy — it is content to use, not a list of topics to
rewrite. The brief covers the first two pages; the third was asked for in the session of
2026-08-27 and is described in Decisions, row 12.

| | |
|---|---|
| **Target stack** | Astro 6 + Tailwind v4 |
| **Workbench flavour** | `astro` |
| **Designer writes** | `.astro` — plus `.vue` only for an island with a justification |
| **Component kit** | `local` (primitives built here) |
| **Primitive base** | none |
| **Token file** | `design/src/styles/theme.css` |
| **Production token file** | n/a — the workbench *is* the deliverable for this project |

There is no production frontend to promote into. The pages ship as the static HTML that
`npm run design:build` produces. `HANDOFF.md` and `.promoted.json` still apply the day that
changes.

## Pinned versions

Exact, not floated. A workbench that built in March must build in September.

| Package | Version | Why this one |
|---|---|---|
| `astro` | 6.1.6 | 6.4 pulls Vite 8 (rolldown), unsupported by `@tailwindcss/vite` 4.3 |
| `tailwindcss` | 4.2.2 | matches `@tailwindcss/vite` |
| `@tailwindcss/vite` | 4.2.2 | 4.3 does not yet support Vite 8 |

Node: **≥ 22.19** on paper. Verified building on **v22.14.0**, the version on this machine — see
Decisions, row 4. Nothing was unpinned to make that work.

**The pins hold.** An earlier session recorded Vite resolving to 8.2.2 despite them; the
`overrides` block in `package.json` fixed it, and the installed tree is **7.3.6** as intended.
Verified 2026-08-27.

## Budgets

| | |
|---|---|
| Component | ≤ 150 lines |
| Screen | ≤ 250 lines |
| Props per component | ≤ 8 |
| Variant axes per component | ≤ 3 |

Overrides live in `design/ui-audit.config.json`, not in someone's memory.

## Brand

| | |
|---|---|
| **Source** | decided in the design session of 2026-08-27, as the brief asked ("colori, caratteri, e l'elemento signature decidili tu con l'agente") |
| **Direction** | **Segnavia** — stone and a painted trail mark |
| **Typefaces** | IBM Plex Serif (display), IBM Plex Sans (body), IBM Plex Mono (code and numbers). Self-hosted via Astro's fonts API, not linked from a CDN |
| **Signature element** | the red-white-red blaze, hung on a hairline rail running down the left of every page |
| **Seeded at kickoff** | no — seeded in the design session instead, which is where the brief put it |

The direction in one paragraph, so nobody has to reverse-engineer it from the token file: the page
is warm paper the colour of rock in daylight, the text is the near-black of wet stone, and the one
bright thing on it is the oxide red of a *segnavia* — the mark painted on boulders so whoever comes
next finds the way without a guide standing there. Distant ridges give the second accent, a cold
slate blue. The two accents carry the two audiences: `--designer` is the red, `--developer` the
blue, and `--both` is literally the two marks side by side.

Body text is **18px, not 16**, and every pairing is at or above 6:1 on the page background. That is
the print-and-projector constraint below, honoured rather than admired.

What the brief *does* fix, and what the visual direction has to satisfy:

- **Subject**: the stone cairns on a mountain. Marks left by whoever passed first, so whoever
  comes next finds the way without a guide standing there. Stone colour, handmade, built to last,
  the rhythm of marks along a path.
- **Register**: dry, concrete, real numbers. An internal tool somebody trusts, not a product
  landing page. No commercial enthusiasm.
- **Hard constraint**: the page has to read well **printed and on a screen shared in a meeting**.
  Generous body size, full contrast, no grey on grey. This one is not a preference — treat a
  muted-on-muted pairing as a bug.

## Baseline

Not applicable. The project had no frontend before the workbench did, so there is no legacy
number to watch move. The workbench itself is audited clean at kickoff — see Decisions, row 5.

| Date | Blocking | Advisory | Note |
|---|---|---|---|
| 2026-08-27 | 0 | 0 | scaffold as shipped, before any real screen |
| 2026-08-27 | 0 | 0 | both pages built: `/` and `/riferimento`, 14 components, 3 fixtures |
| 2026-08-27 | 0 | 1 | `/composizione` added: 16 components, 4 fixtures. The advisory is the page at 208 of 250 lines |

## Waivers

Every audit rule silenced in this project, and why. A waiver nobody can find is a rule that was
quietly deleted.

| File | Rule | Reason | Taken by | Date |
|---|---|---|---|---|
| — | — | none taken yet | — | — |

## Decisions

Anything a later session would otherwise have to guess.

| # | Question | Resolution | Date |
|---|---|---|---|
| 1 | Content site, dashboard or WordPress? | Content site — two static pages. Astro flavour | 2026-08-27 |
| 2 | Build on an existing component kit? | No. Fresh local primitives in `src/components/ui/` | 2026-08-27 |
| 3 | Seed the tokens from a brand? | No brand exists yet; the brief delegates it to the design session. Placeholders left in place on purpose | 2026-08-27 |
| 4 | Node is v22.14.0, below the ≥22.19 the template asks for | Left alone. Install, build, audit and inventory all pass on 22.14. Revisit only if something actually breaks | 2026-08-27 |
| 5 | Which folders are developer-owned? | `skills/` and `evals/`. Denied to Edit/Write in `.claude/settings.json`; reading stays open | 2026-08-27 |
| 6 | Does the demo screen stay? | No. `src/pages/index.astro` and `articles.astro` are the template's demo and get deleted at the first real screen | 2026-08-27 |
| 7 | Page language? | The pages are in Italian, for the team. Everything else in the repo stays English | 2026-08-27 |
| 8 | What is the visual direction? | *Segnavia* — stone and a painted trail mark. See Brand above; the full reasoning is a comment at the top of `theme.css` | 2026-08-27 |
| 9 | Fonts from a CDN or self-hosted? | Self-hosted, through Astro's `fonts` config. The guide is printed and projected, and a font that arrives over the wire is a font that sometimes does not | 2026-08-27 |
| 10 | What happened to `Button.astro`? | Deleted with the demo screens. Neither page has a button on it, and an unused component is a blocking audit finding, not a convenience. It comes back when a screen needs one | 2026-08-27 |
| 11 | Are the four states answered? | Yes, and the answer is n/a for three of them: every page is a static document with no fetching and no list that can be empty. Recorded in `HANDOFF.md`, and `/composizione` renders the reasoning from `statesNotDrawn` rather than filing it | 2026-08-27 |
| 12 | What is the third page? | `/composizione` — how the guide itself is built. Two movements: a gallery of the components, then the situations the project had to answer for. Read by whoever is about to inherit the components or ask for a new one. Organisation, reader and name were the designer's call, taken in the session of 2026-08-27 | 2026-08-27 |
| 13 | Are the examples on `/composizione` live or drawn? | Live — the real components, imported. A page arguing for composition using screenshots of composition would refute itself. It also means the page cannot go stale, which is the property to protect in any rework | 2026-08-27 |
| 14 | Six of the sixteen components are the page itself. Draw them anyway? | No. `SiteHeader`, `PageIntro`, `Section`, `SiteFooter`, `Specimen` and `PartsGallery` are pointed at, not redrawn. Drawing them twice is the duplication the guide exists to prevent | 2026-08-27 |
| 15 | `otherPage()` breaks at three pages | Replaced with `nextPage()` — next in file order, wrapping at the end. File order is reading order | 2026-08-27 |
| 16 | Print regressed when a section grew taller than a sheet | `section { break-inside: avoid }` replaced with per-unit avoidance (`figure`, list rows) plus `break-after: avoid` on headings. All three pages print shorter: 6→4, 5→4, and the new one at 7 | 2026-08-27 |
