---
name: ui-kickoff
description: "Set up a project so designers and developers can share one frontend. Interviews the developer about the target stack, scaffolds the design/ workbench (Astro for sites and WordPress, Nuxt for dashboards), seeds the token file, writes UI-STACK.md and the AGENTS.md instruction trio, installs the audit scripts and confines designers to design/. Use at the start of a project, or when adding a design workbench to an existing one — run before any designer opens the repository."
license: MIT
metadata:
  author: Lotrek
  version: 1.0.0
---

# UI Kickoff

Run once, by a developer, before any designer touches the project. It ends with a workbench that
builds, a token file that already holds the project's colours, and instructions that keep every
later session — Claude's or Copilot's — on the same rails without anyone having to remember them.

The point is to eliminate the blank page. A designer given an empty folder and a capable agent
will produce something that works and nothing that composes; a designer given a project where the
tokens already exist, the primitives are already there and the inventory already lists them has no
practical way to go wrong. That is the whole strategy: guidance up front, the audit only as the
net for what escapes.

## The interview

Four questions, asked of a developer, in plain sequence. Ask them all before writing anything —
the answers decide the scaffold, and rebuilding it afterwards is wasted work.

1. **What is being built?** A content site, a dashboard or an application, or a WordPress site.
   This is the only question with real consequences; everything else follows from it.

   | Answer | Target stack | Workbench flavour | Designer writes |
   |---|---|---|---|
   | Content site | Astro + Tailwind v4 | `astro` | `.astro`, plus `.vue` for a justified island |
   | Dashboard / app | Nuxt 4 + Nuxt UI | `nuxt` | `.vue` |
   | WordPress | WordPress + Tailwind v4 | `astro` | `.astro`, ported to PHP and blocks by a developer |

   The Nuxt flavour exists for one reason: if the app will use Nuxt UI, the designer has to see
   Nuxt UI itself, or they will prototype components that do not exist. Everything else about the
   two flavours — the three commands, the token model, the rules, the audit — is identical.

2. **Is there an existing component kit to build on?** A package, a repository, or nothing. Most
   projects answer "nothing" and get fresh primitives; the field exists so that the day there is a
   shared house kit, adopting it is a one-line change rather than a migration.

3. **What is the brand starting point?** A Figma file, a palette, a pair of typefaces, a logo — or
   nothing yet. Whatever exists gets seeded into the token file now, so the first thing a designer
   sees is their own project rather than the template's placeholder indigo.

4. **Which folders belong to developers?** Usually obvious from the repository (`app/`,
   `backoffice/`, `backend/`). Needed for the permission fallback in step 7.

If the project already has an `AGENTS.md`, read it first: the answers to questions 1 and 3 are
often already written there, and asking a developer to repeat what they have documented is a good
way to make a skill unpopular.

## What it writes

```
<repo>/
├── design/                        ← the workbench, and the designer's whole world
│   ├── .ui/                       ← ui-audit.mjs, ui-inventory.mjs, ui-drift.mjs + lib/
│   ├── .claude/skills/            ← design-workflow, ui-composition, ui-sync
│   ├── UI-STACK.md                ← the contract, written once, never re-litigated
│   ├── INVENTORY.md               ← generated
│   ├── HANDOFF.md                 ← created empty; ui-sync fills it
│   ├── .promoted.json             ← promotion stamps. Committed, never gitignored
│   ├── README.md                  ← three commands, written for a human
│   ├── package.json               ← pinned versions
│   └── src/…                      ← theme.css, components/ui, layouts, pages, fixtures
├── AGENTS.md                      ← single source of agent instructions (append if it exists)
├── CLAUDE.md                      ← thin pointer to AGENTS.md
├── .github/copilot-instructions.md ← thin pointer to AGENTS.md
└── .claude/settings.json          ← permission fallback
```

Templates for everything above are in `assets/`. Copy them; do not improvise a variant.

## The sequence

Work in this order. Each step depends on the one before it.

### 1. Scaffold the workbench

Copy `assets/workbench-astro/` or `assets/workbench-nuxt/` to `design/`. Keep the pinned
dependency versions exactly as they are — they are pinned because the floating ones broke. If a
version genuinely needs moving, move it, then verify the build in step 8 and record it in
`UI-STACK.md`.

The Nuxt flavour ships an `.npmrc` with `legacy-peer-deps=true`. npm 10.x has an arborist bug that
crashes on Nuxt's peer graph; the flag walks around it and npm ≥ 11 removes the need. Leave the
file until the team is on npm 11. (House Nuxt projects use yarn, but the workbench stands alone
and one command that always works matters more here than matching the neighbours.)

