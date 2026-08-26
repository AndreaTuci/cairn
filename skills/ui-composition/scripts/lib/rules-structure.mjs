/**
 * Structure: size, duplication, dead code.
 *
 * `duplicate-block` is the rule that catches the failure mode this whole system
 * exists for — the same layout pasted six times with small variations, which
 * reads as six finished pages and behaves as one component nobody extracted.
 * Similarity is measured on the tag stream alone: attributes and text are
 * stripped, so "the same thing with different words in it" still matches.
 */

import { SEVERITY } from './config.mjs'

const TAG_PATTERN = /<\/?([a-zA-Z][\w.-]*)/g
const PROPS_BLOCK = /(?:interface\s+Props\s*\{|defineProps<\s*\{)([\s\S]*?)\n\s*\}/
const PROP_LINE = /^\s*(\w+)\??\s*:/
const SHINGLE_SIZE = 5

export function checkStructure(files, config) {
  return [
    ...files.flatMap((file) => fileBudget(file, config)),
    ...files.flatMap((file) => propsBudget(file, config)),
    ...duplicates(files, config),
    ...unusedComponents(files),
  ]
}

function budgetFor(kind, budgets) {
  if (kind === 'page') return budgets.page
  if (kind === 'fixture') return null
  return budgets.component
}

function fileBudget(file, config) {
  const budget = budgetFor(file.kind, config.budgets)
  if (budget === null) return []
  const rule = 'file-budget'
  if (file.waivedAt(1, rule)) return []

  const over = file.lineCount > budget
  const near = file.lineCount > budget * config.budgets.warnAt
  if (!over && !near) return []

  return [{
    rule,
    severity: over ? SEVERITY.BLOCKING : SEVERITY.ADVISORY,
    file: file.rel,
    line: 1,
    excerpt: `${file.lineCount} lines`,
    message: over
      ? `Over the ${budget}-line budget for a ${file.kind}. A file this size is doing more than one job.`
      : `Approaching the ${budget}-line budget for a ${file.kind}.`,
    fix: 'Extract the part that has its own name — a header, a card, a field group — into its own component.',
  }]
}

/**
 * Past a certain number of props a component is being configured rather than
 * composed, and the caller is doing the work the component was supposed to do.
 */
function propsBudget(file, config) {
  const block = file.text.match(PROPS_BLOCK)
  if (!block || file.waivedAt(1, 'props-budget')) return []
  const names = block[1].split('\n').map((line) => line.match(PROP_LINE)).filter(Boolean)
    .map(([, name]) => name).filter((name) => name !== 'class')
  if (names.length <= config.budgets.props) return []
  return [{
    rule: 'props-budget',
    severity: SEVERITY.ADVISORY,
    file: file.rel,
    line: 1,
    excerpt: `${names.length} props`,
    message: `More than ${config.budgets.props} props. At this point the caller is assembling the component rather than using it.`,
    fix: 'Split it, or group the related props behind one object with a name of its own.',
  }]
}

/** Reduce a file to its tag sequence: structure without words. */
function tagStream(file) {
  return [...file.text.matchAll(TAG_PATTERN)].map((match) => match[1].toLowerCase())
}

function shingles(tokens) {
  const set = new Set()
  for (let i = 0; i + SHINGLE_SIZE <= tokens.length; i += 1) {
    set.add(tokens.slice(i, i + SHINGLE_SIZE).join('>'))
  }
  return set
}

function jaccard(a, b) {
  let shared = 0
  for (const item of a) if (b.has(item)) shared += 1
  return shared / (a.size + b.size - shared)
}

function duplicates(files, config) {
  const { threshold, minTokens } = config.duplication
  const candidates = files
    .map((file) => ({ file, tokens: tagStream(file) }))
    .filter((entry) => entry.tokens.length >= minTokens)
    .map((entry) => ({ ...entry, shingles: shingles(entry.tokens) }))

  const found = []
  for (let i = 0; i < candidates.length; i += 1) {
    for (let j = i + 1; j < candidates.length; j += 1) {
      const similarity = jaccard(candidates[i].shingles, candidates[j].shingles)
      if (similarity < threshold) continue
      const [first, second] = [candidates[i].file, candidates[j].file]
      if (second.waivedAt(1, 'duplicate-block')) continue
      found.push({
        rule: 'duplicate-block',
        severity: SEVERITY.BLOCKING,
        file: second.rel,
        line: 1,
        excerpt: `${Math.round(similarity * 100)}% structurally identical to ${first.rel}`,
        message: 'The same structure, twice. The second copy is where the two silently drift apart.',
        fix: `Extract the shared shape into one component and let the difference travel as a prop.`,
      })
    }
  }
  return found
}

/**
 * A component nobody imports and nobody renders. Pages and layouts are entry
 * points and are never counted as unused.
 */
function unusedComponents(files) {
  const components = files.filter((file) => file.kind === 'component')
  const haystack = files.map((file) => ({ rel: file.rel, text: file.text, imports: file.imports }))

  return components.flatMap((component) => {
    const name = component.rel.split('/').at(-1).replace(/\.\w+$/, '')
    const used = haystack.some((other) => {
      if (other.rel === component.rel) return false
      const imported = other.imports.some((path) => path.split('/').at(-1).replace(/\.\w+$/, '') === name)
      return imported || new RegExp(`<${name}[\\s/>]`).test(other.text)
    })
    if (used || component.waivedAt(1, 'unused-component')) return []
    return [{
      rule: 'unused-component',
      severity: SEVERITY.BLOCKING,
      file: component.rel,
      line: 1,
      excerpt: name,
      message: 'Defined, imported nowhere, rendered nowhere.',
      fix: 'Delete it, or wire it up. Code kept "just in case" is the code nobody dares change later.',
    }]
  })
}
