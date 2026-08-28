/**
 * Token discipline: every colour, every scale step, comes from the token file.
 *
 * The load-bearing rule here is `arbitrary-repeated`. On real house code the raw
 * count of arbitrary values was 298 — a number so large it reads as noise and
 * gets ignored. Filtering to values used *more than once* turns it into a short
 * list of scale steps nobody declared: a six-step type scale, two radii while
 * `--radius-*` sat unused, one shadow spelled out twelve times. That list is
 * actionable in an afternoon. It is the rule of two, applied to design values.
 */

import { SEVERITY } from './config.mjs'
import {
  extractClasses, splitVariants, parseUtility, looksLikeColor, usesDefaultRamp,
  referencesOnlyTokens, isStructuralUtility, isInsideClassAttribute,
} from './classes.mjs'

const HEX_PATTERN = /(.{0,8})#([0-9a-fA-F]{3,8})\b/g
const VALID_HEX_LENGTHS = new Set([3, 4, 6, 8])
const FUNCTIONAL_COLOR_PATTERN = /\b(?:rgba?|hsla?|oklch|oklab)\s*\(/gi
const STATIC_STYLE_PATTERN = /(^|[\s{])style\s*=\s*"([^"]*)"/g
const CSS_VARIABLE_ONLY = /^\s*(--[\w-]+\s*:[^;]*;?\s*)+$/

export function checkTokens(files, config) {
  const parsed = new Map(files.map((file) => [file, extractClasses(file)]))
  const classIndex = indexClasses(parsed)
  const repeated = countRepeatedArbitraries(classIndex)

  return [
    ...files.flatMap((file) => rawColors(file, parsed.get(file).ranges, config)),
    ...files.flatMap((file) => inlineStyles(file)),
    ...files.flatMap((file) => dynamicClassNames(file, parsed.get(file).fragments)),
    ...classIndex.flatMap((entry) => classFindings(entry, repeated, config)),
  ]
}

/** Parse every class in every file exactly once. */
function indexClasses(parsed) {
  return [...parsed].flatMap(([file, { classes }]) =>
    classes.map(({ className, line, bound }) => {
      const { utility } = splitVariants(className)
      return { file, line, className, bound, ...parseUtility(utility) }
    }),
  )
}

