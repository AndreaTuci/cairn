# UI Stack — <project>

> The contract. Written once at kickoff, read by every later session instead of asking again.
> When something here changes, change it here — not in a chat message that nobody can find later.

## What we are building

| | |
|---|---|
| **Target stack** | Astro 6 + Tailwind v4 · Nuxt 4 + Nuxt UI · WordPress + Tailwind v4 |
| **Workbench flavour** | `astro` · `nuxt` |
| **Designer writes** | `.astro` · `.vue` |
| **Component kit** | `local` (primitives built here) · `<package-name>` |
| **Primitive base** | none · shadcn-vue (Reka UI) · Nuxt UI |
| **Token file** | `design/src/styles/theme.css` · `design/app/assets/css/theme.css` |
| **Production token file** | `<path>` — or `n/a` until the project exists |
| **Working language** | `<language>` — the one a designer is talked to in, and the one `BRIEF.md` is written in. Everything else stays English |

## Where things land

The map from the workbench to production. Decided once, here, so that no promotion ever has to
guess it and no two developers guess differently.

`ui-sync` reads this when it promotes, and `ui-drift --to` records against it. Leave it empty only
when the workbench *is* the deliverable and there is no production copy — and say so, rather than
leaving the reader wondering whether somebody forgot.

| Workbench | Production |
|---|---|
| `design/src/components/` | |
| `design/src/layouts/` | |
| `design/src/styles/theme.css` | |
| `design/src/fixtures/` | *(nothing — fixtures are replaced by real data, never promoted)* |

## Pinned versions

Exact, not floated. A workbench that built in March must build in September.

| Package | Version | Why this one |
|---|---|---|
| `astro` | 6.1.6 | 6.4 pulls Vite 8 (rolldown), unsupported by `@tailwindcss/vite` 4.3 |
| `tailwindcss` | 4.2.2 | |
| `@tailwindcss/vite` | 4.2.2 | |

Node: **≥ 22.19**.

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
| **Source** | Figma file · brand guide · nothing yet |
| **Typefaces** | display / body / utility |
| **Seeded at kickoff** | yes · no — placeholders still in place |

## Baseline

Only for a project that existed before the workbench did. Not a judgement — the number the team
can watch move.

```
node design/.ui/ui-audit.mjs --root <folder> --token-file <path>
```

| Date | Blocking | Advisory | Note |
|---|---|---|---|
| YYYY-MM-DD | | | baseline at kickoff |

## Waivers

Every audit rule silenced in this project, and why. A waiver nobody can find is a rule that was
quietly deleted.

| File | Rule | Reason | Taken by | Date |
|---|---|---|---|---|

## Decisions

Anything a later session would otherwise have to guess.

| # | Question | Resolution | Date |
|---|---|---|---|
