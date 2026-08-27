/**
 * Class composition, and the variant map it enables.
 *
 * A component has one base and a small set of declared variants. Variation
 * travels through a prop; it never travels through a second copy of the file.
 * The moment you find yourself duplicating a component to change two classes,
 * the change belongs in this map instead.
 */

export type ClassValue = string | false | null | undefined

export function cx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ')
}

/** Pick one class string per variant axis, falling back to the declared default. */
export function variants<T extends Record<string, Record<string, string>>>(
  map: T,
  chosen: Partial<{ [K in keyof T]: keyof T[K] }>,
  defaults: { [K in keyof T]: keyof T[K] },
): string {
  const keys = Object.keys(map) as (keyof T)[]
  return cx(...keys.map((key) => map[key][(chosen[key] ?? defaults[key]) as string]))
}