### 2. Install the tooling

The audit lives in one place — the `ui-composition` skill — and gets vendored into the workbench,
because Claude and Copilot install skills to different directories and the designer has to run the
check from inside the single folder they have open.

```bash
# whichever of these exists on this machine
cp -r .claude/skills/ui-composition/scripts   design/.ui
cp -r .github/skills/ui-composition/scripts   design/.ui
```

Copy, never edit in place: `design/.ui/` is a build artifact of the skill, and a fix belongs
upstream in `ui-composition` where every project gets it.

### 3. Seed the tokens

Open the theme file — `design/src/styles/theme.css` (astro) or
`design/app/assets/css/theme.css` (nuxt) — and replace the placeholder ramps with the project's
real palette and typefaces, from the answer to question 3.

Two layers, and the discipline matters more than the values: primitives first, then semantics
pointing at them. If the brand supplies only a single accent colour, build a small ramp around it
rather than scattering one hex across five semantic names — the ramp is what makes the design
adjustable later.

The flavours differ in **who owns the middle tier**, and this is worth understanding before
editing either:

| | Primitives | Semantics | What markup uses |
|---|---|---|---|
| **astro** | our ramps in `:root` | our roles in `:root`, mapped through `@theme inline` | `bg-primary`, `text-muted-foreground` |
| **nuxt** | our ramps in `@theme static` | **Nuxt UI's** `--ui-*`, pointed at our ramps via `app.config.ts` | `bg-default`, `text-muted`, `text-highlighted` |

On the Nuxt side, do not rebuild a semantic layer next to Nuxt UI's. Set
`ui.colors.primary` in `app.config.ts` to the ramp name, and override a `--ui-*` role only where
the design genuinely differs from the default. An override with no reason behind it is drift, not
theming.

If there is no brand yet, leave the placeholders and say so in `UI-STACK.md`. A designer will
replace them in the visual-direction step, which is where that decision belongs.

### 4. Write `design/UI-STACK.md`

From `assets/UI-STACK.template.md`. This is the contract: target stack, workbench flavour,
component format, kit, token file location, budgets, and the list of waivers taken over the life
of the project. Later sessions read this file rather than asking again.

It lives inside `design/` on purpose — that is the folder a designer has open, so it has to be
reachable from there.

### 4b. Write `design/BRIEF.md`

From `assets/BRIEF.template.md`, and leave it almost empty. `UI-STACK.md` is the technical
contract; this is the product one, and it belongs to the designers: what this is, who opens it, how
it speaks, what the words are.

It exists to kill the repetition — the questions an agent would otherwise ask at the start of every
single session. **Nobody is asked to fill it in.** `design-workflow` reads it, asks once for
whatever is missing and relevant, and writes the answer back. Over three or four sessions it fills
itself.

Fill in now only what the kickoff already told you — usually the product in one sentence, and the
visual direction if question 3 had an answer. Leave the rest.

**Translate the headings into the team's working language.** This is the one file in the system a
designer is expected to read and possibly edit by hand, so it is written in the language they think
in. Everything else stays English.

### 5. Write the instruction trio

`AGENTS.md` at the repository root is the single source. `CLAUDE.md` and
`.github/copilot-instructions.md` are pointers to it, and hold no instructions of their own.

**If `AGENTS.md` already exists, append a `## Frontend and design` section to it.** Do not
overwrite it and do not create a second file — the whole value of the pattern is that there is one
place to edit.

Templates: `assets/AGENTS-section.template.md`, `assets/CLAUDE.template.md`,
`assets/copilot-instructions.template.md`.

### 6. Give both sides an entry point

**Two installations, not one.** Missing the second is a silent failure: the instruction files point
at skills that are not there, the agent follows a dead path, and it carries on without the rules
rather than stopping. It has happened once already — and it lands on the developers, who are the
ones least likely to be using the agent this was first tested on.

**The designer's side** — inside the folder they open:

```bash
mkdir -p design/.claude/skills
cp -r <skills-source>/{ui-composition,design-workflow,ui-sync} design/.claude/skills/
```

Add `frontend-design` too if the project has no visual direction yet — `design-workflow` reaches
for it once, in step 2.

Then write `design/CLAUDE.md`: short, addressed to a person rather than a machine — what this
folder is, the three commands, and the one thing to type (`/design-workflow`).

**The developers' side** — at the repository root, for whichever agents the team actually uses:

```bash
mkdir -p .claude/skills .github/skills
cp -r <skills-source>/{ui-composition,dev-workflow,ui-sync} .claude/skills/
cp -r <skills-source>/{ui-composition,dev-workflow,ui-sync} .github/skills/
```

