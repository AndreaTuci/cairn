/**
 * Copy that carries code terms inside it.
 *
 * The brief writes technical terms in backticks, the way anyone writing prose
 * about code does. Keeping that notation in the fixture means the data holds the
 * real sentence rather than a version of it chopped into fields to suit the
 * markup — and a developer replacing the fixture with a CMS knows exactly what
 * the field contains.
 *
 * Authored copy only. Nothing here escapes anything, because nothing here comes
 * from a user.
 */

export interface Segment {
  text: string
  /** True for the parts that were between backticks. */
  code: boolean
}

export function segments(copy: string): Segment[] {
  return copy
    .split(/`([^`]+)`/g)
    .map((text, index) => ({ text, code: index % 2 === 1 }))
    .filter((segment) => segment.text.length > 0)
}
