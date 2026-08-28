#!/usr/bin/env node
/**
 * The two dotfiles npm refuses to ship, carried across anyway.
 *
 * npm strips `.gitignore` and `.npmrc` from every tarball — the first because it
 * rewrites it as `.npmignore`, the second because it can hold an auth token. Both
 * are load-bearing in the workbench templates: without `.gitignore` a client
 * project commits `node_modules`, and without `.npmrc` the Nuxt flavour crashes
 * on `npm install` under npm 10.x, which is the bug that file exists to walk
 * around.
 *
 * So `prepack` leaves an un-dotted copy beside each one, npm ships that, and the
 * installer puts the dot back. `postpack` removes the copies again, so the git
 * tree never holds two versions of one file.
 *
 *   node bin/npm-safe-dotfiles.mjs stage    # before packing
 *   node bin/npm-safe-dotfiles.mjs clean    # after packing
 */

import { copyFileSync, existsSync, rmSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TEMPLATES = ['workbench-astro', 'workbench-nuxt']
/** dotted name -> the name npm will actually carry. */
export const CARRIED = { '.gitignore': 'gitignore', '.npmrc': 'npmrc' }

/**
 * The workbench template folders inside a given `ui-kickoff/assets` directory.
 *
 * The argument is the assets folder itself rather than a package root, because the
 * two callers see different shapes: in the package the path is
 * `skills/ui-kickoff/assets/`, and once installed the `skills/` level is gone.
 */
export function templateDirs(assetsDir) {
  return TEMPLATES.map((name) => join(assetsDir, name))
}

/** Where the templates live inside this package. */
export const ASSETS_DIR = join(PACKAGE_ROOT, 'skills', 'ui-kickoff', 'assets')

function stage() {
  for (const dir of templateDirs(ASSETS_DIR)) {
    for (const [dotted, carried] of Object.entries(CARRIED)) {
      if (existsSync(join(dir, dotted))) copyFileSync(join(dir, dotted), join(dir, carried))
    }
  }
}

function clean() {
  for (const dir of templateDirs(ASSETS_DIR)) {
    for (const carried of Object.values(CARRIED)) {
      rmSync(join(dir, carried), { force: true })
    }
  }
}

// Only when run directly. `cairn.mjs` imports this file for `CARRIED` and
// `templateDirs`, and a module that reads argv on import runs somebody else's
// command line as if it were its own.
const runDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (runDirectly) {
  const command = process.argv[2]
  if (command === 'stage') stage()
  else if (command === 'clean') clean()
  else {
    console.error(`npm-safe-dotfiles: expected "stage" or "clean", got ${command ?? 'nothing'}`)
    process.exitCode = 1
  }
}
