# Promotion — Astro target

The easy case, and the reason Astro is the house default: the designer's components *are* the
production components. Promotion is mostly a move plus a wiring change.

## What moves as-is

| From the workbench | To the project |
|---|---|
| `design/src/components/**` | `app/src/components/astro/**` |
| `design/src/layouts/**` | `app/src/layouts/**` — usually merged into an existing layout, not added beside it |
| `design/src/styles/theme.css` | the project's token file. **Merge, never overwrite** |

## What changes

**Data.** Fixture imports become real data — a content collection, an API call, CMS props. The
component's props do not change: that is what makes the promotion cheap, and it is worth
preserving. If a prop shape has to change, change it in the workbench too, or the two start
drifting the same day.

```diff
- import { articles } from '../fixtures/articles'
+ const articles = await getArticles(Astro.locals.api)
```

**Images.** `<img>` in the prototype becomes `astro:assets` `<Image>` in production, with real
dimensions. The classes and the surrounding markup do not change.

**Links.** Hardcoded `href="/pricing"` becomes whatever the project routes with.

## The token file is the one real merge

Two rules, and getting the first one wrong is the most expensive mistake available here:

1. **Never overwrite the production token file with the workbench's.** Production has grown
   tokens the workbench does not know about.
2. **Never let the two diverge either.** When the designer adds `--color-accent`, it lands in
   both, in the same shape, in the same commit.

If a value differs between them, one of the two is wrong — find out which before promoting
anything else, because every component you promote afterwards is built on it.

## The triage, before anything moves

Per file, one of three, decided before you touch it:

| | When | What it costs |
|---|---|---|
| **Keep** | it follows the rules and fits the project | a move |
| **Normalize** | right shape, wrong details — naming, a missed token, a budget overrun | a `refactor(...)` commit of its own, never a silent edit inside a feature commit |
| **Rewrite** | the prototype answered a different question than production asks | say so in the handoff, so the designer knows the screen they see is no longer the screen that ships |

Run the audit against the production folder after promoting. A component that passed in the
workbench can fail in production — different token file, different neighbours.

```bash
node design/.ui/ui-audit.mjs --root app --token-file src/styles/global.css --ignore ui
```

## Record it

```bash
node design/.ui/ui-drift.mjs --root design \
  --record src/components/ArticleCard.astro \
  --to app/src/components/astro/ArticleCard.astro
```

Without this, the next drift report cannot tell a promoted component from one nobody has looked
at, and a report that cannot be trusted stops being read.
