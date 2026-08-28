# AGENTS.md — cairn

The single source of agent instructions for this repository, shared by every coding agent
(Claude, Copilot, and any other). `CLAUDE.md` and `.github/copilot-instructions.md` are pointers
to this file and hold no instructions of their own — edit this one.

## What this repository is

The five cairn skills and the audit tooling behind them. `skills/` is the authored source;
`.claude/skills/` is an installed copy and is gitignored. `TEAM.md` is the one-page explanation
of how the whole thing fits together.

## Frontend and design

Designers prototype in `design/`; developers own the skills source in `skills/` and the eval
cases in `evals/`. Both follow the same composition rules — there is one law, not two.

**Before writing any UI**, read `ui-composition`. It covers tokens, the rule of two, variants,
the four screen states and the accessibility floor. The contract for *this* project — stack,
kit, budgets, pinned versions, waivers — is in `design/UI-STACK.md`.

| You are | Read | Then |
|---|---|---|
| A designer | `design-workflow` | Work only inside `design/`. Type `/design-workflow` |
| A developer, building UI | `ui-composition` + `dev-workflow` | `design/HANDOFF.md` is the source of truth for anything the designers built |
| A developer, taking a prototype into production | `ui-sync` | Triage first — keep / normalize / rewrite — then promote |

### The workbench

`design/` is a standalone Astro project: no backend, no docker, no database. It is **permanent**,
not a phase — designers keep correcting it while development runs, so it is a living source and
the production code is a copy that drifts from it. `ui-sync` reports that drift; do not go
looking for it by eye.

```bash
cd design && npm run design        # dev server
npm run design:check               # the audit gate — blocking
npm run design:build               # static HTML in dist/, for a client review
```

For this project the workbench is also the deliverable: the four guide pages ship as the static
HTML that `design:build` produces. There is no production frontend to promote into yet.

### Auditing production code

```bash
node design/.ui/ui-audit.mjs --root <folder> --token-file <path> --ignore ui --all
```

### Non-negotiables

- Every colour, size, radius and shadow comes from the token file. No exceptions that are not
  written down as waivers in `design/UI-STACK.md`.
- A value used twice is a token. A shape used twice is a component.
- Every screen answers for its ready / empty / loading / error states.
- The audit is blocking. A waiver needs a reason on the line above it and a row in `UI-STACK.md`.

### One thing specific to this repository

`design/.ui/` is a **build artifact** of the `ui-composition` skill, vendored so the audit runs
from inside the folder a designer has open. Never fix a bug there. Fix it in
`skills/ui-composition/scripts/`, then re-copy — otherwise the fix exists in one project and
nowhere else.
