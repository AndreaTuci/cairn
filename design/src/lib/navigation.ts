/**
 * The whole site, in one array.
 *
 * Four pages, and the header and the footer both need to know which one you are
 * on. Written twice they would disagree the first time a page is renamed.
 */

export interface NavItem {
  href: string
  label: string
}

export const pages: NavItem[] = [
  { href: '/', label: 'Guida' },
  { href: '/come-si-parte', label: 'Come si parte' },
  { href: '/riferimento', label: 'Riferimento' },
  { href: '/composizione', label: 'Composizione' },
]

/** `/riferimento/` and `/riferimento` are the same page; the router is relaxed about it. */
export function normalise(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
}

/**
 * The next mark on the trail, wrapping round at the end.
 *
 * It used to be "the page you are not on", which only has one answer while there
 * are two pages. Order is the file's order, which is the order the guide is
 * meant to be read in.
 */
export function nextPage(pathname: string): NavItem {
  const index = pages.findIndex((page) => page.href === normalise(pathname))
  return pages[(index + 1) % pages.length]
}
