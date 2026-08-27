/**
 * The map from the workbench to production, as `ui-kickoff` writes it into
 * `UI-STACK.md` under "Where things land".
 *
 * Paths are relative to `design/`. The contract writes them in full; the page
 * says the prefix once in prose instead, because four repetitions of it only
 * bought width in a column that has none to spare.
 *
 * `to` is a description rather than a path, and deliberately so: the production
 * path is the project's own and this guide has no business inventing one. What
 * is fixed is which workbench folder has a destination at all — and that the
 * fixtures folder does not.
 */

export interface PromotionRoute {
  /** The workbench folder, written the way the contract writes it. */
  from: string
  /** What it lands as in the project. Backticked terms are set as code. */
  to: string
}

export const promotionRoutes: PromotionRoute[] = [
  { from: 'src/components/', to: 'la cartella dei componenti del progetto' },
  { from: 'src/layouts/', to: 'i layout, dove il progetto li tiene' },
  {
    from: 'src/styles/theme.css',
    to: 'il file dei colori di produzione — uno solo, con gli stessi valori',
  },
  {
    from: 'src/fixtures/',
    to: 'niente. I dati finti vengono sostituiti da dati veri, non promossi',
  },
]
