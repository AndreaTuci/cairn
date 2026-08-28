# cairn

**Agent skills that let designers prototype production frontend and developers build straight from
it — one composition law, one workbench, one blocking audit.**

```bash
npx @andreatuci/cairn install
```

Run once, inside the project you are setting up. **Not `npm i`** — cairn is a scaffolder rather
than a dependency, and nothing of it stays in your `package.json`.
[Read the guide](https://andreatuci.github.io/cairn).

A cairn is a stack of stones on a ridge: someone walked ahead, learned the route, and left marks so
whoever comes next can find it without a guide present. That is what these five skills are.

## The problem

Designers are starting to produce frontend code, and that code becomes the developers' starting
point — and the context their agents read. If it is disordered, the disorder is paid for twice.

A UI codebase does not fail loudly. It fails by accumulation. Measured on one real project of ours,
written by good developers with no designer involved:

| | |
|---|---|
| `text-[13px]` typed by hand | **27 times** |
| `rounded-[8px]`, while a `--radius-lg` token sat unused | **14 times** |
| One shadow spelled out in full | **12 times** |
| Two authentication forms, structurally identical | **85%** |
| Components imported by nobody at all | **2** |

None of that is incompetence. It is the absence of a rule.

## What is here

| Skill | Who reads it | When |
|---|---|---|
| `ui-kickoff` | developer | once, when the project starts |
| `ui-composition` | **both** | every time any UI is written or reviewed |
| `design-workflow` | designer | every design session |
| `dev-workflow` | developer | implementing UI a designer prototyped |
| `ui-sync` | **both** | designer writes the handoff; developer promotes and re-syncs |

Plus two workbench templates (Astro and Nuxt, both verified end to end) and three Node scripts with
no dependencies: `ui-audit` (the gate), `ui-inventory` (what already exists), `ui-drift` (what the
designer changed since you last took it).

Read [TEAM.md](TEAM.md) for how the two roles actually work together.

## Install

`npx @andreatuci/cairn install` puts the skill folders where the agents look —
`.claude/skills/` for Claude, `.github/skills/` for Copilot, plus the slash commands in
`.github/prompts/` — and does nothing else.

From a checkout, that is a plain copy and you can do it by hand:

```bash
mkdir -p .claude/skills .github/skills
cp -r /path/to/cairn/skills/* .claude/skills/
cp -r /path/to/cairn/skills/* .github/skills/
```

Then, in the project:

```
/ui-kickoff
```

Five questions, and it scaffolds `design/`, seeds the token file, writes `AGENTS.md` with pointers
for Claude and Copilot, installs the audit and verifies that the whole thing builds.

## Requirements

**Node ≥ 22.19**, and nothing else. The workbench runs on its own — no backend, no database, no
docker — because a designer has to be able to open one folder and see their work in a browser.

That is the one genuinely technical prerequisite, and it should not be the designer's problem: a
developer sets it up once, on the machine, along with the skills.

## The rules, in four lines

- Every colour, size, radius and shadow comes from the token file. There is one per project.
- A value used twice is a token. A shape used twice is a component.
- Every screen answers for its ready, empty, loading and error states.
- The audit is blocking. A waiver needs a reason written on the line above it.

```
  arbitrary-scale - 135 in 43 places
  An arbitrary value on a scale property. It is a scale step nobody declared.
   27 x  text-[13px]        components/AppSidebarItem.astro:34 +26
   14 x  rounded-[8px]      components/AppSidebarItem.astro:34 +13
  -> Add it to the theme scale, then use the named step.
```

135 findings are 43 decisions. The report groups them on purpose: a long list gets ignored, forty
choices get made in an afternoon.

## The guide

**[andreatuci.github.io/cairn](https://andreatuci.github.io/cairn)** — four pages: what cairn is,
every step of using it, the reference, and how the guide itself is composed.

It is built with cairn, which is also how cairn gets tested: the audit that gates your project
gates that one, and the deployment runs it before publishing. A guide that argues for a blocking
gate and then ships past its own would be an argument nobody has to take seriously.

The source lives in `design/` **in the repository, not in this package**. It is a product of the
tool rather than part of it, and shipping it would put a second `src/components/` inside your
`node_modules` for an agent to find and mistake for yours.

```bash
git clone https://github.com/AndreaTuci/cairn && cd cairn/design
npm install && npm run design
```

## License

MIT.
