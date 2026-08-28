/**
 * File discovery and the file model every rule reads.
 *
 * A waiver is a comment — `ui-audit-allow: <rule> — <reason>` — that silences one
 * rule on the line it precedes. It is deliberately noisy to write and trivial to
 * grep, because a waiver is a decision someone has to be able to find later.
 * Errors should never pass silently. Unless explicitly silenced.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

// A waiver names one rule and gives a reason. The `*` wildcard it used to accept
// silenced every rule at once, was documented nowhere, and needed no reason; and a
// waiver with no reason is a rule quietly deleted, which is the thing the syntax
// exists to prevent. Both are now unparseable rather than forbidden in prose.
const WAIVER_PATTERN = /ui-audit-allow:\s*([a-z-]+)\s*[-\u2014:]\s*([^\n]*\S)/gi
const IMPORT_PATTERN = /\bfrom\s+['"]([^'"]+)['"]|\bimport\s+['"]([^'"]+)['"]/g
// `//` only opens a comment when it is not the `//` in `https://`.
const COMMENT_PATTERN = /<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|(?<![:\w])\/\/[^\n]*/g

/** Walk a directory, skipping anything the config excludes. */
export function collectFiles(rootDir, config) {
  const found = []
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const abs = join(dir, entry)
      const rel = relative(rootDir, abs)
      const segments = rel.split(/[\\/]/)
      if (segments.some((segment) => config.ignoreDirs.includes(segment))) continue
      if ((config.ignorePaths ?? []).some((part) => `${segments.join('/')}/`.includes(part))) continue
      if (statSync(abs).isDirectory()) { walk(abs); continue }
      if (config.extensions.includes(extname(abs))) found.push(makeFile(abs, rel))
    }
  }
  walk(rootDir)
  return found.sort((a, b) => a.rel.localeCompare(b.rel))
}

function makeFile(abs, rel) {
  const text = readFileSync(abs, 'utf8')
  const lines = text.split('\n')
  const offsets = lineStartOffsets(lines)
  const { waivers, declared } = parseWaivers(lines, comments(text))
  const commentRanges = comments(text)

  return {
    abs,
    rel: rel.split(/[\\/]/).join('/'),
    ext: extname(abs),
    text,
    lines,
    lineCount: lines.length,
    kind: classify(rel),
    // Every waiver the file declares, so the report can print the register
    // instead of asking somebody to keep one by hand.
    waivers: declared,
    lineAt: (offset) => upperBound(offsets, offset),
    // A colour named in a comment is documentation, not a style. Real code does
    // this constantly: `<!-- Dark overlay (Figma: rgba(37,40,40,0.7)) -->`.
    isInsideComment: (offset) => commentRanges.some(([from, to]) => offset >= from && offset < to),
    waivedAt: (line, ruleId) => {
      const waived = waivers.get(line)
      return Boolean(waived && waived.has(ruleId))
    },
    imports: [...text.matchAll(IMPORT_PATTERN)].map((m) => m[1] ?? m[2]),
  }
}

/** `src/pages/index.astro` → 'page'. The kind decides which budget applies. */
function classify(rel) {
  const path = `/${rel.split(/[\\/]/).join('/')}`
  // Fixtures first, whatever they are written in: a fixture holds page copy, and
  // copy about a project talks about its classes — `text-[13px] typed by hand` is
  // a sentence there, not a style, and reading it as one would flag the guide that
  // documents the rule.
  if (path.includes('/fixtures/')) return 'fixture'
  // Then extension: a stylesheet under `components/` is still a stylesheet, and
  // calling it a component would hand it a line budget and the unused-component
  // rule, neither of which means anything for CSS.
  if (path.endsWith('.css')) return 'stylesheet'
  if (path.endsWith('.php')) return 'php'
  if (path.endsWith('.ts') || path.endsWith('.js')) return 'module'
  if (path.includes('/pages/')) return 'page'
  if (path.includes('/layouts/')) return 'layout'
  if (path.includes('/components/')) return 'component'
  return 'other'
}

/**
 * Map each line number to the rules waived there. A waiver covers its own line
 * and the next non-blank line, so it reads naturally above the code it excuses.
 *
 * It only counts inside a comment. Prose *about* a waiver — a guide page quoting
 * the syntax, a README explaining it — used to silence the line below itself,
 * which happened in cairn's own documentation before anyone noticed.
 */
function parseWaivers(lines, commentRanges) {
  const waivers = new Map()
  const declared = []
  const offsets = lineStartOffsets(lines)
  const inComment = (offset) => commentRanges.some(([from, to]) => offset >= from && offset < to)
  const add = (line, rule) => {
    if (!waivers.has(line)) waivers.set(line, new Set())
    waivers.get(line).add(rule.toLowerCase())
  }
  lines.forEach((text, index) => {
    const matches = [...text.matchAll(WAIVER_PATTERN)].filter(
      (match) => inComment(offsets[index] + match.index) && !insideQuotes(text, match.index),
    )
    if (matches.length === 0) return
    const nextCode = nextNonBlankLine(lines, index)
    for (const [, rule, reason] of matches) {
      add(index + 1, rule)
      if (nextCode !== null) add(nextCode, rule)
      declared.push({ line: index + 1, rule: rule.toLowerCase(), reason: tidyReason(reason) })
    }
  })
  return { waivers, declared }
}

/**
 * Is this offset inside a quoted string on its own line?
 *
 * A guide that documents the waiver syntax writes the comment out as a string —
 * `const WAIVER = \`<!-- ui-audit-allow: inline-style - ... -->\`` — and the
 * comment scanner cannot tell that apart from the real thing, because it *is* an
 * HTML comment, quoted. It then silenced the next line of a page whose only crime
 * was explaining the feature. Failing closed on an unbalanced quote is the right
 * direction: a waiver that does not apply is visible, one that applies by accident
 * is not.
 */
function insideQuotes(line, index) {
  let open = null
  for (let i = 0; i < index; i += 1) {
    const char = line[i]
    if (open) { if (char === open) open = null; continue }
    if (char === "'" || char === '"' || char === '`') open = char
  }
  return open !== null
}

/** The reason, without the comment's own closing punctuation. */
function tidyReason(reason) {
  return reason.replace(/\s*(-->|\*\/)\s*$/, '').trim()
}

/** Every comment in the file, as character ranges. */
function comments(text) {
  return [...text.matchAll(COMMENT_PATTERN)].map((m) => [m.index, m.index + m[0].length])
}

function nextNonBlankLine(lines, fromIndex) {
  for (let i = fromIndex + 1; i < lines.length; i += 1) {
    if (lines[i].trim() !== '') return i + 1
  }
  return null
}

function lineStartOffsets(lines) {
  const offsets = [0]
  for (const line of lines) offsets.push(offsets.at(-1) + line.length + 1)
  return offsets
}

/** Which line contains this character offset? Binary search, 1-based. */
function upperBound(offsets, offset) {
  let low = 0
  let high = offsets.length - 1
  while (low < high) {
    const mid = (low + high + 1) >> 1
    if (offsets[mid] <= offset) low = mid
    else high = mid - 1
  }
  return low + 1
}
