<script setup lang="ts">
/**
 * The screen index. Every screen in the workbench is listed here, so whoever is
 * reviewing - a colleague, a client, a developer - can find all of it without
 * being told where to look.
 */
const screens = [
  { to: '/articles', name: 'Articles', note: 'List, with its empty, loading and error states' },
]
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-16">
    <h1 class="text-2xl font-semibold text-highlighted">Workbench</h1>
    <p class="mt-2 text-muted">Every screen in this project, and nothing else.</p>

    <ul class="mt-8 space-y-4">
      <li v-for="screen in screens" :key="screen.to">
        <UCard>
          <h2 class="font-semibold text-highlighted">{{ screen.name }}</h2>
          <p class="mt-1 text-sm text-muted">{{ screen.note }}</p>
          <UButton :to="screen.to" size="sm" class="mt-4">Open</UButton>
        </UCard>
      </li>
    </ul>
  </main>
</template>
