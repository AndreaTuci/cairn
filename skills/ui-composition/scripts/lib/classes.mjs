/**
 * Tailwind class parsing.
 *
 * This file exists because the naive regex — "flag anything with square
 * brackets" — is wrong in a way that destroys the gate's credibility. In real
 * house code, `group-data-[collapsed]:hidden` and `[&_svg]:size-4` are arbitrary
 * *variants*: selectors, not values. Flagging them trains everyone to ignore the
 * output. So a class is split on `:` at bracket depth zero, and only the final
 * segment — the utility — is ever inspected.
 */

// No `\b` before the function names: Tailwind separates arbitrary values with `_`,
// which is a word character, so `shadow-[0_8px_24px_0_rgb(0_0_0_/_0.06)]` would slip
// past a word-boundary anchor and hide a raw colour inside a shadow.
const COLOR_PATTERN = /#[0-9a-f]{3,8}\b|(?:rgba?|hsla?|oklch|oklab|color-mix)\s*\(/i

/** Split `md:hover:text-[13px]` into its variants and its utility, bracket-aware. */
export function splitVariants(className) {
  const segments = []
  let depth = 0
  let current = ''
  for (const char of className) {
    if (char === '[' || char === '(') depth += 1
    else if (char === ']' || char === ')') depth -= 1
    if (char === ':' && depth === 0) {
      segments.push(current)
      current = ''
      continue
    }
    current += char
  }
  segments.push(current)
  return { variants: segments.slice(0, -1), utility: segments.at(-1) }
}

/**
 * Break a utility into the parts the rules care about.
 * `-mt-[13px]` → { prefix: 'mt', arbitrary: '13px', negative: true }
 * `bg-red-500!` → { prefix: 'bg-red-500', arbitrary: null, important: true }
 */
export function parseUtility(utility) {
  let body = utility
  let important = false
  if (body.startsWith('!')) { important = true; body = body.slice(1) }
  if (body.endsWith('!')) { important = true; body = body.slice(0, -1) }

  let negative = false
  if (body.startsWith('-')) { negative = true; body = body.slice(1) }

  const open = body.indexOf('[')
  if (open === -1) return { prefix: body, arbitrary: null, negative, important }

  const close = body.lastIndexOf(']')
  const arbitrary = close > open ? body.slice(open + 1, close) : null
  // `text-[13px]` → prefix `text`; a bare `[--x:red]` has no prefix at all.
  const prefix = body.slice(0, open).replace(/-$/, '')
  return { prefix, arbitrary, negative, important }
}

/** Does this string carry a colour in any CSS notation? */
export function looksLikeColor(value) {
  return COLOR_PATTERN.test(value)
}

/**
 * Is this utility one of Tailwind's own colour ramps — `bg-gray-100`?
 * Semantic tokens (`bg-primary`, `text-muted-foreground`) never match.
 */
export function usesDefaultRamp(prefix, { colorUtilities, defaultRamps }) {
  // `bg-gray-100/50` is the same ramp with an opacity modifier, and `text-white`
  // is a ramp with no step at all. Both used to pass.
  const base = prefix.split('/')[0]
  const stepless = base.match(/^([a-z-]+)-(white|black)$/)
  if (stepless && colorUtilities.includes(stepless[1])) {
    return { utility: stepless[1], ramp: stepless[2] }
  }
  const match = base.match(/^([a-z-]+)-([a-z]+)-\d{2,3}$/)
  if (!match) return null
  const [, utility, ramp] = match
  const isColorUtility = colorUtilities.includes(utility)
  return isColorUtility && defaultRamps.includes(ramp) ? { utility, ramp } : null
}

/**
 * An arbitrary value that only dereferences tokens — `duration-[var(--motion-in)]`
 * — is the sanctioned escape hatch, not a violation. Tailwind has no named
 * utility for every property; reaching a token through `var()` is how you stay
 * inside the system when it does not.
 */
export function referencesOnlyTokens(value) {
  const withoutVars = value.replace(/var\(--[\w-]+(?:\s*,[^)]*)?\)/g, '')
  // A unit-bearing number left over is a hand-written scale step riding along
  // with a token: `p-[calc(var(--gap)+13px)]` used to pass because the letters
  // that make `13px` a size are the same letters `calc(` is made of.
  if (/\d\s*(px|rem|em|ch|ex|vh|vw|vmin|vmax|pt|pc|cm|mm|in)\b/i.test(withoutVars)) return false
  return /^[\s\d.,/_%a-z()+*-]*$/i.test(withoutVars) && value.includes('var(--')
}

/**
 * Utilities whose arbitrary value describes *structure*, not a scale step: a grid
 * template, an aspect ratio, a transitioned property name. There is no token to
 * reach for, so these are reported as advisory rather than blocking.
 */
const STRUCTURAL_UTILITIES = new Set([
  'grid-cols', 'grid-rows', 'col-span', 'row-span', 'aspect',
  'transition', 'will-change', 'grid-area', 'clip-path', 'mask-image',
])

export function isStructuralUtility(prefix) {
  return STRUCTURAL_UTILITIES.has(prefix)
}

/**
 * Extract every class token, with the line it sits on.
 *
 * Bound attributes — `:class="{ 'grid-rows-[1fr]': open }"` — hold an expression,
 * not a class list. Splitting one on whitespace yields JavaScript (`!dragging`)
 * that looks exactly like a Tailwind important prefix. So a bound value is mined
 * for its string literals and nothing else.
 *
 * The script block is mined the same way, and that is not an extra: the house
 * rule is that a component's classes live there, named, so the template stays
 * declarative. Reading only attributes made the gate blind to exactly the code
 * the rules ask people to write — `text-[13px]` was caught in an attribute and
 * invisible in the `const` two lines above it.
 */
