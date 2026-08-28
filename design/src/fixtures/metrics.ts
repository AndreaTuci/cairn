/**
 * What the absence of a rule cost, counted on one real project of ours: written
 * by good developers, with no designer anywhere near it.
 *
 * `value` is a string rather than a number because one of these is a percentage
 * and the rest are counts, and a design that renders `85` and `27` identically
 * has quietly lost the difference. The awkward row is deliberate.
 */

export interface Metric {
  /** Rendered large. A count or a percentage — never arithmetic. */
  value: string
  /** What was counted. Backticked terms are set as code. */
  label: string
}

export const metrics: Metric[] = [
  { value: '27', label: '`text-[13px]` typed by hand' },
  { value: '14', label: '`rounded-[8px]`, while `--radius-lg` sat unused' },
  { value: '12', label: 'One shadow spelled out in full' },
  { value: '85%', label: 'Two authentication forms, structurally identical' },
  { value: '2', label: 'Components imported by nobody' },
]
