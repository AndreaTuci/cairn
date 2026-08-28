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

const CODE_TERM = /`([^`]+)`/g

/**
 * Walk the backticked terms, taking what sits before each one as plain text and
 * whatever is left over at the end as the tail.
 *
 * It used to be a `split` on the same pattern, reading the parity of the index
 * to decide which halves were code. That was correct, and it required the reader
 * to know what `String.split` does with a capture group before the line made any
 * sense at all.
 */
export function segments(copy: string): Segment[] {
  const found: Segment[] = []
  let plainFrom = 0

  for (const term of copy.matchAll(CODE_TERM)) {
    const plain = copy.slice(plainFrom, term.index)
    if (plain) found.push({ text: plain, code: false })
    found.push({ text: term[1], code: true })
    plainFrom = term.index + term[0].length
  }

  const tail = copy.slice(plainFrom)
  if (tail) found.push({ text: tail, code: false })

  return found
}
