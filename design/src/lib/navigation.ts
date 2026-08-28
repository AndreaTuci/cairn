/**
 * The whole site, in one array.
 *
 * Four pages, and the header and the footer both need to know which one you are
 * on. Written twice they would disagree the first time a page is renamed.
 *
 * The hrefs carry the deployment base. Locally that is `/` and nothing changes;
 * published under a path — GitHub Pages serves this guide from `/cairn/` — every
 * link needs the prefix, and Astro adds it to assets but never to an href
 * somebody wrote by hand. Doing it here means it is done once, in the file that
 * already owns what the routes are.
 */

/** `/` locally, `/cairn/` when the site is published under a path. */
const BASE = import.meta.env.BASE_URL

export interface NavItem {
  href: string
  label: string
}

/** The routes themselves, before the base. This is the list a page is added to. */
const ROUTES: NavItem[] = [
  { href: '/', label: 'Guide' },
  { href: '/getting-started', label: 'Getting started' },
  { href: '/reference', label: 'Reference' },
  { href: '/composition', label: 'Composition' },
]

/**
 * A route with the deployment base on the front.
 *
 * Exported because the pages are not the only link to a route: the site name in
 * the header goes home too, and written as a bare `/` it left the site entirely
 * the first time this was published under a path.
 */
export function withBase(route: string): string {
  return `${BASE.replace(/\/+$/, '')}${route}`
}

export const pages: NavItem[] = ROUTES.map((route) => ({ ...route, href: withBase(route.href) }))

/**
 * One spelling for a path, so two of them can be compared.
 *
 * `/reference/` and `/reference` are the same page — the router is relaxed about
 * it — and so are `/cairn/` and `/cairn`.
 */
export function normalise(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '')
  return trimmed === '' ? '/' : trimmed
}

/**
 * The next mark on the trail, wrapping round at the end.
 *
 * It used to be "the page you are not on", which only has one answer while there
 * are two pages. Order is the file's order, which is the order the guide is
 * meant to be read in.
 */
export function nextPage(pathname: string): NavItem {
  const here = normalise(pathname)
  const index = pages.findIndex((page) => normalise(page.href) === here)
  return pages[(index + 1) % pages.length]
}
