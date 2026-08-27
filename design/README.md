# Workbench

Where the design gets built. Screens, components and tokens live here, and this
folder runs on its own — no backend, no database, no docker.

## Three commands

```bash
npm install        # once
npm run design     # opens the workbench in a browser, reloads as you work
npm run design:check   # checks the work against the house rules
npm run design:build   # produces plain HTML in dist/ — send it to a client
```

## What lives where

| Folder | What goes in it |
|---|---|
| `src/styles/theme.css` | Every colour, size, radius and shadow in the project. The only file with a colour in it. |
| `src/components/ui/` | Primitives — button, card, input. Small, reused everywhere. |
| `src/components/` | Everything built out of the primitives. |
| `src/pages/` | The screens. `index.astro` lists them all. |
| `src/fixtures/` | Fake data, typed. Never write data into a screen. |

## The two rules worth remembering

**A value that appears twice is a token.** Not a second `13px` typed by hand — a
name in `theme.css` that both places point at. Change it once, it changes everywhere.

**A shape that appears twice is a component.** Not a copy with two classes
changed — one component, with the difference passed in. The copy is where the
two quietly stop matching.

`npm run design:check` enforces both, and says what to do when it stops you. If a
rule is genuinely wrong for one case, you can silence it — but you have to say
why, in writing, on the line above:

```html
<!-- ui-audit-allow: inline-style — third-party embed, the vendor sets it -->
```

## Working with Claude here

Type `/design-workflow` and describe what you want to build. It asks what it
needs to know, builds it, checks it, and tells you what is left open.

Everything outside this folder belongs to the developers. If you need something
out there, ask them — it is not a permissions puzzle to solve, it is a two-minute
conversation.
