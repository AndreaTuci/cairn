## Frontend and design

Designers prototype in `design/`; developers build the production frontend in `<dev-folder>/`.
Both follow the same composition rules — there is one law, not two.

**Before writing any UI**, read `ui-composition`. It covers tokens, the rule of two, variants,
the four screen states and the accessibility floor. The contract for *this* project — stack,
kit, budgets, pinned versions, waivers — is in `design/UI-STACK.md`.

Each role has one thing to type, and they are deliberately the same shape:

| You are | Type | What it does |
|---|---|---|
| A designer | `/design-workflow` | Brief, tokens, inventory, then one screen at a time. Work only inside `design/` |
| A developer, building UI a designer prototyped | `/dev-workflow` | Handoff, drift, triage, then promote — in that order |
| A developer, promoting or re-syncing | `/ui-sync` | Triage first — keep / normalize / rewrite — then promote and record it |

`ui-composition` is the law underneath all three and needs no invoking: it is read whenever UI is
written. `design/HANDOFF.md` is the source of truth for anything the designers built.

### The workbench

`design/` is a standalone Astro project: no backend, no docker, no database. It is **permanent**,
not a phase — designers keep correcting it while development runs, so it is a living source and
the production code is a copy that drifts from it. `ui-sync` reports which workbench files changed
since they were last stamped.

```bash
cd design && npm run design        # dev server
npm run design:check               # the audit gate — blocking
npm run design:build               # static HTML in dist/, for a client review
```

### Auditing production code

```bash
node design/.ui/ui-audit.mjs --root <folder> --token-file <path> --all
```

### Non-negotiables

- Every colour, size, radius and shadow comes from the token file. No exceptions that are not
  written down as waivers in `design/UI-STACK.md`.
- A value used twice is a token. A shape used twice is a component.
- Every screen answers for its ready / empty / loading / error states.
- The audit is blocking. A waiver needs a reason on the line above it and a row in `UI-STACK.md`.
