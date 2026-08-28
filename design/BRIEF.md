# Brief — the cairn guide

> The product contract, and the designers' half of it: what this is, who opens it, how it speaks.
> `UI-STACK.md` is the technical half. Written once, corrected as sessions answer new questions,
> read at the start of every session instead of asking again.
>
> Written in the working language recorded in `UI-STACK.md`, because this is the one file in the
> system a designer reads and edits by hand.

## What this is

An internal guide to cairn, shipped as static HTML. It has to look like a working tool somebody
trusts, not a product landing page. No commercial enthusiasm, no "transform your workflow".

## Who opens it

Designers who do not write code, and developers. Two audiences on the same page, and each has to
see at a glance which part is theirs.

## How it speaks

Dry, concrete, real numbers. The most convincing thing on the page is data from a real project,
not the adjectives around it.

## The subject

The stone cairns on a mountain. Marks left by whoever passed first, so whoever comes next finds
the way without a guide standing there. Everything follows from it: the colour of stone, the
feeling of something made by hand and left to last, the rhythm of marks along a path.

## The hard constraint

The page has to read well **printed and on a screen shared in a meeting**. Generous body size,
full contrast, no grey on grey. This is not a preference — treat a muted-on-muted pairing as a bug.

## The pages

Four, in reading order. `/` argues, `/getting-started` instructs, `/reference` lists,
`/composition` shows the workings.

| Page | Route | What it is for |
|---|---|---|
| Guide | `/` | What cairn is, why, and what each role does with it |
| Getting started | `/getting-started` | Every step of using cairn, numbered, grouped by who does what |
| Reference | `/reference` | The five skills, the four rules, what the gate checks |
| Composition | `/composition` | How the guide itself is built, shown with its own components |

**The copy lives on the pages, not here.** It used to be written out in this file as well, and two
copies of one sentence is the failure this project exists to prevent. The pages are the source; a
change to the words is made there.

The first two pages were commissioned together, in the brief of 2026-08-27; `/composition` and
`/getting-started` were added in the design sessions of the same day. See `UI-STACK.md`,
Decisions, rows 12 and 17.

## The words

| Thing | What we call it |
|---|---|
| `design/` | the workbench |
| `HANDOFF.md` | the handoff |
| `npm run design:check` | the check, or the gate |
| `UI-STACK.md` | the project contract |
| a silenced audit rule | a waiver |
| the red-white-red mark | the blaze — *segnavia* in the original |

## The data

Two entities, both typed as fixtures, both rendered by one reused component:

- **Skill** — `name`, `readBy` (`designer` · `developer` · `both`), `when`
- **AuditRule** — `id`, `catches`

`readBy: 'both'` is the awkward case and it is deliberate: it is where you see whether the tool
makes a variant or a second component.

## What does not go on the pages

- No roadmap, nothing "coming soon".
- No screenshots. There are none, and inventing them falsifies what the guide claims about itself.
- No section on the backend. The contact point today is one section of the handoff, and writing
  more would promise something that does not exist.

Installation and the order of operations **do** belong here, on `/getting-started`. That reverses
the original brief, which sent them to the README: a reader who has never seen cairn needs one
complete list, and splitting it across a README and a guide is how a step goes missing.

## Freedoms

Colours, typefaces and the signature element were the designer's call, taken with the agent in the
session of 2026-08-27. The result is recorded under Brand in `UI-STACK.md`, with the reasoning at
the top of `theme.css`.
