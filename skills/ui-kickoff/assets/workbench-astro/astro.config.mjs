// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

/**
 * The workbench is deliberately plain: static output, no adapter, no server, no
 * backend. `npm run design:build` produces plain HTML in `dist/`, which is what
 * a client can be shown without anyone standing up infrastructure for it.
 */
export default defineConfig({
  vite: { plugins: [tailwindcss()] },

  /**
   * Fonts are self-hosted: downloaded once at build time, served from this
   * project, never fetched from a CDN by the reader.
   *
   * A theme that names a typeface nobody loads is the most visible failure this
   * workbench can have - the page silently renders in whatever the machine
   * happens to have, on the one screen a designer judges with their eyes. So the
   * placeholder is wired up from the start, and swapping it is one edit here and
   * one in `src/styles/theme.css`. They change together, always.
   */
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Inter',
      cssVariable: '--font-body',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],
})
