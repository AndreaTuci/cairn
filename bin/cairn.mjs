#!/usr/bin/env node
/**
 * cairn install - put the skills where the agents look for them.
 *
 * That is the whole of it. There is no build step, no config, and nothing to
 * uninstall: the skills are folders of markdown and three Node scripts with no
 * dependencies, and installing them is a copy. Reinstalling is how you take an
 * upstream fix, so this deliberately overwrites rather than refusing.
 *
 * What it does not do is set a project up. That is `/ui-kickoff`, in the chat
 * with the agent, and it is a separate step because a terminal command cannot ask
 * you the five questions the scaffold depends on.
 */

import { cpSync, mkdirSync, existsSync, readdirSync, readFileSync, renameSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CARRIED, templateDirs } from './npm-safe-dotfiles.mjs'

const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILLS = ['ui-kickoff', 'ui-composition', 'design-workflow', 'dev-workflow', 'ui-sync']

/** Where each agent looks. Copilot also wants one prompt file per skill it uses. */
const TARGETS = {
  claude: { skills: '.claude/skills', prompts: null },
  copilot: { skills: '.github/skills', prompts: '.github/prompts' },
}

const USAGE = [
  'usage: npx @andreatuci/cairn install [options]',
  '',
  '  --claude            install for Claude only  (.claude/skills/)',
  '  --copilot           install for Copilot only (.github/skills/ and .github/prompts/)',
  '  --dir <path>        the project to install into (default: the current directory)',
  '  --help              this',
  '  --version           the installed version of cairn',
  '',
  'With neither --claude nor --copilot, it installs for both.',
].join('\n')

function parseArguments(argv) {
  const options = { command: null, dir: '.', claude: false, copilot: false, help: false, version: false }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--dir') { options.dir = argv[i + 1]; i += 1 }
    else if (argv[i] === '--claude') options.claude = true
    else if (argv[i] === '--copilot') options.copilot = true
    else if (argv[i] === '--help' || argv[i] === '-h') options.help = true
    else if (argv[i] === '--version' || argv[i] === '-v') options.version = true
    else if (!argv[i].startsWith('-')) options.command = argv[i]
  }
  return options
}

function version() {
  return JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8')).version
}

/** Copy the five skill folders into one agent's directory. */
function installSkills(projectRoot, relativeTarget) {
  const target = join(projectRoot, relativeTarget)
  mkdirSync(target, { recursive: true })
  for (const skill of SKILLS) {
    cpSync(join(PACKAGE_ROOT, 'skills', skill), join(target, skill), { recursive: true })
  }
  restoreDottedFiles(join(target, 'ui-kickoff', 'assets'))
  return `${relativeTarget}/  - ${SKILLS.length} skills`
}

/**
 * The slash commands, which are what make a skill something a developer *starts*
 * rather than something an agent might notice. A folder of skills is not a thing
 * Copilot reaches for on its own; a prompt file is.
 */
function installPrompts(projectRoot, relativeTarget) {
  const source = join(PACKAGE_ROOT, 'assets', 'prompts')
  const target = join(projectRoot, relativeTarget)
  mkdirSync(target, { recursive: true })
  const files = readdirSync(source).filter((name) => name.endsWith('.prompt.md'))
  for (const file of files) cpSync(join(source, file), join(target, file))
  return `${relativeTarget}/  - ${files.length} slash commands`
}

/**
 * Refresh the audit a workbench already has.
 *
 * `design/.ui/` is a copy of this package's `ui-composition/scripts`, made once at
 * kickoff. Nothing refreshed it afterwards, so a project that scaffolded in March
 * ran March's rules for ever while the installed skills said otherwise — and the
 * first project to use these skills outside this repository hit exactly that: a
 * rule was added upstream and there was no documented way for it to arrive.
 *
 * Reinstalling is the gesture people already reach for, so it is the one that
 * does this. Only when the folder is there: this never creates a workbench.
 */
function refreshVendoredAudit(projectRoot) {
  const target = join(projectRoot, 'design', '.ui')
  if (!existsSync(target)) return null
  cpSync(join(PACKAGE_ROOT, 'skills', 'ui-composition', 'scripts'), target, { recursive: true })
  return 'design/.ui/       - the audit, refreshed to this version'
}

/**
 * npm strips `.gitignore` and `.npmrc` from every tarball, and both are
 * load-bearing in the workbench templates. They travel under un-dotted names and
 * get their dot back here, once, on the way in — before `ui-kickoff` ever copies
 * a template, so its step 1 does not have to know any of this happened.
 */
function restoreDottedFiles(installedAssetsDir) {
  const restored = []
  for (const dir of templateDirs(installedAssetsDir)) {
    for (const [dotted, carried] of Object.entries(CARRIED)) {
      if (!existsSync(join(dir, carried)) || existsSync(join(dir, dotted))) continue
      renameSync(join(dir, carried), join(dir, dotted))
      restored.push(dotted)
    }
  }
  return restored
}

function main() {
  const options = parseArguments(process.argv.slice(2))

  if (options.version) { console.log(version()); return 0 }
  if (options.help || options.command !== 'install') { console.log(USAGE); return options.help ? 0 : 1 }

  const projectRoot = resolve(options.dir)
  if (!existsSync(projectRoot)) {
    console.error(`cairn: no such directory: ${projectRoot}`)
    return 1
  }

  // Neither flag means both: the common case is a team where one person uses
  // Claude and another uses Copilot, and installing for one of them silently is
  // how the other finds a pointer to skills that are not there.
  const forClaude = options.claude || !options.copilot
  const forCopilot = options.copilot || !options.claude

  const written = []
  if (forClaude) written.push(installSkills(projectRoot, TARGETS.claude.skills))
  if (forCopilot) {
    written.push(installSkills(projectRoot, TARGETS.copilot.skills))
    written.push(installPrompts(projectRoot, TARGETS.copilot.prompts))
  }
  const refreshed = refreshVendoredAudit(projectRoot)
  if (refreshed) written.push(refreshed)

  console.log(`cairn ${version()} installed into ${projectRoot}`)
  for (const line of written) console.log(`  ${line}`)
  console.log('')
  console.log('Next, in the chat with your agent:')
  console.log('')
  console.log('  /ui-kickoff')
  console.log('')
  console.log('Five questions, and it scaffolds design/, seeds the token file, writes the')
  console.log('instruction files, installs the audit and verifies that the whole thing builds.')
  return 0
}

process.exitCode = main()
