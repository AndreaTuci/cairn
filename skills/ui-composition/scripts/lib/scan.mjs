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

const WAIVER_PATTERN = /ui-audit-allow:\s*([a-z-]+|\*)/gi
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
  const waivers = parseWaivers(lines)
  const comments = [...text.matchAll(COMMENT_PATTERN)].map((m) => [m.index, m.index + m[0].length])

  return {
    abs,
    rel: rel.split(/[\\/]/).join('/'),
    ext: extname(abs),
    text,
    lines,
    lineCount: lines.length,
    kind: classify(rel),
    lineAt: (offset) => upperBound(offsets, offset),
    // A colour named in a comment is documentation, not a style. Real code does
    // this constantly: `<!-- Dark overlay (Figma: rgba(37,40,40,0.7)) -->`.
    isInsideComment: (offset) => comments.some(([from, to]) => offset >= from && offset < to),
    waivedAt: (line, ruleId) => {
      const waived = waivers.get(line)
      return Boolean(waived && (waived.has(ruleId) || waived.has('*')))
    },
    imports: [...text.matchAll(IMPORT_PATTERN)].map((m) => m[1] ?? m[2]),
  }
}

/** `src/pages/index.astro` → 'page'. The kind decides which budget applies. */
function classify(rel) {
  const path = `/${rel.split(/[\\/]/).join('/')}`
  if (path.includes('/pages/')) return 'page'
  if (path.includes('/layouts/')) return 'layout'
  if (path.includes('/components/')) return 'component'
  if (path.includes('/fixtures/')) return 'fixture'
  return 'other'
}

/**
 * Map each line number to the rules waived there. A waiver covers its own line
 * and the next non-blank line, so it reads naturally above the code it excuses.
 */
function parseWaivers(lines) {
  const waivers = new Map()
  const add = (line, rule) => {
    if (!waivers.has(line)) waivers.set(line, new Set())
    waivers.get(line).add(rule.toLowerCase())
  }
  lines.forEach((text, index) => {
    const matches = [...text.matchAll(WAIVER_PATTERN)]
    if (matches.length === 0) return
    const nextCode = nextNonBlankLine(lines, index)
    for (const [, rule] of matches) {
      add(index + 1, rule)
      if (nextCode !== null) add(nextCode, rule)
    }
  })
  return waivers
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
