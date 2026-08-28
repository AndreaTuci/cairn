# How design and development share a frontend

One page. Who does what, in what order, and what each side owes the other.

## The shape of it

Designers build screens in `design/`, a standalone workbench that runs with one command — no
backend, no docker, no database. Developers take those components into the production project.
Both follow the same composition rules, because they are building the same thing.

`design/` is **permanent**. Designers keep correcting it while development runs, so it is a living
source and production is a copy that drifts from it. A script reports that drift; nobody hunts for
it by eye.

```
  designer                                        developer
  ────────                                        ─────────
  /design-workflow                                reads design/HANDOFF.md
      brief, direction, tokens                    checks drift
      one screen at a time                        triage: keep / normalize / rewrite
      states: ready, empty, loading, error        wires real data
      npm run design:check  ──── must be green ── promotes, records the promotion
      ui-sync writes HANDOFF.md                   sends back what production learned
                              ▲                              │
                              └──────────────────────────────┘
```

## The five skills

| Skill | Who reads it | When |
|---|---|---|
| `ui-kickoff` | developer | once, when the project starts |
| `ui-composition` | **both** | every time any UI is written or reviewed |
| `design-workflow` | designer | every design session |
| `dev-workflow` | developer | implementing UI a designer prototyped |
| `ui-sync` | **both** | designer writes the handoff; developer consumes it, promotes, re-syncs |

`ui-composition` is deliberately shared. Two copies of one law would drift within a month, and
drifting rules are the problem this exists to solve.

## Starting a project — developer

Run `ui-kickoff`. Five questions, then it scaffolds `design/`, seeds the tokens with the real
brand, writes `AGENTS.md` and the pointers for Claude and Copilot, installs the audit, and verifies
that the whole thing builds. Do this before any designer opens the repository.

## A design session — designer

Open the **`design/` folder** (not the repository root) and type `/design-workflow`. Describe what
you want. You will be asked questions you can answer — what the screen is for, what it says, what
happens when there is nothing to show — and never questions about code.

Three commands, and there are only three:

```bash
npm run design         # see it in the browser
npm run design:check   # check it against the house rules
npm run design:build   # static HTML you can send to a client
```

Everything outside `design/` belongs to the developers. Needing something out there is a
two-minute conversation, not a problem to work around.

## Picking work up — developer

```bash
cat design/HANDOFF.md                        # what is real, what is faked
node design/.ui/ui-drift.mjs --root design   # what moved since last time
node design/.ui/ui-audit.mjs --root design --all
```

Triage before touching anything, then follow `ui-sync` for the promotion. Record every promotion,
or the next drift report is noise.

## What each side owes the other

**Designers owe developers** a screen that passes the check, all four states answered, data that
lives in typed fixtures rather than in the markup, and a handoff that says plainly what is faked.

**Developers owe designers** the truth about what production discovered — a field that can be
empty, real content longer than any fixture, a state nobody drew, a component that had to be
rewritten. If that never travels back, `design/` becomes fiction within two months and the whole
arrangement quietly stops working.

## The rules, in four lines

- Every colour, size, radius and shadow comes from the token file. There is one per project.
- A value used twice is a token. A shape used twice is a component.
- Every screen answers for ready, empty, loading and error.
- The audit is blocking. A waiver needs a reason written on the line above it.

## When a rule is wrong

Sometimes it will be. Take the waiver, write the reason, record it in `design/UI-STACK.md`. If the
same waiver gets taken a third time, the rule is wrong rather than the code — say so, and it gets
changed.

*Errors should never pass silently. Unless explicitly silenced.*
