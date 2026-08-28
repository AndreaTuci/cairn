/**
 * The accessibility floor.
 *
 * These are not the whole of accessibility — they are the four failures a
 * non-specialist ships without noticing, and the four a developer inherits with
 * no way of knowing they were ever a choice. Checking them here means nobody has
 * to remember them.
 */

import { SEVERITY } from './config.mjs'

const IMAGE_PATTERN = /<img\b[^>]*>/g
const HEADING_PATTERN = /<h([1-6])\b/g
// Case-insensitive: a control built from this house's own primitives is
// `<Button>`, and a lower-case-only pattern could not see a single one of them.
const CONTROL_PATTERN = /<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/gi
const FOCUS_SUPPRESSION = /\boutline-none\b|\bfocus:outline-none\b/
// `ring-0` is not a restored focus ring, it is the same removal spelled twice.
const FOCUS_RESTORATION = /focus-visible:|focus-within:|\bring-(?!0\b)/

export function checkA11y(files) {
  return files.flatMap((file) => [
    ...missingAltText(file),
    ...unnamedControls(file),
    ...headingJumps(file),
    ...suppressedFocus(file),
  ])
}

function finding(file, line, rule, excerpt, message, fix, severity = SEVERITY.BLOCKING) {
  return file.waivedAt(line, rule) ? [] : [{ rule, severity, file: file.rel, line, excerpt, message, fix }]
}

function missingAltText(file) {
  return [...file.text.matchAll(IMAGE_PATTERN)].flatMap((match) => {
    if (/\balt\s*=/.test(match[0]) || /\bv-bind:alt|:alt\s*=/.test(match[0])) return []
    return finding(file, file.lineAt(match.index), 'a11y-alt',
      match[0].slice(0, 60),
      'An image with no alt text. A screen reader announces the file name, or nothing at all.',
      'Describe what the image conveys, or `alt=""` if it is purely decorative — but say which.')
  })
}

/**
 * A control with no text of its own. Two shapes, two different diagnoses:
 * an icon-only button has no name at all, while an image-only link borrows its
 * name from the image's alt — which is fine until the alt can be empty.
 */
function unnamedControls(file) {
  return [...file.text.matchAll(CONTROL_PATTERN)].flatMap((match) => {
    const [whole, tag, attributes, content] = match
    if (/aria-label|aria-labelledby|\btitle\s*=/.test(attributes)) return []
    const visibleText = content.replace(/<[^>]*>/g, '').replace(/\{[^}]*\}/g, '').trim()
    if (visibleText.length > 0) return []

    const image = content.match(/<img\b[^>]*>/)
    if (image) {
      // A literal, non-empty alt already names the control.
      if (/\balt\s*=\s*(["'])(?!\1)[^"']+\1/.test(image[0])) return []
      // A bound alt is the right thing to write — it just cannot be checked from
      // here, because whether it can come back empty depends on the data. Saying
      // so is worth a note; blocking correct markup is not.
      const bound = /\balt\s*=\s*\{/.test(image[0])
      return finding(file, file.lineAt(match.index), 'a11y-control-name',
        whole.slice(0, 56).replace(/\s+/g, ' '),
        bound
          ? `An image-only <${tag}> whose name comes from a bound alt. Check that the alt can never arrive empty.`
          : `An image-only <${tag}> with no alt at all. It is announced as "${tag === 'a' ? 'link' : 'button'}", and nothing more.`,
        'Either guarantee the alt, or name the control itself with `aria-label`.',
        bound ? SEVERITY.ADVISORY : SEVERITY.BLOCKING)
    }

    // A component child is not evidence of an icon: `<Card title=… />` renders a
    // heading, and treating every capitalised tag as an icon blocks the most
    // ordinary markup there is — a linked card. Only ask about actual icons.
    if (!/<svg|Icon/.test(content)) return []
    return finding(file, file.lineAt(match.index), 'a11y-control-name',
      whole.slice(0, 56).replace(/\s+/g, ' '),
      `An icon-only <${tag}> with no accessible name. A screen reader announces "${tag === 'a' ? 'link' : 'button'}", and nothing more.`,
      'Add `aria-label` describing the action - what it does, not what it looks like.')
  })
}

/**
 * Heading levels that skip a step. Only enforced on pages and layouts: a
 * component renders a fragment, and its heading level is the page's business.
 */
function headingJumps(file) {
  if (file.kind !== 'page' && file.kind !== 'layout') return []
  const headings = [...file.text.matchAll(HEADING_PATTERN)]
  const found = []
  let previous = null
  for (const match of headings) {
    const level = Number(match[1])
    if (previous !== null && level > previous + 1) {
      found.push(...finding(file, file.lineAt(match.index), 'a11y-heading-order',
        `h${previous} → h${level}`,
        'A heading level was skipped. The outline a screen reader builds has a hole in it.',
        `Use h${previous + 1}, and style it however the design needs.`))
    }
    previous = level
  }
  return found
}

/** Focus rings removed without anything put back. */
function suppressedFocus(file) {
  const found = []
  file.lines.forEach((text, index) => {
    if (!FOCUS_SUPPRESSION.test(text) || FOCUS_RESTORATION.test(text)) return
    found.push(...finding(file, index + 1, 'a11y-focus',
      text.trim().slice(0, 60),
      'The focus ring is removed with nothing in its place. Keyboard users lose their position on the page.',
      'Pair it with a `focus-visible:ring-*` treatment that fits the design.'))
  })
  return found
}
