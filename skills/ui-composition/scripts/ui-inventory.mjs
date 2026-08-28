#!/usr/bin/env node
/**
 * ui-inventory - regenerate INVENTORY.md from the components that actually exist.
 *
 * The inventory is the first thing to read before building anything, because the
 * cheapest component is the one already there. It is generated rather than
 * written, for the obvious reason: a hand-kept list of components is a list that
 * is wrong within a fortnight, and a wrong inventory is worse than none - it
 * teaches people to stop trusting it and start duplicating again.
 *
 *   node ui-inventory.mjs [--root design] [--write]
 *
 * Without --write it prints to stdout, so it can be reviewed before it lands.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, join, dirname, relative, sep } from 'node:path'

import { resolveConfig } from './lib/config.mjs'
import { collectFiles } from './lib/scan.mjs'

const OUTPUT_FILE = 'INVENTORY.md'
const DATA_FILE = 'INVENTORY.json'
const DEFAULT_ROOT = 'design'
const PROPS_BLOCK = /(?:interface\s+Props\s*\{|defineProps<\s*\{)([\s\S]*?)\n\s*\}/
const PROP_LINE = /^\s*(\w+)(\?)?\s*:\s*(.+?);?\s*$/
const VARIANT_MAP = /\bvariants\s*:\s*\{/

function parseArguments(argv) {
  const options = { root: null, write: false }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--root') { options.root = argv[i + 1]; i += 1 }
    else if (argv[i] === '--write') options.write = true
  }
  return options
}

/** The props a component accepts, and which of them are variant axes. */
function readProps(file) {
  const block = file.text.match(PROPS_BLOCK)
  if (!block) return []
  return block[1]
    .split('\n')
    .map((line) => line.match(PROP_LINE))
    .filter(Boolean)
    .filter(([, name]) => name !== 'class')
    .map(([, name, optional, type]) => {
      const union = type.match(/'[^']+'(?:\s*\|\s*'[^']+')+/)
      return {
        name,
        optional: Boolean(optional),
        type: type.trim(),
        options: union ? union[0].split('|').map((value) => value.trim().replace(/'/g, '')) : null,
      }
    })
}

/**
 * Variant axes declared in a `cva`/variant map. Union types in `interface Props`
 * cover one house idiom; this covers the other, which is what shadcn-vue and the
 * workbench primitives both use.
 */
function readVariantMap(file) {
  const source = variantSource(file)
  const start = source.match(VARIANT_MAP)
  if (!start) return []
  const block = balancedBlock(source, start.index + start[0].length - 1)
  if (!block) return []

  const axes = []
  const axisPattern = /(\w+)\s*:\s*\{/g
  for (const axis of block.matchAll(axisPattern)) {
    const inner = balancedBlock(block, axis.index + axis[0].length - 1)
    if (!inner) continue
    const options = [...inner.matchAll(/(?:^|[{,])\s*['"]?([\w-]+)['"]?\s*:/g)].map((m) => m[1])
    if (options.length > 0) axes.push({ name: axis[1], options })
  }
  return axes
}

/**
 * Where the variant map lives. In the workbench it is in the component itself;
 * shadcn-vue keeps it in a sibling `index.ts`, which is the house's other idiom.
 */
function variantSource(file) {
  if (VARIANT_MAP.test(file.text)) return file.text
  for (const sibling of ['index.ts', 'index.js']) {
    const path = join(dirname(file.abs), sibling)
    if (existsSync(path)) return readFileSync(path, 'utf8')
  }
  return file.text
}

/** The text between a `{` at `open` and its matching `}`. */
function balancedBlock(text, open) {
  let depth = 0
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1
    else if (text[i] === '}' && --depth === 0) return text.slice(open + 1, i)
  }
  return null
}

function componentName(rel) {
  return rel.split('/').at(-1).replace(/\.\w+$/, '')
}

function countUses(name, files, ownRel) {
  const pattern = new RegExp(`<${name}[\\s/>]`, 'g')
  return files
    .filter((file) => file.rel !== ownRel)
    .reduce((total, file) => total + [...file.text.matchAll(pattern)].length, 0)
}

function describe(component, files) {
  const name = componentName(component.rel)
  const props = readProps(component)
  const fromProps = props.filter((prop) => prop.options).map((prop) => ({ name: prop.name, options: prop.options }))
  const variants = fromProps.length > 0 ? fromProps : readVariantMap(component)
  return {
    name,
    path: component.rel,
    lines: component.lineCount,
    uses: countUses(name, files, component.rel),
    props: props.map((prop) => `${prop.name}${prop.optional ? '?' : ''}`),
    variants: variants.map((axis) => `${axis.name}: ${axis.options.join(' · ')}`),
  }
}

function renderSection(title, entries, note, linkPrefix) {
  if (entries.length === 0) return []
  const lines = [`## ${title}`, '', note, '', '| Component | Variants | Props | Used | Lines |', '|---|---|---|---|---|']
  for (const entry of entries) {
    lines.push(
      `| [\`${entry.name}\`](${linkPrefix}${entry.path}) | ${entry.variants.join('<br>') || '—'} ` +
      `| ${entry.props.join(', ') || '—'} | ${entry.uses} | ${entry.lines} |`,
    )
  }
  return [...lines, '']
}

function render(components, linkPrefix) {
  const primitives = components.filter((entry) => entry.path.includes('/ui/'))
  const composed = components.filter((entry) => !entry.path.includes('/ui/'))

  return [
    '# Inventory',
    '',
    '> Generated by `ui-inventory.mjs`. Do not edit by hand — regenerate it.',
    '',
    'Read this before building anything. If what you need is here, use it. If it is',
    'nearly here, add a variant to it. Only what is genuinely absent gets a new file.',
    '',
    ...renderSection('Primitives', primitives, 'The building blocks. Everything else is made of these.', linkPrefix),
    ...renderSection('Components', composed, 'Built from the primitives, for this project.', linkPrefix),
    `_${components.length} components — ${components.filter((entry) => entry.uses === 0).length} currently unused._`,
    '',
  ].join('\n')
}

/**
 * The same inventory, machine-readable, for a project that wants to render its
 * own components on a page or count them somewhere.
 *
 * Deliberately generic: this file ships to every project, so it knows nothing
 * about any of them. A project derives what it needs from this; the moment the
 * tool starts looking for a component by name, it has learned something about
 * one codebase and it is wrong everywhere else.
 *
 * No timestamp, so regenerating an unchanged project produces an unchanged file
 * rather than a diff nobody asked for.
 */
function renderData(components) {
  return `${JSON.stringify({ components }, null, 2)}\n`
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
  const root = options.root ? resolve(options.root) : (existsSync(resolve(DEFAULT_ROOT)) ? resolve(DEFAULT_ROOT) : resolve('.'))
  const config = resolveConfig({})
  const searchRoot = sourceRoot(root)
  const files = collectFiles(searchRoot, config)

  const components = files
    .filter((file) => file.kind === 'component')
    .map((file) => describe(file, files))
    .sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name))

  // Paths are relative to the source root; the file is written at the workbench
  // root one level up. Without the prefix every link in the generated inventory
  // is broken, in the one document the rules tell everybody to open first.
  const linkPrefix = searchRoot === root ? '' : `${relative(root, searchRoot).split(sep).join('/')}/`

  const markdown = render(components, linkPrefix)
  if (options.write) {
    const target = join(root, OUTPUT_FILE)
    const dataTarget = join(root, DATA_FILE)
    writeFileSync(target, markdown)
    writeFileSync(dataTarget, renderData(components))
    console.log(`ui-inventory: wrote ${components.length} components to ${target} and ${dataTarget}`)
  } else {
    console.log(markdown)
  }
  return 0
}

process.exitCode = main()
