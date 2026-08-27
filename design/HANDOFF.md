# Handoff — cairn guide

> Written by the designer's agent at the end of a batch, read by a developer before starting.
> It answers one question ahead of every other: **what here is real, and what is faked?**
>
> This document does not track who has promoted what — that lives in `.promoted.json` and is read
> with `node .ui/ui-drift.mjs --root .`. Two places holding the same fact is how both become wrong.

Last updated: 2026-08-27 (second design session — the third page)

Read `UI-STACK.md` first for the one thing that changes how you use this file: **there is no
production frontend to promote into.** The workbench *is* the deliverable. `npm run design:build`
produces the three pages as static HTML in `dist/`, with no client JavaScript at all — zero
`<script>` tags on any page — and that output is what ships. Everything below is written for the day
that changes.

## Screens

| Screen | What it is for | States drawn | Notes |
|---|---|---|---|
| `/` | What cairn is, why it exists, and what each of the two roles does with it | ready | empty · loading · error all n/a — static document, no fetching, no list that can be empty |
| `/riferimento` | The five skills, the four composition rules, the ten rules the gate enforces | ready | same: n/a for the other three |
| `/composizione` | How the guide itself is built: the components it is made of, and the situations it had to answer for | ready | same: n/a for the other three |

The four states were asked and answered rather than skipped. Every page renders content that is
present at build time; nothing is fetched, nothing can arrive late, and no list can come back
empty. If any list ever moves behind an API or a CMS — see Open questions, row 1 — those three
states become real and are **not drawn**. `/composizione` renders that answer on the page, from
`statesNotDrawn` in `src/fixtures/inventory.ts`, so the reasoning is readable rather than filed.

`/composizione` is self-referential on purpose: every example on it is the real component imported
and rendered, never a screenshot. That is the property to preserve. A change to `Card` changes the
`Card` example, and the page cannot go quietly out of date.

Printing is a designed target, not a side effect: the theme carries a `@media print` block that
drops the page to true white, keeps both accents and wraps code blocks. **That block changed this
session.** It used to hold `section { break-inside: avoid }`, which cost a whole sheet whenever a
section was taller than a page — the browser pushed it, then split it anyway. It now keeps the
small units whole (`figure`, a list row, an `li`) and refuses to orphan a heading. All three pages
print shorter for it: 6→4 sheets, 5→4, and the new page at 7.

## Components

Two kinds, and the distinction is the whole point of the table.

**Stable contracts** — designed deliberately, expected to survive. Build against these.

| Component | Variants | Used on | Notes |
|---|---|---|---|
| `Blaze` | size · tone | both | The signature mark — a red-white-red trail blaze. Three stacked bands, no SVG, so it prints as solid ink. Everything visual in this design hangs off it |
| `Text` | variant · as | both | Body copy. The only place a reading size is decided |
| `Code` | — | both | Inline code term. `whitespace-nowrap`, deliberately — a split pill reads as a typo |
| `CodeBlock` | wrap | both | `wrap="none"` scrolls (fixed-width tool output), `wrap="soft"` wraps (a long single line). Print wraps both |
| `Card` | elevation | `/riferimento` | `elevation="flat"` was added for this project: a page made of paper has nothing on it that floats |
| `Section` | tone | both | Hangs a blaze on the rail. `tone` is how a reader sees which stretch of the page is theirs |
| `RoleBadge` | role | both | See the note under Data contracts — `role="both"` is the load-bearing case |
| `DefinitionRow` | emphasis | `/riferimento` | One row shape serving two different lists. Do not fork it |
| `Figure` | — | `/` | One measured number and what was counted |
| `LabelledList` | tone | `/` | Short heading over plain statements |
| `PageIntro` | — | both | The page's only `h1`, and the first mark on the rail |
| `RichText` | — | both | Renders fixture copy, setting its backticked terms as code |
| `SiteHeader` · `SiteFooter` | — | all | Current page derived from `Astro.url.pathname`, never passed as a prop. `SiteFooter` now uses `nextPage()`, not `otherPage()` — see below |
| `Specimen` | layout | `/composizione` | The frame around a live example. Borrows `CodeBlock`'s anatomy — labelled bar over content — because it makes the same promise. Its body sits on `bg-background`, not `bg-card`, so a white surface put inside it is still visible as one |
| `PartsGallery` | — | `/composizione` | Ten `Specimen`s in a grid: the catalogue of this project's own components. Zero props on purpose — it is a list, and it grows by one entry every time the project does |

