---
name: ui-composition
description: "House law for composing frontend UI: semantic tokens instead of raw values, one component per shape, variants instead of copies, every screen answering for its empty/loading/error states, and a blocking audit that proves it. Use whenever writing, reviewing or extending any UI — a component, a screen, a style, a colour — in Astro, Vue/Nuxt or WordPress, whether prototyping a design or building production code. Read this before creating any component or writing any class."
license: MIT
metadata:
  author: Andrea Tuci
  version: 1.0.0
---

# UI Composition

The one law for **how frontend UI is put together** here. It is read identically by a designer
prototyping a screen and by a developer building the production version, because they are
building the same thing and there is no reason for them to obey different rules.

It owns composition only. *What* to build comes from the brief; the *process* comes from
`design-workflow`, or from whatever process skill your setup has for a multi-session feature.
General code style — small files, descriptive names, named constants, no dead code, errors never
swallowed — comes from your house standards where they exist; none of it is restated here, and
none of it is a dependency of this file. This one answers a single question: given that you are
about to write UI, what may you write?

## The shape of the problem

A UI codebase does not fail loudly. It fails by accumulation — a hand-typed `13px` here, a
component copied and lightly edited there, a colour that seemed easier to paste than to name.
Every one of them is defensible on its own. Together they produce a project where nothing can be
changed in one place, and where the next person — human or agent — has no way to tell the
pattern from the exception.

Measured on a real project of ours, that accumulation looked like this: `text-[13px]` typed by
hand **27 times**, `rounded-[8px]` **14 times** while a `--radius-lg` token sat unused, a shadow
spelled out **12 times**, two authentication forms **85% structurally identical**, and two
components imported by nobody at all. Nothing there was incompetence. It was the absence of a
rule.

So the rules below are few, and each one closes off an entire category rather than a symptom.

## Before you write anything

Three steps, in this order, every time. They take a minute and they are what the rest of this
file depends on.

1. **Read `INVENTORY.md`.** It lists every component that exists, with its variants and how often
   it is used. `npm run design:check` regenerates it before it audits, so it is never out of date
   as long as the check is run. If what you need is there, use it.
2. **Read the token file** (`src/styles/theme.css` in the workbench, the project's equivalent
   elsewhere). Every colour, size, radius and shadow you are allowed to use is declared there.
3. **Say what you are about to add**, in one line, before adding it: *"a card with an image and a
   date"*. If that sentence describes something already in the inventory, you are about to
   duplicate it — add a variant instead.

The check regenerates it. `npm run design:inventory` on its own exists for the case where you want
the list without the gate.

## Tokens

### Two layers, one file

The token file has exactly two layers, and the order is what makes it work:

```css
:root {
  /* 1. PRIMITIVES — the raw ramps. Nothing outside this file touches them. */
  --neutral-100: #f1f3f3;
  --neutral-900: #252828;
  --brand-600: #4338ca;

  /* 2. SEMANTICS — names for roles, each pointing at a primitive. */
  --background: #ffffff;
  --foreground: var(--neutral-900);
  --muted: var(--neutral-100);
  --muted-foreground: var(--neutral-700);
  --primary: var(--brand-600);
  --primary-foreground: #ffffff;
  --border: var(--neutral-200);
  --ring: var(--brand-600);
}

@theme inline {
  /* 3. The Tailwind surface — the only names markup may use. */
  --color-primary: var(--primary);
  --color-muted-foreground: var(--muted-foreground);
}
```

Semantic names describe **a role, not a shade**: `--muted-foreground`, never `--grey-text`. The
convention is shadcn's, which matters because the Figma library is built on it too — the same
names mean the same things in the design file and in the code, so nothing is translated between
them and nothing gets lost in the translation.

The `--background` / `--foreground` pairing is not decoration. It means a surface and the text on
it are always chosen together, so a contrast ratio cannot quietly drift apart.

### The rules

**No colour outside the token file.** Not a hex, not an `rgb()`, not `bg-gray-100` from
Tailwind's own ramps, and not a colour smuggled inside an arbitrary value like
`shadow-[0_8px_24px_rgb(0_0_0/0.06)]`. If markup needs a colour, that colour has a name first.

**No undeclared scale step.** Type, spacing, radius, shadow and tracking come from the scale.
`text-[13px]` is not a font size — it is a scale step somebody needed and nobody declared. Add
the step to the scale, then use its name.

**Reaching a token through `var()` is fine.** When Tailwind has no named utility for a property,
`duration-[var(--motion-in)]` is how you stay inside the system rather than leave it. That is the
sanctioned escape hatch, and the audit knows it.

