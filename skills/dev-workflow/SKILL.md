---
name: dev-workflow
description: "How a developer builds frontend from a designer's prototype: start from HANDOFF.md and the drift report, triage before touching anything, wire real data without changing component contracts, review, and feed back into design/ whatever production learns. Use when implementing any UI a designer prototyped, when picking up work in a repository that has a design/ workbench, and when production discovers something the design never answered."
license: MIT
metadata:
  author: Lotrek
  version: 1.0.0
---

# Dev Workflow

Building production frontend when a designer got there first.

The premise is unusual and worth stating: the design is not a picture, it is **running code you
did not write and are not free to ignore**. That is what makes the whole arrangement faster than
mockups — and it only stays faster if the two copies keep matching. Most of this file is about the
second half.

This owns the frontend seam. `ui-composition` says how UI is composed; `ui-sync` owns the handoff,
the triage tables and the per-stack promotion procedures; `feature-workflow` owns the general
process for a multi-file, multi-session feature — phase plans, `NOTES`, the semaphore, the
suggested-commits table — and composes with this one rather than being restated here.

## Start here, every time

Three commands before writing anything. They take a minute and they change what you build.

```bash
cat design/HANDOFF.md                        # what is real, what is faked
node design/.ui/ui-drift.mjs --root design   # what moved since anyone last looked
node design/.ui/ui-audit.mjs --root design --all
```

Read `design/UI-STACK.md` too, once, if you have not: it holds the pinned versions, the budgets and
every waiver taken on this project.

**If the drift report is not empty, deal with it before starting the feature.** Building on a
component the designer has already moved past means doing the work twice, and discovering it at
review is the expensive moment.

## Then triage, before touching anything

Per file: **keep**, **normalize**, or **rewrite**. The tables and the per-stack procedures are in
`ui-sync` — do not restate them, follow them.

Put the triage in front of whoever asked for the work before you start. It is a two-minute table
and it is the cheapest possible moment to discover that four files need rewriting.

## Wiring real data

This is the bulk of the work and it has one rule that carries everything:

> **Do not change a component's props to fit your data. Change your data to fit the props.**

The designer decided what a card needs. If your API returns something differently shaped, the
mapping belongs in the data layer, not in the component — otherwise the component drifts from the
prototype on day one and every later sync is archaeology.

```diff
- import { articles } from '../fixtures/articles'
+ const articles = (await getArticles()).map(toArticle)
```

**Keep that mapping pure.** It takes the payload and returns the shape the component wants, and it
does nothing else: no fetching, no globals, no environment, no reading the clock. Anything
time-dependent is passed in. A mapper that reaches for `new Date()` is a component that renders
differently on the server and in the browser, and the bug surfaces as a hydration mismatch three
screens away from the cause.

If a prop shape genuinely has to change — the design asked for something the data cannot provide —
that is not a quiet edit. Change it in the workbench too, in the same piece of work, and tell the
designer. Two shapes for one component is where the arrangement starts costing more than it saves.
**Every call site moves in the same change**, or the contract has two versions and the compiler
only knows about one of them.

**Wire every state the designer drew.** They are in the handoff, they exist as branches in the
prototype, and skipping them is how a product ends up with three different empty states. Keep the
branch order: pending, error, empty, ready.

## Before changing anything shared

A designer's mistake reaches the screen they are on. Yours reaches every project.

So before editing something that ships beyond this repository — the audit tooling, a skill, a
workbench template — **stop and ask which project will use it.** If the honest answer is "this
one", it belongs in this project, not in the shared thing.

This is the three-tier rule from `ui-composition` one floor up. A primitive that knows what an
article is has been put on the wrong tier; a tool that knows the name of one project's component
has made the same mistake, and it is wrong in every other project at once — silently, because
nobody there asked for it.

