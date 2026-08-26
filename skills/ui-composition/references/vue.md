# Vue and Nuxt

Read this when the target stack is a Nuxt app, or when writing a Vue island inside an Astro
project.

## The component

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '../lib/utils'

interface Props {
  title: string
  variant?: 'default' | 'featured'
  class?: string
}

const props = withDefaults(defineProps<Props>(), { variant: 'default' })

const classes = computed(() =>
  cn('rounded-lg border bg-card p-6', props.variant === 'featured' && 'md:p-10', props.class),
)
</script>

<template>
  <article :class="classes">
    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <slot />
  </article>
</template>
```

## Import explicitly, always

Nuxt auto-imports `ref`, `computed`, `useRoute` and much else. **Do not rely on it.** Write the
imports out.

The reason is practical rather than ideological: a component written in the workbench must run
there *and* survive being copied into the Nuxt project. Explicit imports work in both. Auto-imports
work in exactly one, and the failure is silent until the file moves.

This applies to components too. In the workbench, import what you use.

## Variants

The house pattern is `cva` for the variant map and `cn` — `clsx` + `tailwind-merge` — for
merging. The map lives in a sibling `index.ts` next to the component, which is where shadcn-vue
puts it and where `ui-inventory.mjs` looks for it.

```ts
import { cva, type VariantProps } from 'class-variance-authority'

export { default as Button } from './Button.vue'

export const buttonVariants = cva('inline-flex items-center justify-center rounded-md', {
  variants: {
    variant: { default: 'bg-primary text-primary-foreground', ghost: 'hover:bg-accent' },
    size: { sm: 'h-9 px-3', md: 'h-10 px-4' },
  },
  defaultVariants: { variant: 'default', size: 'md' },
})

export type ButtonVariants = VariantProps<typeof buttonVariants>
```

`cn` matters more than it looks: `twMerge` resolves Tailwind conflicts by specificity of intent,
so a `class` prop from a caller can override a base class instead of racing it in the stylesheet.

## Where the primitives come from

| Context | Primitive base |
|---|---|
| Nuxt app (dashboards, back-office) | **Nuxt UI.** It ships the primitives, the a11y and the keyboard behaviour. Do not rebuild them |
| Vue island inside an Astro site | **shadcn-vue** (Reka UI), owned in-repo under `components/vue/ui/` |

Both are theming targets, not decoration: point their tokens at the project's semantic layer so
one theme file still drives everything. A primitive styled ad hoc has left the system.

Extend a primitive by wrapping it, never by editing a vendored file in place — a vendored file
edited in place is a file nobody can update.

## Reactivity, kept boring

- `computed` for anything derived. A value assembled in the template is a value nobody can test.
- No watchers where a `computed` would do.
- Props flow down, events flow up. A child mutating a prop object is the bug that takes an
  afternoon to find.
- Clean up listeners, timers and observers in `onUnmounted`. In a dashboard that stays open all
  day, a leaked listener is not theoretical.

## The four states, in Vue

Loading and error are real here in a way they are not on a static page, so they are components,
not afterthoughts:

```vue
<template>
  <Skeleton v-if="pending" class="h-28" />
  <ErrorState v-else-if="error" :retry="refresh" />
  <EmptyState v-else-if="items.length === 0" />
  <ul v-else>…</ul>
</template>
```

Keep that order — `pending`, `error`, `empty`, `ready`. Written in any other order, one branch
eventually shadows another, and it is always the error branch that loses.