export function extractClasses(file) {
  // A fixture is data, and the data of a project about frontend quotes class names
  // as prose. Mining it would report the sentence that explains the rule.
  if (file.kind === 'fixture') return { classes: [], fragments: [], ranges: [] }

  const attributePattern = /(^|[\s{,(])(:|v-bind:)?(class|className|class:list)\s*=\s*/g
  const classes = []
  const fragments = []
  const ranges = []

  for (const match of file.text.matchAll(attributePattern)) {
    const valueStart = match.index + match[0].length
    const value = readAttributeValue(file.text, valueStart)
    if (!value) continue
    if (file.isInsideComment(valueStart)) continue
    ranges.push([valueStart, valueStart + value.length])

    const bound = Boolean(match[2]) || match[3] === 'class:list' || value.startsWith('{')
    const line = file.lineAt(valueStart)
    for (const className of splitClassList(value, bound)) {
      classes.push({ className, line, bound })
    }
    for (const fragment of splitFragments(value)) fragments.push({ fragment, line })
  }

  for (const literal of scriptLiterals(file)) {
    if (file.isInsideComment(literal.start)) continue
    if (isInsideClassAttribute(ranges, literal.start)) continue
    ranges.push([literal.start, literal.start + literal.raw.length])

    const line = file.lineAt(literal.start)
    for (const className of splitClassList(literal.raw, false)) {
      classes.push({ className, line, bound: true })
    }
    for (const fragment of splitFragments(literal.raw)) fragments.push({ fragment, line })
  }

  return { classes, fragments, ranges }
}

/**
 * Class names assembled from an interpolated fragment — `bg-${role}-500`.
 *
 * Tailwind scans source text for whole class names, so a name built at runtime is
 * never generated and the element renders unstyled with nothing failing. The
 * parser used to drop these tokens silently, which meant the rule against them
 * was enforced by nobody.
 *
 * Deliberately narrow: the token must begin with an actual Tailwind utility and
 * then interpolate. `${label}` on its own, and `article-${id}`, are far more often
 * an id or a sentence than a class, and a gate that cries wolf gets ignored.
 */
const INTERPOLATING_UTILITY = new RegExp(
  `^(?:${[
    'bg', 'text', 'border', 'ring', 'outline', 'divide', 'fill', 'stroke', 'shadow',
    'from', 'via', 'to', 'accent', 'caret', 'decoration', 'placeholder',
    'p', 'px', 'py', 'pt', 'pb', 'pl', 'pr', 'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr',
    'w', 'h', 'min-w', 'min-h', 'max-w', 'max-h', 'size', 'gap', 'gap-x', 'gap-y',
    'rounded', 'opacity', 'z', 'top', 'left', 'right', 'bottom', 'inset',
    'grid-cols', 'grid-rows', 'col-span', 'row-span', 'order', 'basis', 'flex',
    'leading', 'tracking', 'indent', 'duration', 'delay', 'translate', 'scale', 'rotate',
  ].join('|')})-\\$\\{`,
)

function splitFragments(value) {
  const body = value.slice(1, -1)
  return body
    .split(/\s+/)
    .map((token) => token.trim().replace(/^[\`'"]+|[\`'"]+$/g, ''))
    .filter((token) => INTERPOLATING_UTILITY.test(token))
}

/** The script block: an `.astro` frontmatter, or a `<script>` in an SFC. */
function scriptRegion(file) {
  if (file.ext === '.astro') {
    const fence = /^---[ \t]*$/gm
    const open = fence.exec(file.text)
    if (!open) return null
    const close = fence.exec(file.text)
    if (!close) return null
    return [open.index + open[0].length, close.index]
  }
  if (file.ext === '.vue') {
    const match = file.text.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    if (!match) return null
    const bodyStart = match.index + match[0].indexOf('>') + 1
    return [bodyStart, bodyStart + match[1].length]
  }
  // A module is script all the way down.
  if (file.ext === '.ts' || file.ext === '.js') return [0, file.text.length]
  return null
}

/** Every single-line string literal in the script block, with its offset. */
function scriptLiterals(file) {
  const region = scriptRegion(file)
  if (!region) return []
  const [from, to] = region
  // Backticks included: a class list written as a template literal is still a
  // class list, and leaving them out made the gate blind to one spelling of the
  // very idiom the rules ask for. Multi-line literals stay out — those are text.
  return [...file.text.slice(from, to).matchAll(/(['"`])([^'"`\n]*)\1/g)].map((match) => ({
    start: from + match.index,
    raw: match[0],
  }))
}

/** Read a quoted or brace-delimited attribute value, respecting nesting. */
function readAttributeValue(text, start) {
  const opener = text[start]
  if (opener === '"' || opener === "'") {
    const end = text.indexOf(opener, start + 1)
    return end === -1 ? null : text.slice(start, end + 1)
  }
  if (opener !== '{') return null
  let depth = 0
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1
    else if (text[i] === '}' && --depth === 0) return text.slice(start, i + 1)
  }
  return null
}

function splitClassList(value, bound) {
  const body = value.slice(1, -1)
  const source = bound ? [...body.matchAll(/["'`]([^"'`]*)["'`]/g)].map((m) => m[1]).join(' ') : body
  return source
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token && !token.includes('${') && !token.includes('{{'))
}

/** Is this character offset inside a class attribute? */
export function isInsideClassAttribute(ranges, offset) {
  return ranges.some(([from, to]) => offset >= from && offset < to)
}
