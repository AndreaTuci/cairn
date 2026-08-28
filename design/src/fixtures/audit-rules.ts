/**
 * The rules the gate enforces, as data.
 *
 * They are read from the audit's own source today and typed by hand here. When
 * that list becomes generated, this interface is the shape it has to produce —
 * which is why the file exists rather than the ten rows being written into the
 * page.
 */

export interface AuditRule {
  /** The rule id, exactly as the report prints it. */
  id: string
  /** What it intercepts, in one sentence. Backticked terms are set as code. */
  catches: string
}

export const auditRules: AuditRule[] = [
  { id: 'raw-color', catches: 'a colour typed outside the token file, SVG attributes included' },
  { id: 'default-palette', catches: "Tailwind's own scales in place of the semantic tokens" },
  {
    id: 'arbitrary-scale',
    catches: 'an arbitrary value on a scale property: a step nobody declared',
  },
  { id: 'arbitrary-color', catches: 'a colour hidden inside an arbitrary value' },
  { id: 'arbitrary-repeated', catches: 'a hand-written value used more than once' },
  { id: 'inline-style', catches: 'a static inline style, invisible to the token system' },
  { id: 'file-budget', catches: 'a component past 150 lines, a page past 250' },
  { id: 'duplicate-block', catches: 'two files that are structurally near-identical' },
  { id: 'unused-component', catches: 'defined, imported by nobody, shown nowhere' },
  {
    id: 'a11y',
    catches: 'a missing alt, a control with no accessible name, a broken heading order, a removed focus ring',
  },
]
