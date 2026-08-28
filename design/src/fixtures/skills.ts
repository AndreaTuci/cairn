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
    when: 'once, when the project starts',
  },
  {
    name: 'ui-composition',
    readBy: 'both',
    when: 'every time any UI is written or reviewed',
  },
  {
    name: 'design-workflow',
    readBy: 'designer',
    when: 'every design session',
  },
  {
    name: 'dev-workflow',
    readBy: 'developer',
    when: 'implementing UI a designer prototyped',
  },
  {
    name: 'ui-sync',
    readBy: 'both',
    when: 'the designer writes the handoff, the developer uses it and promotes',
  },
]