**Never assemble a class name from a fragment.** `bg-${role}-500` and `` `text-${size}` `` do not
exist as far as the build is concerned: Tailwind scans source text for whole class names, so the
class is never generated and the element silently renders unstyled. Write the whole names in a map
and pick one — which is what a variant map already is.

**Dark mode only when it is already in the system, or asked for.** Half a dark mode is worse than
none: it is the one that ships a white panel into a dark page at the moment somebody demos it. When
it is supported, every surface, every state and every accent answers for it, and the answer lives
in the token file like everything else.

**Changing a token's value is free. Adding one costs a sentence.** Designers should retune
`--primary` whenever the design says so — that is what the layer is for. A *new* token means the
design has grown a concept it did not have, which is worth one line saying what it is for.

### When you need a value that is not there

Do not inline it. Ask which of these it is:

- *A step the scale is missing* — add it to the scale. A six-step type scale covers almost
  everything; if you are adding a seventh, check first that you are not just rounding differently.
- *A one-off dimension that is genuinely unique* — a reading measure, an image aspect ratio. Use
  it inline, once. The audit reports it quietly and stops caring unless it appears twice.
- *A value you are not sure about* — ask. A guessed value is the one that gets copied.

## Composition

### Three tiers, and nothing between them

| Tier | What lives there | Rule |
|---|---|---|
| **Primitives** — `components/ui/` | button, card, input, badge | Small, generic, no knowledge of this project's domain |
| **Components** — `components/` | ArticleCard, FilterBar, ProfileHeader | Built from primitives, know the domain, still reusable |
| **Screens** — `pages/` | the assembled page | Compose components and pass data. Almost no markup of their own |

A screen writing raw markup is a component that was never extracted. A primitive that knows what
an "article" is has been put on the wrong tier.

### The rule of two

**A value that appears twice is a token. A shape that appears twice is a component.**

Not a copy with two classes changed — one thing, with the difference passed in as a prop. The
second copy is not the problem; the problem arrives three months later, when someone fixes a bug
in one of them and has no way of knowing the other exists.

The moment you catch yourself about to duplicate a file to change a little of it, stop: that
change is a variant, and it belongs in the original.

### Variants, not copies

A component has one base and a small set of declared variant axes. Each axis is a **finite union
on the prop** and a **named map in the script block**, and the two are the same sentence said
twice — the inventory lists an axis by reading its union, so a `variant?: string` is an axis
nobody can discover.

Variation travels through props. It never travels through a second file, and it never travels
through a `class` prop that quietly overrides the component's own styling from outside — a
component whose appearance is decided by its callers has stopped being a component.

Keep the axes few and orthogonal. When a component grows a fourth axis, or a variant that only
makes sense combined with one particular value of another, it has become two components wearing
one name.

### The logic goes in the script block

**Name the values, then let the markup say which ones apply.** A component's classes are declared
in its frontmatter — a `base`, then one map per axis — and the template composes them with Astro's
own `class:list`, or Vue's `:class` over a named `computed`. There is no helper to import.

```astro
---
const { variant = 'primary', size = 'md', class: extra } = Astro.props

const base = 'inline-flex items-center justify-center rounded-md font-semibold transition-colors'

const byVariant = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
}

const bySize = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
}
---

<button class:list={[base, byVariant[variant], bySize[size], extra]}>
```

A lone literal with nothing to choose between stays where it is — `class:list={['mt-8', extra]}`
is already as clear as it gets, and naming it adds a hop for nothing. The names are for what is
*composed*: a base that several axes are added to, and the axes themselves.

**The rule is larger than classes: anything a reader would otherwise have to run in their head
belongs in the script block, with a name.** A condition decided inside a template, a value derived
by an expression in an attribute, a lookup that depends on knowing what `String.split` does with a
capture group — each one is a place where the file stops saying what it does, and each one is
found by the next person at the worst possible moment.

Three reasons, and none of them is taste:

- **A helper is an indirection you cannot see through.** `cx(BASE, variants(V, {size}, {size:'md'}), extra)`
  is three files between the reader and the answer to *"what does this render"*. The named form is
  one screen, top to bottom.
- **The frontmatter is what ports.** The markup of an `.astro` file copies into a Vue SFC or a PHP
  template unchanged; an expression buried in an attribute does not.
- **Clever is where the bugs live.** A contorted route through a value is the one nobody dares
  change, so it stops being fixed and starts being worked around.

