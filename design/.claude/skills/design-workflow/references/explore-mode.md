# Explore mode

Trying three directions before committing to one is real design work, not a detour. A system with
no room for it does not stop the exploring — it just pushes it outside, where nobody sees the
result and nothing learned from it comes back.

So exploring is sanctioned, bounded, and visibly separate.

## Where it lives

```
design/src/pages/explore/          (astro)
design/app/pages/explore/          (nuxt)
```

Explorations route normally, so the designer can open and compare them in the browser. They are
listed on the index page under a separate heading — **Explorations** — marked as throwaway, never
mixed in with the real screens.

The audit skips `explore/` entirely. That is deliberate and it is the point.

## What is suspended in there

Everything that exists to keep a project coherent over months, because an exploration does not
live for months:

- Duplication is fine. Three variations of the same layout is the *purpose*
- Values inline is fine. You are finding the number, not naming it
- No components need extracting
- The four states do not apply
- The audit does not run

## What is not suspended

**An exploration is never promoted as it stands.** When one wins, the real screen is built
properly — from the inventory, on the tokens, with its states — and the exploration is deleted.

That is the whole bargain, and it is not negotiable. The moment an exploration gets moved into
`pages/` because it "already looks right", the project has acquired a screen that follows none of
the rules and everyone can see it working. That is how a standard dies.

Copying values *out* of a winning exploration is not only allowed, it is the point: the numbers you
found become tokens, the layout you found becomes components. What does not travel is the file.

## Starting one

Say it plainly, so it is obvious to everyone that different rules are in force:

> 🟡 Metto tre versioni in `explore/` — le apri, mi dici quale, e quella la costruisco per davvero.
> Quelle in explore sono da buttare, servono solo per scegliere.

Name them for what makes them different, not by number: `pricing-dense.astro`,
`pricing-airy.astro`, `pricing-comparison.astro`. `pricing-1/2/3` tells nobody anything a week
later.

## Ending one

An exploration ends in exactly one of two ways, and never in a third:

1. **It won.** Build the real screen from it, then delete every exploration in that set — including
   the winner. The real screen has replaced it.
2. **None won.** Delete them all and say what you learned, in one line. That line is worth more
   than the files.

Explorations left lying around become a second, unmaintained version of the project that reads as
finished work. If a set has been sitting there for a while, ask about it rather than letting it
settle in.

## When not to explore

If the brief already names the direction, follow it. Exploring against a decision that has been
made is not open-mindedness, it is ignoring the brief — and it costs a designer time they thought
they had already spent.
