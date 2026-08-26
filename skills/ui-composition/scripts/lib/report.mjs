/**
 * The report.
 *
 * A gate that prints 151 lines gets skimmed and then ignored. Findings are
 * therefore grouped by rule and then by the offending value, because 151
 * findings are really 46 undeclared tokens, and 46 decisions is an afternoon's
 * work while 151 lines is a wall. Every group ends with the fix, phrased as
 * something to do rather than something to feel bad about.
 */

import { SEVERITY } from './config.mjs'

const ESC = String.fromCharCode(27)
const COLOR = process.stdout.isTTY && !process.env.NO_COLOR
const paint = (code, text) => (COLOR ? `${ESC}[${code}m${text}${ESC}[0m` : text)
const bold = (text) => paint('1', text)
const dim = (text) => paint('2', text)
const red = (text) => paint('31', text)
const yellow = (text) => paint('33', text)
const green = (text) => paint('32', text)

const MAX_VALUES_SHOWN = 8

export function render(findings, { root, showAdvisory }) {
  const blocking = findings.filter((finding) => finding.severity === SEVERITY.BLOCKING)
  const advisory = findings.filter((finding) => finding.severity === SEVERITY.ADVISORY)

  const lines = [`${bold('ui-audit')} ${dim(`- ${root}`)}`, '']

  if (blocking.length > 0) {
    lines.push(red(bold(`BLOCKING - ${blocking.length}`)), '')
    lines.push(...groupsFor(blocking))
  }

  if (advisory.length > 0 && showAdvisory) {
    lines.push(yellow(bold(`ADVISORY - ${advisory.length}`)), '')
    lines.push(...groupsFor(advisory))
  }

  lines.push(summary(blocking, advisory, showAdvisory))
  return lines.join('\n')
}

function groupsFor(findings) {
  const byRule = new Map()
  for (const finding of findings) {
    if (!byRule.has(finding.rule)) byRule.set(finding.rule, [])
    byRule.get(finding.rule).push(finding)
  }
  return [...byRule.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .flatMap(([rule, group]) => renderRule(rule, group))
}

function renderRule(rule, group) {
  const byValue = new Map()
  for (const finding of group) {
    if (!byValue.has(finding.excerpt)) byValue.set(finding.excerpt, [])
    byValue.get(finding.excerpt).push(finding)
  }
  const values = [...byValue.entries()].sort((a, b) => b[1].length - a[1].length)
  const places = `${values.length} place${values.length === 1 ? '' : 's'}`

  const lines = [
    `  ${bold(rule)} ${dim(`- ${group.length} in ${places}`)}`,
    `  ${dim(group[0].message)}`,
  ]

  for (const [value, occurrences] of values.slice(0, MAX_VALUES_SHOWN)) {
    const first = occurrences[0]
    const count = occurrences.length > 1 ? `${String(occurrences.length).padStart(3)} x  ` : '      '
    const extra = occurrences.length > 1 ? dim(` +${occurrences.length - 1}`) : ''
    lines.push(`  ${dim(count)}${value.padEnd(44).slice(0, 44)}  ${dim(`${first.file}:${first.line}`)}${extra}`)
  }
  if (values.length > MAX_VALUES_SHOWN) {
    lines.push(dim(`        ... and ${values.length - MAX_VALUES_SHOWN} more`))
  }

  lines.push(`  ${green('->')} ${group[0].fix}`, '')
  return lines
}

function summary(blocking, advisory, showAdvisory) {
  if (blocking.length === 0 && advisory.length === 0) {
    return green(bold('OK - clean. Nothing to fix.'))
  }
  if (blocking.length === 0) {
    return [
      green(bold('OK - no blocking findings.')),
      dim(`   ${advisory.length} advisory: worth a look, not a stop.`),
    ].join('\n')
  }
  const hidden = showAdvisory ? '' : dim(`  (${advisory.length} advisory hidden - pass --all)`)
  return [
    red(bold(`STOP - ${blocking.length} blocking.`)) + hidden,
    dim('   Fix them, or take a waiver you are willing to sign:'),
    dim('   <!-- ui-audit-allow: <rule> - <why this one is genuinely different> -->'),
  ].join('\n')
}
