/**
 * Mock data lives here, typed, and nowhere else.
 *
 * The type is the point. It is what a developer reads to build the real source —
 * a CMS collection, a folder of markdown, whatever it turns out to be — and it
 * belongs in the handoff, generated from this file rather than described again
 * by hand.
 *
 * The awkward row is `ui-composition`. `readBy` has three values, not two, and
 * the third is the one the design has to answer for: a skill both roles read is
 * not a third colour, it is both marks at once. A design tested only on
 * `designer` and `developer` would have shipped without noticing.
 */

export type Audience = 'designer' | 'developer' | 'both'

export interface Skill {
  /** The name typed at the prompt — always shown as code. */
  name: string
  readBy: Audience
  /** When somebody reaches for it. One sentence, lower case. */
  when: string
}

export const skills: Skill[] = [
  {
    name: 'ui-kickoff',
    readBy: 'developer',
    when: "una volta, all'inizio del progetto",
  },
  {
    name: 'ui-composition',
    readBy: 'both',
    when: 'ogni volta che si scrive o si rivede UI',
  },
  {
    name: 'design-workflow',
    readBy: 'designer',
    when: 'ogni sessione di design',
  },
  {
    name: 'dev-workflow',
    readBy: 'developer',
    when: 'quando si implementa UI prototipata da un designer',
  },
  {
    name: 'ui-sync',
    readBy: 'both',
    when: 'il designer scrive la consegna, lo sviluppatore la usa e promuove',
  },
]
