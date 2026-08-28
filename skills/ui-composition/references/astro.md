# Astro

Read this when the target stack is an Astro site — or when the workbench is Astro, which it is
for every target except Nuxt.

## The component

An `.astro` file is HTML with a frontmatter block. That is the whole idea, and it is why a
designer can read one.

```astro
---
interface Props {
  title: string
  variant?: 'default' | 'featured'
  class?: string
}

const { title, variant = 'default', class: extra } = Astro.props

const base = 'rounded-lg border bg-card p-6'

const byVariant = {
  default: '',
  featured: 'md:p-10',
}
---

<article class:list={[base, byVariant[variant], extra]}>
  <h3 class="text-lg font-semibold">{title}</h3>
  <slot />
</article>
```

Conventions that keep these copy-pasteable and reviewable:

- **`interface Props` always**, even when there is one prop. It is what `ui-inventory.mjs` reads
  to build the inventory, so an undeclared prop is a component that does not appear correctly in
  the list everyone else searches.
- **A variant prop is a finite union** — `'default' | 'featured'`, never a bare `string`. It is
  the other half of the same sentence: the inventory lists the options by reading the union, so a
  `string` prop is an axis nobody can discover.
- **Defaults in the destructure**, not scattered through the markup with `??`.
- **Classes are named in the frontmatter** — a `base`, then one map per axis — and composed in the
  markup with `class:list`. See *The logic goes in the script block* in `SKILL.md`.
- **`class` prop last.** It exists for layout concerns the parent owns — margins, grid placement —
  not for restyling the component from outside.
- **Slots for content, props for configuration.** If you find yourself passing a string of HTML
  as a prop, you wanted a slot.

## Zero JavaScript, unless

Astro ships no client JavaScript by default, and that default is worth defending. A site made of
`.astro` components loads as HTML and behaves like HTML.

Reach for a Vue island **only** when there is genuine client state or interaction that HTML and
CSS cannot express:

| Justified | Not justified |
|---|---|
| A filter that re-renders a list without navigating | A dropdown that could be `<details>` |
| A form with live validation | A tab strip that could be anchors |
| A map, a chart, a rich-text editor | An accordion — `<details>` again |
| Anything holding state across user actions | A hover effect |

When an island is justified, say so in one line in the handoff. That line is what stops the next
person from assuming islands are the normal way to build here.

```astro
---
import FilterPanel from './vue/FilterPanel.vue'
---

<!-- client:visible - the panel is below the fold; nothing loads until it is needed -->
<FilterPanel client:visible facets={facets} />
```

Pick the narrowest directive that works: `client:visible` over `client:idle` over `client:load`.
`client:media` is narrower still when the interaction only exists at one breakpoint.
`client:only` disables server rendering entirely and should be a last resort with a reason
attached — and if you use it, the loading state is a thing to design rather than a gap.

Four habits that keep an island from costing more than it buys:

- **Only serializable data crosses the boundary**, and only the fields the interaction needs. A
  whole list serialised into an island that filters three of them is the list shipped twice.
- **No duplicate fetching** on the server and again on the client, unless revalidating is the
  point.
- **Clean up** listeners, timers, observers and subscriptions. An island that mounts twice and
  tears down once is a leak nobody sees until the page is left open.
- **Keep the pre-hydration render useful.** What the server sent is what a reader sees for the
  first few hundred milliseconds, and on a bad connection for much longer.

## Images

Use `astro:assets` for anything in `src/`. It gives you dimensions, lazy loading and modern
formats without anyone remembering to ask for them.

```astro
---
import { Image } from 'astro:assets'
import cover from '../assets/cover.jpg'
---

<Image src={cover} alt="Two people reviewing a printed layout" width={800} />
```

Images in `public/` are served untouched — fine for an SVG logo, wasteful for a photograph.

## Layouts

One layout per page shape, and the theme imported exactly once, in the layout. A component that
imports the stylesheet is a component that will be pulled into another project and break.

## What ports where

Everything in an `.astro` file that lives inside the markup — the tags, the classes, the
structure — copies into a PHP template or a Vue SFC unchanged. What does not port is the
frontmatter: imports, props and expressions. Keep the markup free of clever expressions and the
port stays mechanical.

Good: `<span class="text-muted-foreground">{article.publishedAt}</span>`
Awkward to port: `<span class={a ? 'x' : 'y'}>{formatDate(article.d, opts)}</span>`

When the target is WordPress, prefer the first shape even where the second would be shorter.

That is also where formatting belongs. A date, a currency, a truncation is a **named function
called in the frontmatter**, and the markup renders the value it returns. The contract keeps the
raw value — an ISO string, a number — because the backend implements against the contract and a
locale is not its business.