**One exception, and only one.** Where a project is built on **shadcn-vue**, its `cn()` and
`cva()` stay: that is the vendor's idiom inside vendored components, and rewriting a vendored file
is worse than what it fixes. `cn()` also earns its place there for a second reason — `tailwind-merge`
resolves a caller's `class` against the base instead of racing it in the stylesheet.

The gate reads the script block as well as the markup, so a class named in a `const` is checked
exactly like one written into an attribute. Naming a value has never been a way to hide it.

### Names

Names are the cheapest documentation there is, so spend a moment on them. A component is named
for **what it is**, not where it currently sits or what it currently looks like: `ArticleCard`,
not `HomepageBox`; `Callout`, not `BlueBox`. The first is still true after the redesign.

Files are `PascalCase` and match the component name exactly, so a name in the inventory can be
found by searching for it.

## Every screen answers for four states

A screen is not finished when the happy path looks right. It is finished when it answers:

| State | The question it answers |
|---|---|
| **Ready** | the data is there and ordinary |
| **Empty** | there is nothing yet — and this is an invitation to act, not an apology |
| **Loading** | something is coming; the layout does not jump when it arrives |
| **Error** | it went wrong; say what happened and what to do, in the interface's voice |

These are the states nobody designs and everybody ships. Left undrawn, they get invented at the
end of a sprint by whoever is closest — which is how a product ends up with three different empty
states and one spinner in the wrong place.

They also cost almost nothing to draw *while* the screen is being built, and a great deal to add
afterwards. Draw them now.

For a static page with no fetching, loading and error may genuinely not apply — say so in the
handoff rather than skipping the question.

### And a control answers for its own

Different question, different list, and conflating the two is how a screen passes with a button
nobody can tell is disabled. A control has **default, hover, focus, active, disabled, loading**,
and **selected** where selection exists. They are declared as variants like any other axis.

Focus is not optional and not the browser's problem — see the floor. The other one that goes
missing is *loading on the control itself*: a submit that looks identical while it works is a
submit that gets pressed three times.

## Data

**All mock data lives in `fixtures/`, typed, and nowhere else.** Never write data into markup.
The type is the point: it is what a developer reads to build the real thing, and what the backend
implements against.

```ts
export interface Article {
  id: string
  title: string
  excerpt: string
  publishedAt: string
  image?: string     // optional — so the design has to answer for its absence
}
```

Two habits that save the most rework:

- **Include the awkward rows.** The title that runs three lines. The missing image. The empty
  list. A design that only works on tidy data has not been tested, it has been admired.
- **Mark optional fields optional.** `image?: string` tells a developer the empty case is real
  and forces the design to have an answer for it.

## The floor

These hold regardless of the design, because a design that breaks them is not finished:

- **Every image has an `alt`.** Descriptive if it carries meaning, `alt=""` if it is decoration —
  but say which.
- **Every control has an accessible name.** An icon-only button needs `aria-label`. An
  image-only link borrows its name from the image's alt, which means it has no name at all when
  that alt can be empty.
- **Heading levels do not skip.** The outline is how a screen reader navigates; `h2 → h4` puts a
  hole in it. Style an `h3` however the design needs.
- **Focus stays visible.** Removing the ring is a decision somebody makes on purpose and replaces
  with something else. It is never the starting point.
- **Never colour alone.** A state carried only by a hue is a state that does not exist for a
  colour-blind reader, in greyscale print, or on a projector.
- **A label is a label.** A placeholder disappears the moment somebody types, so it was never one.
- **A form error is attached, announced, and focused** — the invalid field points at a stable error
  element, and focus moves to the first one after a failed submit. An error nobody is sent to is an
  error nobody finds.
- **Focus order is the document order.** No positive `tabindex`; it reorders the page for one
  reader and nobody else.
- **Touch targets stay comfortably operable**, which is a size, not a hope.
- **Responsive down to a phone**, and motion respects `prefers-reduced-motion`. Mobile-first means
  the composition changes — what stacks, what hides, where the action goes — not the desktop
  layout scaled down. Type never scales with the viewport (`text-[4vw]` is a font size that is
  unreadable at one end of the range and absurd at the other), and no width makes the page scroll
  sideways.

### Beyond composition

This file owns how UI is put together, and three habits sit just outside that and have nowhere
else to live when a project installs cairn and nothing else. They are not the subject; they are the
floor under it, and a house standards document supersedes every one of them.

- **No dead code.** Not a component nobody imports — the gate already catches that — but an export
  nobody calls, a branch nothing reaches, a block left commented out. Code kept "just in case" is
  the code nobody dares change later.
