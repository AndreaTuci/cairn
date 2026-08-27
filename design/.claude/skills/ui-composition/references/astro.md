# Astro

Read this when the target stack is an Astro site — or when the workbench is Astro, which it is
for every target except Nuxt.

## The component

An `.astro` file is HTML with a frontmatter block. That is the whole idea, and it is why a
designer can read one.

```astro
---
import { cx } from '../lib/cx'

interface Props {
  title: string
  variant?: 'default' | 'featured'
  class?: string
}

const { title, variant = 'default', class: extra } = Astro.props
---

<article class={cx('rounded-lg border bg-card p-6', variant === 'featured' && 'md:p-10', extra)}>
  <h3 class="text-lg font-semibold">{title}</h3>
  <slot />
</article>
```

Conventions that keep these copy-pasteable and reviewable:

- **`interface Props` always**, even when there is one prop. It is what `ui-inventory.mjs` reads
  to build the inventory, so an undeclared prop is a component that does not appear correctly in
  the list everyone else searches.
- **Defaults in the destructure**, not scattered through the markup with `??`.
- **`class` prop last**, merged through `cx`. It exists for layout concerns the parent owns —
  margins, grid placement — not for restyling the component from outside.
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
`client:only` disables server rendering entirely and should be a last resort with a reason
attached.

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
Awkward to port: `<span class={cx(a && 'x', b ? 'y' : 'z')}>{fmt(article.d, opts)}</span>`

When the target is WordPress, prefer the first shape even where the second would be shorter.
