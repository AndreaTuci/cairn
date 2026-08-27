# cairn guide — design workbench

This folder is where the design gets built. It runs on its own: no backend, no database, nothing
to start but this.

## To work here

Type `/design-workflow` and describe what you want to build. It will ask what it needs to know,
build it, check it against the house rules, and tell you what is still open.

## The three commands

```bash
npm run design         # opens the workbench in a browser and reloads as you work
npm run design:check   # checks the work against the house rules
npm run design:build   # produces plain HTML in dist/ — send it to a client
```

## The rules, in two lines

A value that appears twice is a token — a name in `src/styles/theme.css` that both places point
at. A shape that appears twice is a component, with the difference passed in.

`npm run design:check` enforces both and says what to do when it stops you. The full rules are in
the `ui-composition` skill; the contract for this project is in `UI-STACK.md`.

## Everything outside this folder belongs to the developers

If you need something out there, ask them. It is a two-minute conversation, not a puzzle to work
around.
