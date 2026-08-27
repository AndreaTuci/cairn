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
  { value: '27', label: '`text-[13px]` scritto a mano' },
  { value: '14', label: '`rounded-[8px]`, mentre `--radius-lg` esisteva inutilizzato' },
  { value: '12', label: "Un'ombra riscritta per esteso" },
  { value: '85%', label: 'Due form di autenticazione strutturalmente identici' },
  { value: '2', label: 'Componenti importati da nessuno' },
]