`<skills-source>` is a checkout of the skills repository. A plain copy, deliberately: everything
here must work on a machine with nothing installed but Node.

**Give Copilot the slash commands too.** A folder of skills is not something Copilot reaches for on
its own; a prompt file is. One thin file per skill, each a pointer rather than a copy:

```markdown
---
agent: agent
description: Build production frontend from a designer's prototype.
---

Read `.github/skills/dev-workflow/SKILL.md` and follow it for this task.
```

Saved as `.github/prompts/dev-workflow.prompt.md`, that makes `/dev-workflow` real in Copilot Chat.
Do the same for `ui-composition` and `ui-sync`.

This is what gives the two roles the same shape: a designer types `/design-workflow`, a developer
types `/dev-workflow`, and neither has to hope an agent inferred the right thing from a pointer
file. `AGENTS.md` still carries the rules for every session — the slash command is how somebody
*starts* one deliberately.

### 7. Draw the boundary

Two layers, because the first one is the real mechanism and the second only catches mistakes.

**Primary: the designer opens `design/`, not the repository root.** Claude Code confines file
access to the folder it was started in, so this is enforcement rather than instruction, and it
needs no configuration at all. Say it plainly in `design/README.md` and in the onboarding note.

**Fallback: two deny lists, and they are not the same kind of thing.** Putting them in one file is
the mistake — it was made once already, and it locked a developer out of their own source code.

| What it protects | Which file | Why there |
|---|---|---|
| Installed skills and the vendored `design/.ui/` — nobody edits an installed artifact | `.claude/settings.json`, **committed** | A property of the *project*. It applies to everyone equally, developers included |
| The developers' folders — `app/`, `backend/`, `backoffice/` | `.claude/settings.local.json`, **per machine**, gitignored | A property of *who is sitting there*. A developer on the same repository must not inherit it |

Write only the first one here, from `assets/settings.template.json`:

```json
{
  "permissions": {
    "deny": [
      "Edit(./.claude/skills/**)", "Write(./.claude/skills/**)",
      "Edit(./.github/skills/**)", "Write(./.github/skills/**)",
      "Edit(./design/.ui/**)",     "Write(./design/.ui/**)"
    ]
  }
}
```

The second belongs to **designer onboarding**, on the designer's own laptop, alongside installing
Node and the skills. It cannot be scaffolded from here — this runs on a developer's machine — so
say in the handover that it is a step somebody has to do there.

Reading is left alone everywhere. A designer looking at how a developer built something is doing
the right thing; the boundary is about who changes what.

Note what the first list does *not* stop: replacing a vendored copy wholesale. Reinstalling is
correct and stays possible; editing in place is what silently reverts on the next install.

### 8. Verify, and do not skip this

The scaffold is not done until it runs. From `design/`:

```bash
npm install
npm run design:build     # must produce dist/
npm run design:check     # must come back clean
npm run design:inventory # writes INVENTORY.md
```

Both flavours have been verified end to end at the versions pinned in their `package.json`:
they install, build to static HTML, and pass the audit clean.

All three, in that order. A workbench that does not build is worse than no workbench: the first
thing the designer meets is an error they have no way to read, and the second thing they do is
give up on the whole system.

If the build fails on a dependency, pin to a combination that works and record it in
`UI-STACK.md`. That has already happened once — Astro 6.4 pulls Vite 8, which `@tailwindcss/vite`
4.3 does not yet support — and it is why the versions are pinned rather than floated.

### 9. Hand over

Report, in this shape:

```
Workbench ready at design/ — <flavour> flavour, <stack>.
Tokens seeded from <source> · <n> primitives · build clean · audit clean.

For the designer:
  open the `design/` folder in Claude, then type /design-workflow

Still open:
  - <anything question 3 left undecided>
```

## What this skill does not do

- **It does not design anything.** The template's demo screen exists to show the conventions and
  is deleted at the first real screen.
- **It does not touch developer folders**, beyond the pointer files and the settings file.
- **It does not run twice.** Adding a workbench to a project that has one means editing
  `UI-STACK.md`, not re-scaffolding over the top of somebody's work.

## When the project already exists

Common case, and only steps 1, 2 and 4–8 change:

- The token file probably already exists somewhere in the production code. **Point the workbench
  at the same values** rather than starting a second palette — two token files is the exact
  failure this system exists to prevent. Copy them across and note in `UI-STACK.md` which one is
  the source.
- Run the audit against the production folders before anything else and put the result in
  `UI-STACK.md` as a baseline. It is not a judgement; it is the number the team can watch move.
- Existing components stay where they are. The workbench is for what comes next, and pulling old
  components into it is a migration nobody asked for.
