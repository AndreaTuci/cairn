/**
 * Mock data lives here, typed, and nowhere else.
 *
 * The type is the point. It is what a developer reads to build the real API, and
 * what the backend implements against - so it belongs in the handoff, generated
 * from this file rather than described again by hand.
 *
 * Two rules that save the most rework later:
 *   - include the awkward rows: the very long title, the missing image, the
 *     empty list. A design that only works on tidy data is a design that has not
 *     been tested.
 *   - mark optional fields optional. `image?: string` tells a developer the
 *     empty state is real, and forces the design to answer for it.
 */

export interface Article {
  id: string
  title: string
  excerpt: string
  publishedAt: string
  image?: string
}

export const articles: Article[] = [
  {
    id: 'a1',
    title: 'A perfectly ordinary title',
    excerpt: 'Short, tidy, the one every design looks good with.',
    publishedAt: '2026-03-14',
    image: '/placeholder.svg',
  },
  {
    id: 'a2',
    title: 'A title that runs on considerably longer than anyone designing the card expected it to, because real editors write like this',
    excerpt: 'The row that finds out whether the layout holds.',
    publishedAt: '2026-02-02',
  },
]

/** The empty case, kept next to the data so nobody forgets it exists. */
export const noArticles: Article[] = []
