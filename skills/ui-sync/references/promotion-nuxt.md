# Promotion — Nuxt target

Also cheap, for the same reason: the designer wrote `.vue` in a Nuxt workbench against Nuxt UI,
so the components are already the production components.

## What moves as-is

| From the workbench | To the project |
|---|---|
| `design/app/components/**` | `app/components/**` |
| `design/app/pages/**` | `app/pages/**` — usually as a starting point, since routing and guards are the project's |
| `design/app/assets/css/theme.css` | the project's css entry. **Merge, never overwrite** |
| `design/app/app.config.ts` | merge the `ui.colors` block only. The rest of app config is the project's |

## What changes

**Data.** Fixture imports become `useFetch` / `useAsyncData` / a store. The four branches the
designer drew map straight onto what those composables return, which is exactly why they were
drawn:

```diff
- const items = computed(() => articles)
+ const { data: items, pending, error, refresh } = await useFetch('/api/articles')
```

Keep the branch order the workbench used — `pending`, `error`, `empty`, `ready`. Written in any
other order one branch eventually shadows another, and it is always the error branch that loses.

**Imports.** The workbench imports everything explicitly, which is deliberate. In the Nuxt project
auto-imports would work, but **leave the explicit imports in place**: they cost nothing, they keep
the file portable back to the workbench, and a component that only runs in one of the two places
is a component that will surprise someone.

**Auth, guards, layouts.** All the project's. The prototype has no notion of who is looking.

## Nuxt UI

The designer built against Nuxt UI, so the primitives are already the right ones. Two things to
check on arrival:

- **`app.config.ts` colours.** The workbench points `ui.colors.primary` at a ramp declared in the
  theme file. Make sure the project declares the same ramp under the same name, or every primary
  in the promoted component silently falls back.
- **`UApp`.** Overlays, toasts and tooltips need it in the tree. It is in the workbench's
  `app.vue`; make sure the project has it too, or modals fail silently rather than loudly.

## The triage, before anything moves

| | When | What it costs |
|---|---|---|
| **Keep** | it follows the rules and fits the project | a move |
| **Normalize** | right shape, wrong details — a missed token, a `--ui-*` role overridden without reason, a budget overrun | a `refactor(...)` commit of its own |
| **Rewrite** | the screen needs real data behaviour the prototype could not express — optimistic updates, pagination, live sync | say so in the handoff |

Then audit the production folder:

```bash
node design/.ui/ui-audit.mjs --root app --token-file app/assets/css/main.css
```

## Record it

```bash
node design/.ui/ui-drift.mjs --root design \
  --record app/components/ArticleCard.vue \
  --to app/components/ArticleCard.vue
```
