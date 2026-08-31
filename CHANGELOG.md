# Changelog

What changed, and what it will do to a project that already uses this.

## 1.1.0

**The gate has a new blocking rule. A project that passes today can fail after this.**

- **Added — `domain-primitive` (blocking).** A component in `components/ui/` that imports from
  `fixtures/` is not a primitive: that tier is for shapes which would still make sense on a page
  that does not exist yet. Move it to `components/`, which is the tier allowed to know the domain,
  and update its call sites in the same change.

  This rule was prose for a long time and prose lost. The first project to use these skills outside
  the repository they were written in put all ten of its components in `ui/`, four of them holding
  a teacher, a course or a dance — and the inventory made it look tidy, because it splits its two
  sections on that folder name. If this fires on your project, the finding is real and it predates
  the rule.

  It was checked against every workbench here before shipping: no primitive in cairn's own guide or
  in either template imports project data, so upgrading changes nothing for them.

- **Added — reinstalling refreshes the vendored audit.** `npx @andreatuci/cairn install` now also
  refreshes `design/.ui/` where a workbench already exists. It never creates one. Until now a
  workbench scaffolded in March ran March's rules for ever, while `ui-composition` claimed a fix
  upstream was one "where every project gets the fix". That was not true. It is now, on reinstall.

- **Fixed — the inventory names an empty tier.** With every component in `ui/`, the `Components`
  section was omitted entirely rather than printed empty, so a missing tier read as a tidy list of
  primitives.

- **Fixed — the preview server.** `design-workflow` now says to start it in the background (a dev
  server never returns, and in the foreground it takes the session with it), to reuse one already
  serving that folder rather than starting a second, and — at the end of a session — to say that it
  is still running and offer to stop it. The designer never started it and has no terminal to stop
  it in.

- **Fixed — five documents claimed `npm run design` opens a browser.** It does not: the script is a
  bare `astro dev` / `nuxt dev`. They now say it serves the workbench at a local address.

## 1.0.1

- The README leads with `npx`, and says plainly that `npm i` is the wrong command: cairn is a
  scaffolder, not a dependency, and nothing of it belongs in your `package.json`.
- `homepage` points at the published guide rather than at the README somebody is already reading.

## 1.0.0

First release. Five skills — `ui-kickoff`, `ui-composition`, `design-workflow`, `dev-workflow`,
`ui-sync` — two workbench templates, and three Node scripts with no dependencies: the audit, the
inventory, and the drift report.
