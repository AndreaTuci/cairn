// @ts-check
import { defineConfig, fontProviders } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

/**
 * The workbench is deliberately plain: static output, no adapter, no server, no
 * backend. `npm run design:build` produces plain HTML in `dist/`, which is what
 * a client can be shown without anyone standing up infrastructure for it.
 *
 * Fonts are self-hosted, not linked from a CDN. The guide has to read the same
 * printed, on a shared meeting screen and on a laptop with no network - a font
 * that arrives over the wire is a font that sometimes does not.
 */
/**
 * Where this guide is published, when it is.
 *
 * Empty by default, so `npm run design` and `npm run design:build` behave exactly
 * as they always have. The Pages workflow sets both, because GitHub serves a
 * project site from a subpath and every absolute href needs that prefix — Astro
 * adds it to assets on its own and never to an href somebody wrote by hand.
 */
const site = process.env.CAIRN_SITE || undefined
const base = process.env.CAIRN_BASE || undefined

export default defineConfig({
  site,
  base,
  vite: { plugins: [tailwindcss()] },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Serif',
      cssVariable: '--font-plex-serif',
      weights: [400, 600],
      styles: ['normal'],
      subsets: ['latin'],
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Sans',
      cssVariable: '--font-plex-sans',
      weights: [400, 500, 600],
      styles: ['normal', 'italic'],
      subsets: ['latin'],
    },
    {
      provider: fontProviders.google(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-plex-mono',
      weights: [400, 500, 600],
      styles: ['normal'],
      subsets: ['latin'],
    },
  ],
})