**Placeholders** — put there to make a screen work, not designed.

| Component | Why it is provisional |
|---|---|
| — | none. Every component above was built for the page it is on |

The full list with props and usage counts is generated in `INVENTORY.md`; this table is only about
which ones you can trust.

Three coupling points worth knowing before you move anything:

- `Section` and `PageIntro` position their blaze with negative offsets that match the rail padding
  declared in `layouts/Page.astro`. Move one, move all three.
- **`navigation.ts` changed shape.** `otherPage()` — "the page you are not on" — only has one
  answer while there are two pages, so it is gone. `nextPage()` replaces it: next in file order,
  wrapping at the end. File order is reading order, which is why it is not alphabetical.
- `PartsGallery` shows ten of the sixteen components. The other six — `SiteHeader`, `PageIntro`,
  `Section`, `SiteFooter`, `Specimen`, `PartsGallery` — *are* the page around it, and the page
  points at them instead of drawing them twice. Add a component and the gallery does not update
  itself; see Open questions, row 4.
- `Card`, `Button` and the rest of the kickoff scaffold: `Button.astro` was **deleted**. Neither
  page has a button on it, and an unused component is a blocking audit finding rather than a
  convenience. It comes back the day a screen needs one.

## Data contracts

The seam. Every entity the screens need, taken from the typed fixtures.

### `Skill` — `src/fixtures/skills.ts`

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | The name typed at the prompt. Always rendered as code. Longest seen: 15 characters |
| `readBy` | `'designer' \| 'developer' \| 'both'` | yes | **Three values, not two.** See below |
| `when` | string | yes | One sentence, lower case, no full stop. Longest seen: 65 characters — the row holds |

`readBy: 'both'` is the awkward case and it is deliberate. A skill both roles read is not a third
colour: `RoleBadge` renders it as the two marks side by side, which is a *structural* difference,
and `DefinitionRow` gives those rows `emphasis="strong"`. Two of the five rows are `both`. A
front end tested only on `designer` and `developer` would ship without noticing.

**Behaviour the design assumes**

| | |
|---|---|
| Ordering | the order of the file, which is the order a project meets them — not alphabetical |
| Volume | exactly 5. This is a closed list, not a collection |
| Empty | n/a — a cairn with no skills is not a state, it is a broken build |
| Error | n/a |

### `AuditRule` — `src/fixtures/audit-rules.ts`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Exactly as the report prints it. Longest seen: 18 characters (`arbitrary-repeated`) |
| `catches` | string | yes | One sentence. Backticked terms are set as code by `RichText`. Longest seen: 89 characters — wraps to two lines, which is drawn |

**Behaviour the design assumes**

| | |
|---|---|
| Ordering | token rules, then structure, then a11y — the order the audit itself reports in |
| Volume | 10 today. The design holds a longer list without changes |
| Empty | n/a — see Open questions, row 1 |
| Error | n/a |

### `Metric` — `src/fixtures/metrics.ts`

| Field | Type | Required | Notes |
|---|---|---|---|
| `value` | string | yes | **String, not number.** One of the five is `85%` and the rest are counts. A design that renders `85` and `27` identically has lost the difference |
| `label` | string | yes | What was counted. Backticked terms set as code. Longest seen: 59 characters |

**These numbers are real.** They were measured on one of our own projects — written by good
developers, with no designer near it — and they are the most convincing thing on either page. Do
not treat them as sample data to be replaced.

**Behaviour the design assumes**