- **Errors never pass silently.** An empty `catch` in a frontmatter or a script setup turns a
  broken fetch into an empty screen with no explanation, which is the same bug as an undrawn error
  state and much harder to find.
- **Comments say why, never what.** The code already says what it does. What it cannot say is the
  thing that was true when it was written and is not obvious now — and that is the sentence the
  next reader needs.

## Budgets

| | Budget | Why |
|---|---|---|
| Component | ≤ 150 lines | Past this a component is doing two jobs and one of them wants a name |
| Screen | ≤ 250 lines | Past this the screen is holding markup that should be a component |

Three variant axes is the other limit, and it sits above under *Variants, not copies* rather than
here, because the gate does not check it and a budget nothing enforces has no business in a table
of budgets.

Budgets block, so treat them as the number and not as a mood: the audit stops at 151 lines
whatever the component is doing. When one is genuinely a single thing and genuinely over, that is
what a waiver is for — written on the line above, with the reason, like any other.

## The gate

Run it after every screen, not at the end. A drift caught now costs a minute; caught at handoff
it costs a week.

```bash
npm run design:check          # in the workbench: blocking findings
npm run design:check -- --all # advisory too
```

From the repo root, against production code, point it at the folder you mean:

```bash
node design/.ui/ui-audit.mjs --root app --token-file src/styles/global.css
```

`--ignore <dirs>` exists for genuinely **vendored** primitives — a shadcn-vue kit you did not
write and do not maintain. It is not a default: every documented command used to carry
`--ignore ui`, which deleted `components/ui/` from the scan in the ordinary case where those
primitives are the project's own, and those are the files every screen is built out of. Pass it
when the folder is somebody else's code, and the report says so in its header when you do.

It groups by rule and by value, because a long list of findings is usually a short list of
decisions: 135 findings across 43 distinct values means declaring roughly a dozen tokens, not
making 135 edits.

**Never report a check as passed unless you ran it.** If it could not run — no browser, no
network, a command this environment does not have — the result is **`TO BE VALIDATED`**, with the
missing checks named in the handoff. A check nobody ran and everybody assumes passed is worse than
one that was never claimed, because the second is visible.

### Reading it

Every finding says what is wrong and what to do. Fix the cause, not the line: if `text-[13px]`
appears 27 times, the fix is one token and a search-and-replace, not 27 separate decisions.

### Waivers

Some rules will be wrong about some cases. When that happens, silence the rule *explicitly*, on
the line above, with the reason:

```html
<!-- ui-audit-allow: inline-style — third-party embed, the vendor sets this attribute -->
```

and record it in `UI-STACK.md`. One home, not two: the handoff is rewritten every batch and
waivers outlive batches, so a waiver kept there is a decision that quietly expires. The audit also
prints every waiver it honoured on every run, which is what the register is a paste of.

This is deliberate friction. A waiver is a decision someone should be able to find and question
later, which a silently disabled rule never is.

If you find yourself taking the same waiver a third time, the rule is wrong, not the code — say
so, and it gets changed.

## Stack specifics

The law above is the same everywhere. How it is expressed differs, and only the relevant file
needs reading:

- **`references/astro.md`** — `.astro` components, props and slots, when a Vue island is
  justified and when it is just a habit.
- **`references/vue.md`** — SFC conventions that survive being copied into a Nuxt project
  unchanged, and where Nuxt UI takes over.
- **`references/wordpress.md`** — which markup patterns port cleanly into PHP and blocks, and
  which ones trap you. Read it *with* `astro.md`: the prototype is still `.astro`, and the
  WordPress file is what it becomes.

## Source and installed copies

Three things in a project are **installed artifacts**, not source: the skills under
`.claude/skills/` or `.github/skills/`, and the audit tooling under `design/.ui/`. They are copies
of something that lives upstream.

Nobody edits them — not a designer, not a developer. Not out of hierarchy: an edit made there
survives until the next install and then reverts, silently, taking its reasoning with it. It is
`node_modules` with better prose.

A rule that turns out to be wrong is fixed **upstream**, where every project gets the fix. That is
what makes these rules a shared contract rather than one team's local habit — and it is why the
change goes through review by the side it affects. A designer cannot write that change, but they
have the lever that triggers it: a waiver, with its reason, and the third identical waiver is the
signal that the rule is wrong rather than the code.

## When in doubt

Ask. A guessed value, a guessed name or a guessed behaviour is the one that gets copied into four
other places before anyone notices it was a guess.

> *In the face of ambiguity, refuse the temptation to guess.*
