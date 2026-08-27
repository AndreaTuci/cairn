/**
 * What this guide is made of, counted.
 *
 * `npm run design:inventory` writes `INVENTORY.json` beside `INVENTORY.md`, and
 * the first two numbers are read out of it rather than typed here. The labels
 * stay, because they are page copy.
 *
 * The third one, `shown`, is still by hand. The gallery lists its components as
 * markup, so there is nothing to count without restructuring it — which is a
 * design decision, not a developer's. It is open question 5 in the handoff, and
 * it stays open rather than being quietly rounded off here.
 */
import inventory from '../../INVENTORY.json'
import type { Metric } from './metrics'

/** Every component in the guide. Exported so the page can stop spelling it out in prose. */
export const componentCount = inventory.components.length

const unused = inventory.components.filter((component) => component.uses === 0).length

/** By hand until the gallery derives its own list — see handoff, open question 5. */
const SHOWN_IN_GALLERY = 11

export const composition: Metric[] = [
  { value: String(componentCount), label: 'Componenti in tutta la guida' },
  { value: String(unused), label: 'Componenti che non usa nessuno — uno solo bloccherebbe il controllo' },
  { value: String(SHOWN_IN_GALLERY), label: 'Quelli che puoi vedere funzionare qui sotto' },
]

export interface PageFramePart {
  /** The component name, always shown as code. */
  name: string
  /** Where on this very page the reader is already looking at it. */
  where: string
}

export const pageFrame: PageFramePart[] = [
  { name: 'SiteHeader', where: 'la barra qui sopra, con il nome e le quattro pagine' },
  { name: 'PageIntro', where: 'il titolo di questa pagina, e il primo segno appeso al filo' },
  { name: 'Section', where: 'ogni titolo che stai scorrendo, con il suo segno' },
  { name: 'SiteFooter', where: 'il link in fondo, che porta alla pagina dopo' },
  { name: 'Specimen', where: 'la cornice di ognuna delle teche qui sopra: la stai già guardando undici volte' },
  { name: 'PartsGallery', where: 'la griglia che le tiene tutte e undici' },
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
    why: "Non c'è niente da aspettare. Le pagine sono HTML già scritto, senza una riga di JavaScript.",
  },
  { name: 'in errore', why: "Stesso motivo: non c'è niente che possa fallire." },
]
