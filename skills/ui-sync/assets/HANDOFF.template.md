# Handoff — <project>

> Written by the designer's agent at the end of a batch, read by a developer before starting.
> It answers one question ahead of every other: **what here is real, and what is faked?**
>
> This document does not track who has promoted what — that lives in `.promoted.json` and is read
> with `node .ui/ui-drift.mjs --root .`. Two places holding the same fact is how both become wrong.

Last updated: YYYY-MM-DD

## Screens

| Screen | What it is for | States drawn | Notes |
|---|---|---|---|
| `/pricing` | Choosing a plan | ready · empty · error | Loading n/a — static page |

"States drawn" is the honest list. If loading does not apply, say so here rather than leaving the
question open — an unanswered state is one a developer will invent alone.

## Components

Two kinds, and the distinction is the whole point of the table.

**Stable contracts** — designed deliberately, expected to survive. Build against these.

| Component | Variants | Used on | Notes |
|---|---|---|---|

**Placeholders** — put there to make a screen work, not designed. Expect them to change, and do
not build anything on top of them yet.

| Component | Why it is provisional |
|---|---|

The full list with props and usage counts is generated in `INVENTORY.md`; this table is only about
which ones you can trust.

## Data contracts

The seam. Every entity the screens need, taken from the typed fixtures — the backend implements
against this list, and the front end already renders it.

### `Article`

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | |
| `title` | string | yes | longest seen in design: 118 characters — the layout holds |
| `publishedAt` | string | yes | ISO date; formatted in the component, not in the data |
| `image` | string | **no** | absent on ~1 in 5. The empty case is drawn |

**Behaviour the design assumes**

| | |
|---|---|
| Ordering | newest first |
| Volume | typically 8–20, up to ~200 |
| Empty | drawn — see `/articles` |
| Error | drawn — see `/articles` |

Repeat per entity. An optional field with no note is a question nobody has answered yet.

## Faked

Everything that looks like it works and does not. Be specific — a developer reading this should
never be surprised later.

| Where | What is faked | What it should do |
|---|---|---|
| `/pricing` | The "Choose plan" button goes nowhere | Start checkout |
| `/articles` | Filters are decorative | Filter server-side |

## Checked, and not checked

What actually ran, and what this environment could not run. A check nobody ran and everybody
assumes passed is worse than one that was never claimed.

| Check | Result |
|---|---|
| `npm run design:check` | clean |
| `npm run design:build` | green |
| Read in a browser at phone and desktop width | |
| Printed | |

## Known limitations

What this build does not do, and was never going to. Different from *Faked*: that section is about
things that look wired and are not.

| | |
|---|---|
| — | — |

## Waivers

Every audit rule silenced, with the reason. A waiver nobody can find is a rule that was quietly
deleted.

| File | Rule | Reason | Date |
|---|---|---|---|

## Islands and interactivity

Only where a Vue island was used, and why. Astro ships no client JavaScript by default; every
exception is a decision, and this is where it is recorded so the next person does not assume
islands are the norm here.

| Component | Directive | Why it needs client state |
|---|---|---|

## Open questions

What the designer could not answer, and who needs to.

| # | Question | Waiting on |
|---|---|---|
