<script setup lang="ts">
/**
 * A screen, and what "finished" means for one.
 *
 * A screen is not done when the happy path looks right. It is done when it answers
 * for all of its states - because a state the design never drew is a state a
 * developer will invent alone, at the end of a sprint, badly.
 *
 * Note the order of the branches: pending, error, empty, ready. Written in any
 * other order one branch eventually shadows another, and it is always the error
 * branch that loses.
 *
 * Switch `state` to review each one.
 */
import { computed, ref } from 'vue'
import { articles, noArticles, type Article } from '../fixtures/articles'

type ScreenState = 'ready' | 'empty' | 'loading' | 'error'

const state = ref<ScreenState>('ready')
const items = computed<Article[]>(() => (state.value === 'empty' ? noArticles : articles))
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-16">
    <h1 class="text-xl font-semibold text-highlighted">Articles</h1>

    <div v-if="state === 'loading'" class="mt-8 space-y-4" aria-busy="true" aria-label="Loading articles">
      <USkeleton class="h-28 w-full" />
      <USkeleton class="h-28 w-full" />
    </div>

    <UAlert
      v-else-if="state === 'error'"
      class="mt-8"
      color="error"
      title="These articles could not be loaded"
      description="Reload the page. If it keeps happening, the list is temporarily unavailable."
    />

    <UCard v-else-if="items.length === 0" class="mt-8">
      <h2 class="font-semibold text-highlighted">No articles yet</h2>
      <p class="mt-1 text-sm text-muted">The first one you publish appears here.</p>
    </UCard>

    <ul v-else class="mt-8 space-y-4">
      <li v-for="article in items" :key="article.id">
        <UCard>
          <h2 class="font-semibold text-highlighted">{{ article.title }}</h2>
          <p class="mt-1 text-sm text-muted">{{ article.excerpt }}</p>
          <p class="mt-3 text-xs text-dimmed">{{ article.publishedAt }}</p>
        </UCard>
      </li>
    </ul>
  </main>
</template>