It has happened once already, and it is worth knowing what it looked like, because it did not look
like a mistake: the task was to derive a number instead of hand-typing it, the reasoning was
right, and the three lines went into the tool simply because that is where the file was already
open. No audit catches this. The audit reads the project's code, never its own.

The vendored copies are protected by permissions in a client project, so the version of this that
bites is subtler: adding a flag "just for us", widening a rule to fit today's case, teaching a
script one project's folder names. Each one is defensible alone. Together they are how a shared
tool stops being shared.

## What production learns goes back

The half everybody skips, and the half that decides whether this works in six months.

Production discovers things a prototype cannot: the API returns a status nobody mentioned, real
titles are longer than the longest fixture, a permission hides half the screen, an error case turns
out to exist. Every one of those is **information the design does not have**.

If it stays in production, `design/` becomes fiction within two months — and a workbench nobody
trusts is a workbench nobody maintains, which brings the whole arrangement down.

So: when production learns something design-visible, it goes back into the workbench.

| Production discovered | Goes back as |
|---|---|
| A field that can be null and is not marked optional | update the fixture type; the designer draws the missing state |
| Real content far longer than any fixture | add that row to the fixtures. It is the row that finds the bug |
| A state nobody drew — partial, pending approval, archived | tell the designer; they draw it |
| A permission that changes what is on screen | tell the designer; it is a different screen, not a hidden div |
| A component that had to be rewritten in production | say so, so the designer knows their copy no longer matches what ships |

**What does not go back:** production bug fixes, performance work, refactors, anything invisible.
The workbench is the design's source of truth, not production's mirror. Round-tripping everything
would make it a second codebase to maintain, which is exactly what it must not become.

The mechanism is a message to the designer, or a line in the handoff's open questions. If you
change the workbench yourself, say so — it is their folder, and finding your edits unannounced is
how trust in the arrangement ends.

## Building UI with no designer

Internal tools, admin screens, a form nobody will ever look at twice. Everything in
`ui-composition` still applies — the tokens, the rule of two, the four states, the accessibility
floor — because the next person reading it has the same problems whether a designer was involved
or not.

What does not apply: there is no handoff to read, no drift to check, nothing to send back. Build
it in the project, audit it, done.

The one thing worth keeping is the four states question. Admin screens are where undesigned empty
states go to be embarrassing.

## Review, before you ask anyone to commit

`feature-workflow` covers the general review pass. Frontend adds these, and they are quick:

```bash
node design/.ui/ui-audit.mjs --root <production folder> --token-file <path> --ignore ui
```

- **Audit clean**, or every waiver written down with a reason.
- **Tokens identical** between `design/` and production. If a value differs, one of them is wrong,
  and every component built on it is wrong too.
- **Every state wired**, not just the happy path.
- **Every island justified.** Astro ships no client JavaScript by default. If you added a
  `client:*` directive, there is a line in the handoff saying why.
- **Nothing left importing fixtures.** A fixture import that reaches production is a page that
  renders two articles forever and nobody notices for a week.
- **Promotions recorded** — `ui-drift.mjs --record`, or the next drift report is noise.

## Commits

`feature-workflow` owns the suggested-commits table and the rule that the agent never commits.
Two things specific to this work:

- **A normalize is its own `refactor(...)` commit.** If a designer's component is renamed or
  restructured on the way into production, that change has to be readable on its own — both for
  review and to be able to explain it back to the designer later.
- **Token changes travel with nothing else.** `feat(theme): add accent tokens` on its own line.
  A token change touches everything downstream, and it is the one commit anyone will ever want to
  revert in isolation.

## A note on Copilot

Most developers here work in Copilot rather than Claude. Everything above is written to survive
that: the tooling is plain Node with no install step, the instructions live in `AGENTS.md` with
`.github/copilot-instructions.md` pointing at it, and no step depends on a Claude-only capability.

If something in this file cannot be done in your environment, say so plainly rather than skipping
it quietly. A skipped step nobody mentions is indistinguishable from a step that was not needed.
