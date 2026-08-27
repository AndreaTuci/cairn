# Handoff — cairn guide

> Written by the designer's agent at the end of a batch, read by a developer before starting.
> It answers one question ahead of every other: **what here is real, and what is faked?**
>
> This document does not track who has promoted what — that lives in `.promoted.json` and is read
> with `node .ui/ui-drift.mjs --root .`. Two places holding the same fact is how both become wrong.

Last updated: 2026-08-27

Read `UI-STACK.md` first for the one thing that changes how you use this file: **there is no
production frontend to promote into.** The workbench *is* the deliverable. `npm run design:build`
produces the two pages as static HTML in `dist/`, with no client JavaScript at all — zero `<script>`
tags in either page — and that output is what ships. Everything below is written for the day that
changes.

## Screens

| Screen | What it is for | States drawn | Notes |
|---|---|---|---|
| `/` | What cairn is, why it exists, and what each of the two roles does with it | ready | empty · loading · error all n/a — static document, no fetching, no list that can be empty |
| `/riferimento` | The five skills, the four composition rules, the ten rules the gate enforces | ready | same: n/a for the other three |

The four states were asked and answered rather than skipped. Both pages render content that is
present at build time; nothing is fetched, nothing can arrive late, and no list can come back
empty. If either list ever moves behind an API or a CMS — see Open questions, row 1 — those three
states become real and are **not drawn**.

Printing is a designed target, not a side effect: the theme carries a `@media print` block that
drops the page to true white, keeps both accents, wraps code blocks and refuses to split a section
across a page break. Check it before changing the theme.

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
| `SiteHeader` · `SiteFooter` | — | both | Current page derived from `Astro.url.pathname`, never passed as a prop |

**Placeholders** — put there to make a screen work, not designed.

| Component | Why it is provisional |
|---|---|
| — | none. Every component above was built for the page it is on |

The full list with props and usage counts is generated in `INVENTORY.md`; this table is only about
which ones you can trust.

Two coupling points worth knowing before you move anything:

- `Section` and `PageIntro` position their blaze with negative offsets that match the rail padding
  declared in `layouts/Page.astro`. Move one, move all three.
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

### Not a fixture

`src/lib/navigation.ts` holds the two pages the site has. It is real structure, not mock data —
the header and the footer both read it so they cannot disagree about which page you are on.

## Faked

Everything that looks like it works and does not.

| Where | What is faked | What it should do |
|---|---|---|
| — | nothing | Both pages are static documents. Every link goes where it says, both are internal, and there is no control on either page that pretends to do something |

## Waivers

Every audit rule silenced, with the reason. A waiver nobody can find is a rule that was quietly
deleted.

| File | Rule | Reason | Date |
|---|---|---|---|
| — | — | none taken. `npm run design:check -- --all` is clean, advisories included | — |

## Islands and interactivity

| Component | Directive | Why it needs client state |
|---|---|---|
| — | — | none. Neither page ships a single byte of client JavaScript |

Fonts are self-hosted, not linked from a CDN: the guide has to read the same printed, on a shared
meeting screen, and on a laptop with no network. Three IBM Plex families — Serif for headings, Sans
for body, Mono for code and numbers — are downloaded at build time into `dist/_astro/`.

## Open questions

| # | Question | Waiting on |
|---|---|---|
| 1 | The five skills and the ten audit rules are typed by hand here, and both already exist in the repo — the skills as folders under `skills/`, the rules in `.ui/lib/rules-*.mjs`. Should the page generate them from source instead? If yes, the empty and error states become real and need designing | a developer |
| 2 | The type scale has no step between 22px and 32px. Nothing on these two pages needed one; a third page might. Add it as a declared step when it does, never inline | whoever writes the third page |
| 3 | The install resolved **Vite 8.2.2**, and Astro 6.1.6 asks for Vite 7 — it warns on every `npm run design`. Everything works today: the build passes, Tailwind compiles, the audit is clean. The `overrides` Astro suggests were not added, because changing a dependency is not a designer's call. Decide whether to pin it | a developer |
