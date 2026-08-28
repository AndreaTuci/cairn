#!/usr/bin/env node
/**
 * ui-audit - the gate between "it looks finished" and "it is finished".
 *
 * Plain Node, no dependencies, no install step: it has to run for a designer in
 * Claude, for a developer in Copilot, and in a terminal belonging to neither.
 *
 *   node ui-audit.mjs [--root design] [--all] [--json]
 *
 * Exit code 1 when anything blocking survives, so it can gate an npm script or a
 * pipeline without anyone having to read it.
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

import { resolveConfig } from './lib/config.mjs'
import { collectFiles } from './lib/scan.mjs'
import { checkTokens } from './lib/rules-tokens.mjs'
import { checkStructure } from './lib/rules-structure.mjs'
import { checkA11y } from './lib/rules-a11y.mjs'
import { render } from './lib/report.mjs'

const CONFIG_FILE = 'ui-audit.config.json'
const DEFAULT_ROOT = 'design'
const USAGE = [
  'usage: node ui-audit.mjs [options]',
  '',
  '  --root <dir>          project or workbench to audit (default: ./design, else .)',
  '  --ignore <a,b,c>      extra directory names to skip, e.g. vendored primitives',
  '  --token-file <path>   the file allowed to contain colours (default: src/styles/theme.css)',
  '  --all                 show advisory findings too, not just blocking ones',
  '  --json                machine-readable output',
].join('\n')

function parseArguments(argv) {
  const options = { root: null, json: false, showAdvisory: false, help: false, overrides: {} }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--root') { options.root = argv[i + 1]; i += 1 }
    else if (argv[i] === '--ignore') { options.overrides.extraIgnoreDirs = argv[i + 1].split(','); i += 1 }
    else if (argv[i] === '--token-file') { options.overrides.tokenFile = argv[i + 1]; i += 1 }
    else if (argv[i] === '--json') options.json = true
    else if (argv[i] === '--all') options.showAdvisory = true
    else if (argv[i] === '--help') options.help = true
  }
  return options
}

/** The workbench if there is one, the current directory otherwise. */
function locateRoot(explicit) {
  if (explicit) return resolve(explicit)
  return existsSync(resolve(DEFAULT_ROOT)) ? resolve(DEFAULT_ROOT) : resolve('.')
}

/** Config file if the project has one, then command-line flags on top of it. */
function loadConfig(root, flags) {
  const path = join(root, CONFIG_FILE)
  const fromFile = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {}
  const config = resolveConfig({ ...fromFile, ...flags })
  if (flags.extraIgnoreDirs) {
    config.ignoreDirs = [...config.ignoreDirs, ...flags.extraIgnoreDirs]
    // Kept so the report can say the scan was narrowed. A directory excluded
    // without anyone seeing it is the difference between "clean" and "not read".
    config.extraIgnoreDirs = flags.extraIgnoreDirs
  }
  return config
}

/** Astro keeps sources in `src/`, Nuxt in `app/`. Fall back to the root itself. */
function sourceRoot(root) {
  for (const candidate of ['src', 'app']) {
    if (existsSync(join(root, candidate))) return join(root, candidate)
  }
  return root
}

function main() {
  const options = parseArguments(process.argv.slice(2))
  if (options.help) {
    console.log(USAGE)
    return 0
  }

  const root = locateRoot(options.root)
  const config = loadConfig(root, options.overrides)
  const searchRoot = sourceRoot(root)
  const files = collectFiles(searchRoot, config)

  if (files.length === 0) {
    console.error(`ui-audit: no ${config.extensions.join('/')} files under ${searchRoot}`)
    return 1
  }

  const findings = [
    ...checkTokens(files, config),
    ...checkStructure(files, config),
    ...checkA11y(files),
  ].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)

  if (options.json) {
    console.log(JSON.stringify({ root: searchRoot, fileCount: files.length, findings }, null, 2))
  } else {
    console.log(render(findings, {
      root: searchRoot, showAdvisory: options.showAdvisory, files, config,
    }))
  }

  return findings.some((finding) => finding.severity === 'blocking') ? 1 : 0
}

// `process.exit()` discards stdout writes still in flight, which silently truncates
// the JSON report the moment anything pipes it. Setting the code lets Node drain.
process.exitCode = main()
