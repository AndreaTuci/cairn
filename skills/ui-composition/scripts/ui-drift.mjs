#!/usr/bin/env node
/**
 * ui-drift - what has the designer changed since I last promoted it?
 *
 * The workbench is permanent, not a phase: designers keep correcting it while
 * development runs. So the production code is a copy that drifts from a source
 * that keeps moving, and the expensive part of rework is not doing it - it is
 * working out what needs doing. A developer should start from a list of three
 * files, not from a hunch about a folder.
 *
 * Each promotion stamps a content hash into `.promoted.json`. This compares the
 * current content against those stamps and reports which files moved. It does not
 * report *how* they moved: that is `git diff`'s job, and reimplementing it here
 * would be a worse version of a tool the developer already has.
 *
 *   node ui-drift.mjs --root design
 *   node ui-drift.mjs --root design --record src/components/ArticleCard.astro --to app/src/components/astro/ArticleCard.astro
 *   node ui-drift.mjs --root design --record-all
 */

import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

import { resolveConfig } from './lib/config.mjs'
import { collectFiles } from './lib/scan.mjs'

const STATE_FILE = '.promoted.json'
const DEFAULT_ROOT = 'design'
/** Drift covers more than the audit does: a token change is the highest-impact drift there is. */
const TRACKED_EXTENSIONS = ['.astro', '.vue', '.html', '.css', '.ts']
const HASH_LENGTH = 12

const USAGE = [
  'usage: node ui-drift.mjs [options]',
  '',
  '  --root <dir>        the workbench (default: ./design)',
  '  --record <path>     stamp one file as promoted, at its current content',
  '  --to <path>         where it was promoted to, recorded alongside',
  '  --note <text>       why, when the decision was anything other than a plain promotion',
  '  --record-all        stamp every tracked file as promoted (requires --note)',
  '  --json              machine-readable output',
].join('\n')

function parseArguments(argv) {
  const options = { root: null, record: [], to: null, note: null, recordAll: false, json: false, help: false }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--root') { options.root = argv[i + 1]; i += 1 }
    else if (argv[i] === '--record') { options.record.push(argv[i + 1]); i += 1 }
    else if (argv[i] === '--to') { options.to = argv[i + 1]; i += 1 }
    else if (argv[i] === '--note') { options.note = argv[i + 1]; i += 1 }
    else if (argv[i] === '--record-all') options.recordAll = true
    else if (argv[i] === '--json') options.json = true
    else if (argv[i] === '--help') options.help = true
  }
  return options
}

/** Line endings normalised, so a checkout on another machine is not "drift". */
function fingerprint(text) {
  return createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex').slice(0, HASH_LENGTH)
}

function loadState(root) {
  const path = join(root, STATE_FILE)
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : { promoted: {} }
}

function saveState(root, state) {
  writeFileSync(join(root, STATE_FILE), `${JSON.stringify(state, null, 2)}\n`)
}

function sourceRoot(root) {
  for (const candidate of ['src', 'app']) {
    if (existsSync(join(root, candidate))) return join(root, candidate)
  }
  return root
}

function currentFiles(root) {
  const config = resolveConfig({ extensions: TRACKED_EXTENSIONS })
  const prefix = sourceRoot(root) === root ? '' : `${sourceRoot(root).split('/').at(-1)}/`
  return new Map(collectFiles(sourceRoot(root), config).map((file) => [
    `${prefix}${file.rel}`,
    fingerprint(file.text),
  ]))
}

/** Three lists, and the one everybody forgets: promoted, then deleted. */
function compare(current, promoted) {
  const changed = []
  const unchanged = []
  const added = []
  const removed = []

  for (const [path, hash] of current) {
    const record = promoted[path]
    if (!record) added.push({ path })
    else if (record.hash !== hash) changed.push({ path, ...record })
    else unchanged.push({ path, ...record })
  }
  for (const [path, record] of Object.entries(promoted)) {
    if (!current.has(path)) removed.push({ path, ...record })
  }
  return { changed, added, removed, unchanged }
}

