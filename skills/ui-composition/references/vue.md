# Vue and Nuxt

Read this when the target stack is a Nuxt app, or when writing a Vue island inside an Astro
project.

## The component

```vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  variant?: 'default' | 'featured'
  class?: string
}

const props = withDefaults(defineProps<Props>(), { variant: 'default' })

const base = 'rounded-lg border bg-card p-6'

const byVariant = {
  default: '',
  featured: 'md:p-10',
}

const variantClasses = computed(() => byVariant[props.variant])
</script>

<template>
  <article :class="[base, variantClasses, props.class]">
    <h3 class="text-lg font-semibold">{{ title }}</h3>
    <slot />
  </article>
</template>
```

One named value per axis, and the template says which ones apply. The rule and its reasons are in
`SKILL.md` under *The logic goes in the script block*; what changes in Vue is only the spelling —
a `computed` where Astro has a plain `const`, and `:class` where Astro has `class:list`.

## Import explicitly, always

Nuxt auto-imports `ref`, `computed`, `useRoute` and much else. **Do not rely on it.** Write the
imports out.

The reason is practical rather than ideological: a component written in the workbench must run
there *and* survive being copied into the Nuxt project. Explicit imports work in both. Auto-imports
work in exactly one, and the failure is silent until the file moves.

This applies to components too. In the workbench, import what you use.

## Variants, when the project is on shadcn-vue

**This is the one exception to the rule above, and it is the vendor's, not ours.** Inside a
shadcn-vue project the variant map is `cva` and the merge is `cn` — `clsx` + `tailwind-merge`.
Leave them. Rewriting a vendored component into the house idiom is worse than the inconsistency it
removes, and it reverts on the next install.

The map lives in a sibling `index.ts` next to the component, which is where shadcn-vue puts it and
where `ui-inventory.mjs` looks for it.

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

`cn` matters more than it looks, and it is the second half of why it stays: `twMerge` resolves
Tailwind conflicts by specificity of intent, so a `class` prop from a caller overrides a base class
instead of racing it in the stylesheet. A plain array does not do that — which is fine for a `class`
prop used the way this house uses it, for margins and grid placement, and is not fine for a
primitive whose whole job is to be restyled by its callers.

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
