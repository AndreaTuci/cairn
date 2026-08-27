/**
 * The whole site, in one array.
 *
 * Two pages, and the header and the footer both need to know which one you are
 * on. Written twice they would disagree the first time a page is renamed.
 */

export interface NavItem {
  href: string
  label: string
}

export const pages: NavItem[] = [
  { href: '/', label: 'Guida' },
  { href: '/riferimento', label: 'Riferimento' },
]

/** `/riferimento/` and `/riferimento` are the same page; the router is relaxed about it. */
export function normalise(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname
}

/** The page the reader is not on. A two-page guide always has exactly one. */
export function otherPage(pathname: string): NavItem {
  const current = normalise(pathname)
  return pages.find((page) => page.href !== current) ?? pages[0]
}
