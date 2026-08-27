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
  { id: 'raw-color', catches: 'un colore scritto a mano fuori dal file dei token, attributi SVG compresi' },
  { id: 'default-palette', catches: 'le scale di Tailwind al posto dei token semantici' },
  {
    id: 'arbitrary-scale',
    catches: 'un valore arbitrario su una proprietà di scala: uno step che nessuno ha dichiarato',
  },
  { id: 'arbitrary-color', catches: 'un colore nascosto dentro un valore arbitrario' },
  { id: 'arbitrary-repeated', catches: 'un valore scritto a mano usato più di una volta' },
  { id: 'inline-style', catches: 'uno stile inline statico, invisibile al sistema dei token' },
  { id: 'file-budget', catches: 'un componente oltre 150 righe, una pagina oltre 250' },
  { id: 'duplicate-block', catches: 'due file strutturalmente quasi identici' },
  { id: 'unused-component', catches: 'definito, importato da nessuno, mostrato da nessuna parte' },
  {
    id: 'a11y',
    catches: 'alt mancante, controllo senza nome accessibile, gerarchia dei titoli rotta, focus rimosso',
  },
]
