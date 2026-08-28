---
name: ui-sync
description: "The living contract between the design workbench and production: writes HANDOFF.md from what the designer built (screens, components, data contracts, what is faked, waivers), detects drift when designers keep editing after promotion, and guides promoting a prototype into an Astro, Nuxt or WordPress project. Use when closing a design session, when picking up designer work, when promoting components into production, and whenever asking what changed in design/ since last time."
license: MIT
metadata:
  author: Andrea Tuci
  version: 1.0.0
---

# UI Sync

One document and one script keeping two copies of the same design honest with each other, for as
long as the project lasts.

`design/` is permanent, not a phase. Designers keep correcting it while development runs — that is
simply how the work goes here. So production is a copy that drifts from a source that keeps
moving, and a handoff written once is out of date the week after it is written.

Two sides, one skill, because it is one artifact:

| You are | You do |
|---|---|
| A designer's agent, closing a session | Write `HANDOFF.md` |
| A developer, picking work up | Read it, triage, promote, record the promotion |
| A developer, coming back later | Ask what drifted, and rework only that |

## Writing the handoff — the designer's side

At the end of a batch of screens, not after every screen. From
`assets/HANDOFF.template.md`, keeping the section order exactly: a developer learns where to look
once, and every project rewards them for it.

It answers one question ahead of all others: **what here is real, and what is faked?**

Generate what can be generated, and do not restate what another file already holds:

- **Components** — `INVENTORY.md` already lists props and usage. The handoff adds only the thing a
  generator cannot know: which components are stable contracts and which are placeholders that
  happened to make a screen work.
- **Data contracts** — read them out of the typed fixtures. Every entity, every field, every
  optional marker, plus the behaviour the design assumes: ordering, volume, and what empty and
  error look like. This section is the seam the backend implements against, and it is the reason
  no separate backend skill is needed yet.
- **Faked** — every interaction that is a stub, named specifically. "The filters are decorative"
  beats "some things are not wired up" by a week of somebody's time.
- **Waivers** — do *not* put them here either. They live in `UI-STACK.md`, which outlives a batch,
  and the audit prints every one it honoured on every run so the register is a paste rather than a
  memory test.
- **What was checked, and what could not be** — the checks that actually ran, and the ones this
  environment could not run, named. A gap somebody can see is a gap somebody can close; a check
  silently skipped reads exactly like a check that passed.
- **Known limitations** — what this build does not do and was never going to. Different from
  *Faked*, which is about things that look wired and are not.
- **Promotion status** — do *not* put it here. It lives in `.promoted.json` and is read with
  `ui-drift`. Two places holding one fact is how both become wrong.

Write it in English, like every other file. Do not ask the designer to review it — it is written
for developers, and asking a designer to check a document they are not the audience for wastes
their time and teaches them to skim.

## Reading it — the developer's side

Before writing anything, three commands and one decision.

```bash
cat design/HANDOFF.md
node design/.ui/ui-drift.mjs --root design
node design/.ui/ui-audit.mjs --root design --all
```

Then triage, per file, **before touching any of it**:

| | When | What it costs |
|---|---|---|
| **Keep** | it follows the rules and fits the project | a move |
| **Normalize** | right shape, wrong details — naming, a missed token, a budget overrun | a `refactor(...)` commit of its own |
| **Rewrite** | the prototype answered a different question than production asks | a conversation with the designer, because the screen they see is no longer the screen that ships |

Put the triage in front of the person who asked for the work before you start. It is a two-minute
table, and it is the cheapest moment to discover that "rewrite" was the answer for four files
nobody expected.

**A normalize is never a silent edit inside a feature commit.** If the designer's component gets
renamed or restructured on the way in, that is its own `refactor(...)` commit — so the diff stays
readable and so the change can be explained back to the designer without archaeology.

**Where things land is already decided.** `design/UI-STACK.md` carries the map from workbench
folders to production folders, written once at kickoff. Read it rather than deriving it: two
developers deriving it separately is how a project ends up with components in two places.

Stack-specific procedures, one file each:
`references/promotion-astro.md` · `references/promotion-nuxt.md` · `references/promotion-wordpress.md`

## Recording a promotion

Every promotion gets stamped, or drift cannot tell a promoted file from one nobody has looked at —
and a report that cannot be trusted stops being read.

```bash
node design/.ui/ui-drift.mjs --root design \
  --record src/components/ArticleCard.astro \
  --to app/src/components/astro/ArticleCard.astro
```

**Only a developer records, and never from a design session.** This is structural rather than
procedural: the designer is the *source* of drift, so a designer stamping their own work would
certify as taken the very thing they just changed, and the report would read empty forever. If you
are working inside `design/`, this whole section is somebody else's.

Recording means: *I have looked at this file and dealt with it.* Usually that means promoted. It
can also mean consciously not adopted, which is a legitimate outcome and needs a reason attached:

```bash
node design/.ui/ui-drift.mjs --root design --record src/styles/theme.css \
  --note "production values kept; the designer's tweak was rejected in review"
```

Without the note, that record is a small lie, and lies in a tracking file are worse than gaps.

## Coming back later — drift

```bash
node design/.ui/ui-drift.mjs --root design
```

Four lists, and the fourth is the one everybody forgets:

| | Means |
|---|---|
| **Changed since promotion** | the designer moved it after you took it. Rework starts here |
| **New since promotion** | never promoted — still being designed, or missed |
| **Promoted, now gone** | the designer deleted the source; the production copy is an orphan |
| **Unchanged** | nothing to do |

Drift reports **which files, not which lines**. What changed inside a file is `git diff`'s job, and
reimplementing it here would be a worse version of a tool the developer already has.

Then triage again — but only over what drifted. That is the whole point: rework starts from a list
of three files instead of a feeling about a folder.

## When both sides changed the same component

The awkward case, and it will happen: the designer edits a component that production has already
extended.

**Report it. Never merge it automatically.** Two independent evolutions of one component are
exactly where silent breakage lives, and an automatic merge produces a file neither person
recognises. Lay out the three facts and let a human choose:

1. what the designer changed, and why (the handoff usually says)
2. what production diverged into, and why
3. whether the two actually conflict, or merely both moved

Then name the outcome explicitly:

| Outcome | What it means | What to do |
|---|---|---|
| **Adopt** | the designer's change wins | apply it, promote, record |
| **Keep production** | production's version is now the truth for this component | record with a `--note` saying so, and tell the designer — their copy no longer matches what ships |
| **Reconcile** | both changes are wanted | one conversation, one decision, then adopt or keep |

The one thing that must not happen is nothing. An unresolved drift stays in the report forever,
and a report full of things nobody intends to act on is a report nobody reads.

## When the workbench and production disagree about tokens

This one is not a normal drift and does not get triaged like one. If a token has a different value
in `design/` than in production, **stop and find out which is right before promoting anything
else** — every component promoted afterwards is built on it.

There is exactly one token file per project in each place, and they hold the same values. When a
designer adds a token, it lands in both, in the same shape, in the same commit.

## What this skill does not do

- **It does not commit.** It proposes; the human runs every `git add` and `git commit`.
- **It does not edit `design/` on its own initiative.** Two exceptions, and both get announced:
  answering an **open question in the handoff addressed to developers** — that is what those rows
  are for, and the answer usually lives in `design/` — and normalizing markup before a WordPress
  port. Close the row you answered, saying what you did, and tell the designer — their copy is
  supposed to match what shipped. Anything beyond those two is the designer's folder, and finding
  your edits unannounced is how trust in the arrangement ends.
- **It does not write `INVENTORY.md`.** That is generated. Handoff and inventory answer different
  questions and neither should restate the other.