function render({ changed, added, removed, unchanged }, root) {
  const lines = [`ui-drift - ${root}`, '']

  if (changed.length === 0 && added.length === 0 && removed.length === 0) {
    lines.push(`In sync. ${unchanged.length} file${unchanged.length === 1 ? '' : 's'} promoted and unchanged.`)
    return lines.join('\n')
  }

  const section = (title, entries, note, detail) => {
    if (entries.length === 0) return
    lines.push(`${title} - ${entries.length}`, `  ${note}`, '')
    for (const entry of entries) lines.push(`   ${entry.path.padEnd(52).slice(0, 52)}  ${detail(entry)}`)
    lines.push('')
  }

  section('CHANGED SINCE PROMOTION', changed,
    'The designer moved these after you took them. Rework starts here.',
    (entry) => `promoted ${entry.at}${entry.to ? ` -> ${entry.to}` : ''}${entry.note ? ` (${entry.note})` : ''}`)

  section('NEW SINCE PROMOTION', added,
    'Never promoted. Either they are still being designed, or they were missed.',
    () => '')

  section('PROMOTED, NOW GONE', removed,
    'The designer deleted the source. The production copy is now an orphan.',
    (entry) => `was ${entry.to ?? 'unrecorded'}`)

  lines.push(
    `${unchanged.length} unchanged.`,
    '',
    'For what changed inside a file, use git - this tells you which files, not which lines.',
    '',
    'Once a developer has dealt with these, stamp them, or the next report repeats',
    'itself until nobody reads it. Ready to paste:',
    '',
    ...recordCommand([...changed, ...added].map((entry) => entry.path), root),
  )
  return lines.join('\n')
}

/**
 * The command, already filled in - not a template to complete.
 *
 * A report ending in `<path>` and `<production path>` asks its reader to recall a
 * syntax they use once a fortnight, which is how stamping quietly stops happening
 * and the whole report turns to noise. So the paths are already in it.
 *
 * One complete command per file, however many there are. It used to collapse into
 * a single `--record-all` past five files: a button that certifies every file as
 * dealt with without anyone opening one, offered by the tool itself at exactly the
 * moment the list is long enough to feel tedious. That is how this repository's own
 * state file came to hold thirty-one promotions that never happened, all carrying
 * the same note. A long list is the honest output - it says there are thirty-one
 * decisions, because there are.
 */
function recordCommand(paths, root) {
  const workbench = root.split('/').at(-1)
  const script = `node ${workbench}/.ui/ui-drift.mjs --root ${workbench}`

  return [
    // `--to` is a single path and cannot be right for two files at once, so it is
    // never printed once above many: every line here runs on its own.
    ...paths.map((path) => `  ${script} --record ${path} --to <where it landed>`),
    '',
    '  Drop --to when there is no production copy yet. Add --note when the answer',
    '  was "we are not taking this" - a record without its reason is a small lie.',
  ]
}

function record(root, state, paths, { to, note }, current) {
  const stamped = []
  const cleared = []
  const missing = []
  const at = new Date().toISOString().slice(0, 10)

  for (const path of paths) {
    const hash = current.get(path)
    if (!hash) {
      // The designer deleted a file after it was promoted. `--record` means "I
      // have looked at this and dealt with it", and that has to cover the fourth
      // list too: without this branch a PROMOTED, NOW GONE row could be cleared
      // by no command the tool offers, and stayed in the report for good.
      if (state.promoted[path]) { delete state.promoted[path]; cleared.push(path); continue }
      missing.push(path)
      continue
    }
    // Merged, not replaced: a re-record without --to used to erase where the file
    // had landed, which is the one fact the stamp exists to carry.
    state.promoted[path] = {
      ...state.promoted[path], hash, at,
      ...(to ? { to } : {}), ...(note ? { note } : {}),
    }
    stamped.push(path)
  }

  saveState(root, state)
  return { stamped, cleared, missing }
}

function main() {
  const options = parseArguments(process.argv.slice(2))
  if (options.help) {
    console.log(USAGE)
    return 0
  }

  const root = options.root ? resolve(options.root) : resolve(DEFAULT_ROOT)
  if (!existsSync(root)) {
    console.error(`ui-drift: no workbench at ${root}`)
    return 1
  }

  const current = currentFiles(root)
  const state = loadState(root)

  if (options.recordAll || options.record.length > 0) {
    // Stamping every file at once says "all of these are dealt with" about files
    // nobody opened. It stays available for the one case where that is true - a
    // whole workbench promoted in a single pass - and it costs a sentence saying
    // which case that was.
    if (options.recordAll && !options.note) {
      console.error('ui-drift: --record-all needs --note "<what happened to all of these>".')
      console.error('  Without it the stamp certifies every file as dealt with and says nothing.')
      return 1
    }
    const paths = options.recordAll ? [...current.keys()] : options.record
    const { stamped, cleared, missing } = record(root, state, paths, options, current)
    console.log(`ui-drift: recorded ${stamped.length} file${stamped.length === 1 ? '' : 's'} as promoted.`)
    if (cleared.length > 0) {
      console.log(`ui-drift: cleared ${cleared.length} stamp${cleared.length === 1 ? '' : 's'} for files no longer in the workbench.`)
    }
    for (const path of missing) console.error(`  not found in the workbench, and never promoted: ${path}`)
    return missing.length > 0 ? 1 : 0
  }

  const result = compare(current, state.promoted)
  if (options.json) {
    console.log(JSON.stringify({ root, ...result }, null, 2))
  } else {
    console.log(render(result, root))
  }
  return 0
}

process.exitCode = main()