function countRepeatedArbitraries(classIndex) {
  const counts = new Map()
  for (const entry of classIndex) {
    if (!entry.arbitrary) continue
    const key = `${entry.prefix}-[${entry.arbitrary}]`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

function classFindings(entry, repeated, config) {
  const { file, line, className, prefix, arbitrary, important } = entry
  const found = []
  const add = (rule, severity, message, fix) => {
    if (!file.waivedAt(line, rule)) found.push({ rule, severity, file: file.rel, line, excerpt: className, message, fix })
  }

  // No `bound` guard: a bound value is mined for its string literals only, so the
  // JavaScript negation this used to protect (`!dragging`) never reaches here —
  // and the guard silently exempted every class map in a script block.
  if (important) {
    add('important', SEVERITY.BLOCKING,
      'Forces a style through specificity instead of fixing the cause.',
      'Remove the `!` and resolve the conflict where it originates.')
  }

  const ramp = usesDefaultRamp(prefix, config)
  if (ramp) {
    add('default-palette', SEVERITY.BLOCKING,
      `Uses Tailwind's own \`${ramp.ramp}\` ramp instead of a semantic token.`,
      `Use \`${ramp.utility}-foreground\`, \`${ramp.utility}-muted\` or another token from the theme.`)
  }

  // Reaching a token through `var()` is the sanctioned escape hatch, not a breach.
  if (!arbitrary || referencesOnlyTokens(arbitrary)) return found

  const key = `${prefix}-[${arbitrary}]`
  const uses = repeated.get(key) ?? 1

  if (looksLikeColor(arbitrary)) {
    add('arbitrary-color', SEVERITY.BLOCKING,
      'A raw colour hidden inside an arbitrary value.',
      'Declare it in the token file and reach it through a semantic token.')
  } else if (isStructuralUtility(prefix)) {
    add('arbitrary-structural', SEVERITY.ADVISORY,
      'Describes structure rather than a scale step, so there is no token to reach for.',
      'Leave it, unless the same structure appears in several places: then it is a layout component.')
  } else if (config.scaleUtilities.includes(prefix)) {
    add('arbitrary-scale', SEVERITY.BLOCKING,
      'An arbitrary value on a scale property: type, spacing, radius, shadow. It is a scale step nobody declared.',
      'Add it to the theme scale, then use the named step.')
  } else if (uses > 1) {
    add('arbitrary-repeated', SEVERITY.BLOCKING,
      'A hand-written value used more than once. The second occurrence of a value is a token waiting to be named.',
      'Declare it in the token file and replace every occurrence.')
  } else {
    add('arbitrary-once', SEVERITY.ADVISORY,
      'A one-off dimension. Fine if it is genuinely unique — a reading measure, an image ratio.',
      'If it appears again anywhere, it becomes a token.')
  }

  return found
}

/** A class name built from an interpolated fragment never reaches the stylesheet. */
function dynamicClassNames(file, fragments) {
  return (fragments ?? [])
    .filter(({ line }) => !file.waivedAt(line, 'dynamic-class'))
    .map(({ fragment, line }) => ({
      rule: 'dynamic-class', severity: SEVERITY.ADVISORY, file: file.rel, line, excerpt: fragment,
      message: 'A class name assembled from a fragment. Tailwind never generates it, so the element renders unstyled.',
      fix: 'Write the whole names in a map and pick one — which is what a variant map already is.',
    }))
}

/** Raw colours in markup, script and — the common case — inline SVG attributes. */
function rawColors(file, classRanges, config) {
  if (file.rel.endsWith(config.tokenFile.split('/').at(-1))) return []
  const found = []

  for (const match of file.text.matchAll(HEX_PATTERN)) {
    const [, before, digits] = match
    if (!VALID_HEX_LENGTHS.has(digits.length)) continue
    if (/href\s*=\s*["']$|\($/.test(before)) continue
    const offset = match.index + before.length
    // A colour inside a class attribute is `arbitrary-color`'s business, not ours.
    if (isInsideClassAttribute(classRanges, offset) || file.isInsideComment(offset)) continue
    const line = file.lineAt(offset)
    if (file.waivedAt(line, 'raw-color')) continue
    found.push({
      rule: 'raw-color', severity: SEVERITY.BLOCKING, file: file.rel, line,
      excerpt: `#${digits}`,
      message: 'A colour written by hand, outside the token file.',
      fix: file.text.slice(Math.max(0, match.index - 40), match.index).includes('<svg') || /stroke|fill/.test(before)
        ? 'In an inline SVG use `currentColor` and set the colour with a text token.'
        : 'Move it into the token file and reference the token.',
    })
  }

  for (const match of file.text.matchAll(FUNCTIONAL_COLOR_PATTERN)) {
    if (isInsideClassAttribute(classRanges, match.index) || file.isInsideComment(match.index)) continue
    const line = file.lineAt(match.index)
    if (file.waivedAt(line, 'raw-color')) continue
    found.push({
      rule: 'raw-color', severity: SEVERITY.BLOCKING, file: file.rel, line,
      excerpt: match[0], message: 'A colour written by hand, outside the token file.',
      fix: 'Move it into the token file and reference the token.',
    })
  }

  return found
}

/**
 * A *static* `style="…"` is a style that escaped the system. A bound `:style`
 * that only sets CSS custom properties is not: dynamic token selection is
 * something classes genuinely cannot express, and real house code relies on it.
 */
function inlineStyles(file) {
  const found = []
  for (const match of file.text.matchAll(STATIC_STYLE_PATTERN)) {
    const [, , declarations] = match
    if (CSS_VARIABLE_ONLY.test(declarations) || file.isInsideComment(match.index)) continue
    const line = file.lineAt(match.index)
    if (file.waivedAt(line, 'inline-style')) continue
    found.push({
      rule: 'inline-style', severity: SEVERITY.BLOCKING, file: file.rel, line,
      excerpt: `style="${declarations.slice(0, 48)}${declarations.length > 48 ? '…' : ''}"`,
      message: 'A static inline style — invisible to the token system and to every other component.',
      fix: 'Express it with utility classes, or move it into the component that owns the concern.',
    })
  }
  return found
}
