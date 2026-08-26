// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

/**
 * The workbench is deliberately plain: static output, no adapter, no server, no
 * backend. `npm run design:build` produces plain HTML in `dist/`, which is what
 * a client can be shown without anyone standing up infrastructure for it.
 */
export default defineConfig({
  vite: { plugins: [tailwindcss()] },
})
