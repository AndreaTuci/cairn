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
const SHOWN_IN_GALLERY = 12

export const composition: Metric[] = [
  { value: String(componentCount), label: 'Components in the whole guide' },
  { value: String(unused), label: 'Components nobody uses — one alone would block the check' },
  { value: String(SHOWN_IN_GALLERY), label: 'The ones you can watch running below' },
]

export interface PageFramePart {
  /** The component name, always shown as code. */
  name: string
  /** Where on this very page the reader is already looking at it. */
  where: string
}

export const pageFrame: PageFramePart[] = [
  { name: 'SiteHeader', where: 'the bar above, with the name and the four pages' },
  { name: 'PageIntro', where: "this page's title, and the first mark hung on the rail" },
  { name: 'Section', where: 'every heading you are scrolling past, with its own mark' },
  { name: 'SiteFooter', where: 'the link at the bottom, leading to the next page' },
  {
    name: 'Specimen',
    where: `the frame round every case above — you are looking at ${SHOWN_IN_GALLERY} of them`,
  },
  { name: 'PartsGallery', where: `the grid holding all ${SHOWN_IN_GALLERY}` },
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
    name: 'empty',
    why: 'The five skills and the ten rules are closed lists. A guide with no skills in it is not a state, it is a broken build.',
  },
  {
    name: 'loading',
    why: 'There is nothing to wait for. The pages are HTML already written, without a line of JavaScript.',
  },
  { name: 'error', why: 'Same reason: there is nothing here that can fail.' },
]