| | |
|---|---|
| Ordering | as written; the largest count first is incidental, not a sort |
| Volume | exactly 5 |
| Empty | n/a |
| Error | n/a |

### `Metric` (reused) · `PageFramePart` · `StateAnswer` — `src/fixtures/inventory.ts`

New this session, and the only fixture on the seam between the guide and its own source.

| Export | Shape | Notes |
|---|---|---|
| `composition` | `Metric[]` | The counts on `/composizione`: 16 components, 0 unused, 10 shown. Reuses `Metric` rather than declaring a second `{value,label}` |
| `pageFrame` | `{ name, where }[]` | The six components that are the page itself, and where on the page the reader is already looking at each one |
| `statesNotDrawn` | `{ name, why }[]` | Empty, loading, error — and the reason each does not exist here. The handoff's answer, rendered |

**These numbers are typed by hand from `INVENTORY.md`.** They were true when written and they are
the first thing on the page that can lie. See Open questions, row 4.

**Behaviour the design assumes**

| | |
|---|---|
| Ordering | as written. `pageFrame` runs top-to-bottom down the page, which is why it is not alphabetical |
| Volume | 3 · 6 · 3 |
| Empty | n/a — a guide with no components in it does not have this page |
| Error | n/a |

### Not a fixture

`src/lib/navigation.ts` holds the three pages the site has. It is real structure, not mock data —
the header and the footer both read it so they cannot disagree about which page you are on. Adding
a fourth page means adding a row here and nothing else.

## Faked

Everything that looks like it works and does not.

| Where | What is faked | What it should do |
|---|---|---|
| — | nothing | All three pages are static documents. Every link goes where it says, all are internal, and there is no control on any page that pretends to do something |

## Waivers

Every audit rule silenced, with the reason. A waiver nobody can find is a rule that was quietly
deleted.

| File | Rule | Reason | Date |
|---|---|---|---|
| — | — | none taken. `npm run design:check` reports no blocking findings | — |

One standing advisory, not a waiver: `pages/composizione.astro` is 208 lines against a 250-line
budget. The gallery was already lifted out into `PartsGallery.astro` for exactly this reason. A
seventh situation on that page needs another extraction, not a bigger budget.

## Islands and interactivity

| Component | Directive | Why it needs client state |
|---|---|---|
| — | — | none. No page ships a single byte of client JavaScript — verified on the built output, not assumed |

Fonts are self-hosted, not linked from a CDN: the guide has to read the same printed, on a shared
meeting screen, and on a laptop with no network. Three IBM Plex families — Serif for headings, Sans
for body, Mono for code and numbers — are downloaded at build time into `dist/_astro/`.

## Open questions

| # | Question | Waiting on |
|---|---|---|
| 1 | The five skills and the ten audit rules are typed by hand here, and both already exist in the repo — the skills as folders under `skills/`, the rules in `.ui/lib/rules-*.mjs`. Should the page generate them from source instead? If yes, the empty and error states become real and need designing | a developer |
| 2 | The type scale has no step between 22px and 32px. The third page has now been written and still did not need one, so the gap is real rather than an oversight. Add it as a declared step the day something does, never inline | whoever writes the fourth page |
| 3 | ~~The install resolved Vite 8.2.2 against Astro 6.1.6's Vite 7.~~ **Resolved.** `package.json` carries `overrides: { vite: "7.3.6" }` and the installed tree is 7.3.6. Worth one confirmation on a clean `npm ci` | closed |
| 4 | The counts on `/composizione` — 16 components, 0 unused, 10 shown — are typed into `src/fixtures/inventory.ts` from the generated `INVENTORY.md`. They go stale the day somebody adds a component, on the one page whose whole claim is that it cannot go stale. Should the fixture be generated by `ui-inventory.mjs` alongside the markdown? | a developer |
| 5 | `PartsGallery` lists ten components by hand for the same reason, and a new component silently does not appear in it. The `unused-component` rule catches a component nobody imports, but nothing catches one the catalogue forgot. Same fix as row 4, or a check of its own | a developer |
