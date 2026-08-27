/**
 * What this guide is made of, counted.
 *
 * The counts are produced by `npm run design:inventory` into `INVENTORY.md` and
 * typed back in here by hand, which means they can go stale the day somebody
 * adds a component. That is an open question in the handoff, not an oversight:
 * the page could read the generated file instead, and the day it does, the empty
 * and error states stop being n/a.
 */
import type { Metric } from './metrics'

export const composition: Metric[] = [
  { value: '16', label: 'Componenti in tutta la guida' },
  { value: '0', label: 'Componenti che non usa nessuno — uno solo bloccherebbe il controllo' },
  { value: '10', label: 'Quelli che puoi vedere funzionare qui sotto' },
]

export interface PageFramePart {
  /** The component name, always shown as code. */
  name: string
  /** Where on this very page the reader is already looking at it. */
  where: string
}

export const pageFrame: PageFramePart[] = [
  { name: 'SiteHeader', where: 'la barra qui sopra, con il nome e le tre pagine' },
  { name: 'PageIntro', where: 'il titolo di questa pagina, e il primo segno appeso al filo' },
  { name: 'Section', where: 'ogni titolo che stai scorrendo, con il suo segno' },
  { name: 'SiteFooter', where: 'il link in fondo, che porta alla pagina dopo' },
  { name: 'Specimen', where: 'la cornice di ognuna delle dieci teche qui sopra: la stai già guardando dieci volte' },
  { name: 'PartsGallery', where: 'la griglia che le tiene tutte e dieci' },
]

export interface StateAnswer {
  /** The state, named the way the house rules name it. */
  name: string
  /** Why it does not exist on these pages. An answer with a reason, not an omission. */
  why: string
}

/**
 * Three of the four states, and why they are not drawn. The day the lists stop
 * being typed by hand and get read from the project's own folders, all three
 * become real — see the open question in `HANDOFF.md`.
 */
export const statesNotDrawn: StateAnswer[] = [
  {
    name: 'vuoto',
    why: "Le cinque skill e le dieci regole sono liste chiuse. Una guida senza skill dentro non è uno stato: è una build rotta.",
  },
  {
    name: 'in caricamento',
    why: "Non c'è niente da aspettare. Le tre pagine sono HTML già scritto, senza una riga di JavaScript.",
  },
  { name: 'in errore', why: "Stesso motivo: non c'è niente che possa fallire." },
]
