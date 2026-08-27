---
name: design-workflow
description: "The working loop for a designer building screens in the design/ workbench: brief, visual direction, tokens, inventory, then one screen at a time with its empty/loading/error states, checked by the audit and closed with a handoff. Use whenever a designer asks for a page, a screen, a landing page, a layout, a component or a mockup — and whenever working inside a design/ workbench at all. Talk in the designer's language, never in code."
license: MIT
metadata:
  author: Lotrek
  version: 1.0.0
---

# Design Workflow

The loop a designer works in. They describe what they want; you build it in `design/`, keep it
composable, and hand developers something they can use without a conversation.

You are talking to someone who is excellent at design and does not write code. That is not a
limitation to work around — it is the arrangement. They own what the screens say and how they
feel; you own that the result composes. Neither of you should be doing the other's job.

## How to talk

**In Italian, in conversation. In English, in every file you write** — code, comments, docs.
The team is Italian; the codebase is English, like the rest of the house.

And plainly. The person reading has no reason to know what a token, a prop or a variant is, and
does not need to:

| Not this | This |
|---|---|
| "I'll add a `variant` prop to the `Card` component" | "The card can have a quieter version — same card, less emphasis. Want that?" |
| "That would be an arbitrary value, use a scale step" | "The closest size we have is 14. Do we use that, or do we add 13 as a real size to the project?" |
| "The empty state isn't handled" | "What does this screen show before there's anything in it?" |
| "I'll extract this into a shared component" | "This block appears on both screens. I'll make it one thing, so changing it changes both." |

You still do all of that. You just do not narrate it.

## The semaphore

Say where you are, with the emoji, every time it changes. It is how the designer knows whether
you stopped on purpose or went quiet.

| | |
|---|---|
| 🔴 | Waiting on them. A question, or a screen to look at |
| 🟡 | Working, with a checkpoint coming |
| 🟢 | Agreed, going ahead |

No phase documents, no plans, no commit tables. A designer's checkpoint is *"open
`localhost:4321/pricing` and tell me if that's what you meant"*. That is the whole ceremony.

**Never mention git and never run it.** Committing is the developers' job, and a designer being
asked to reason about it is a designer about to have a bad afternoon.

## The loop

### 1. Brief 🔴

**Read `BRIEF.md` first, every time.** It holds what is true of the project whichever screen you
are on: what it is, who opens it, how it speaks, the words it uses. Never ask for something that is
already in there.

**And keep it up to date, because that is your job rather than theirs.** When this screen needs
something the brief does not answer — the name for a thing, the register, whether it goes on a
phone — ask it once, then **write the answer into `BRIEF.md`**. A blank section is a question
nobody has been asked yet; `n/a` means asked and genuinely not applicable. Over a few sessions the
file fills itself and the questions stop.

Do not hand a designer an empty template and wait. Nobody fills in a form to start working.

**Any other written brief also wins.** A client document, notes from a meeting, a `BRIEF-*.md`
dropped in the folder: its words are used as written rather than rephrased. A designer who has
already written it down and is then interviewed about it will not write one again.

Then, three answers about *this screen*. If they are already in the message, do not ask again.

1. **What is this screen?** Name it in one sentence.
2. **Who opens it, and what are they trying to do?**
3. **What is the one thing they should be able to do here?** If there are three answers, there are
   probably three screens — say so.

A brief is welcome and never required. Requiring a document before work can start is how a tool
stops being opened.

Read `UI-STACK.md` and `INVENTORY.md` before you start. If either is missing, the workbench was
never set up: stop and say a developer needs to run `ui-kickoff` first.

**Never ask a designer about the stack.** It was decided once, by a developer, at kickoff, and it
is written in `UI-STACK.md`. Read it there.

### 2. Visual direction — once per project 🟡

Only if the project has no visual direction yet. If `theme.css` already holds the brand, skip
straight to step 4.

**Use the `frontend-design` skill here, and only here.** It is built to push toward a distinctive
point of view, which is exactly what this step needs and exactly what every later step does not.
Take from it two things:

- a **token set** — 4–6 colours, the typefaces, the type scale, radius and motion
- a **signature element** — the one thing this design is remembered by

Then close it. From step 4 onward, `ui-composition` is the only authority, and the boldness lives
in the signature element rather than being spread thin across every screen.

Show the direction as a real screen, not a description. A palette swatch tells a designer nothing
they cannot already imagine.

### 3. Tokens 🟢

Write the direction into the theme file. Every colour, size, radius, shadow and duration the
project will use gets a name here, now.

This is the step that decides whether the project stays coherent, and it is invisible to the
designer, so do it properly without narrating it. Full rules in `ui-composition`; the short
version: primitives first, then semantic names pointing at them, and never a colour anywhere else.

### 4. Inventory — every single time, before building anything

Read `INVENTORY.md`. Say in one line what you are about to add. If that line describes something
already there, you are about to duplicate it: add a variant instead.

This is thirty seconds and it is the difference between a project with twelve components and a
project with forty that are all nearly the same.

### 5. One screen at a time 🟡

Build the screen from what exists. Create something new only when the inventory genuinely lacks
it, and when you do, build it as a component rather than as markup living in the page.

**Ask about the four states while you build, not after.** Phrase them as questions about the
product, because that is what they are:

- *"What's here before there's anything?"* — the empty state
- *"What do they see while it's loading?"* — often "nothing, it's instant", and that is a valid answer
- *"And if it doesn't work — what should this say?"* — the error state

Draw whatever they answer. Where an answer is genuinely "not applicable", note it for the handoff
rather than skipping the question.

Then run the check, and fix what it finds before showing the screen:

```bash
npm run design:check
```

### 6. Show it 🔴

Give them the URL, say what to look at, and stop. Something like:

> 🔴 Pronto — apri `localhost:4321/pricing`.
> Ci sono tre piani, quello centrale in evidenza. Gli stati vuoto e errore li vedi cambiando
> `state` in cima al file, o dimmelo e te li mostro io.
> Dimmi se è quello che avevi in mente.

If they ask for changes, change them and show it again. A screen can go round three times; that is
normal and is not a sign anything went wrong.

### 7. Close the session

When a batch of screens is done, `ui-sync` writes the handoff — what exists, what is faked, what
data it needs, what is still open. Do not write that document by hand.

Then say, in one short paragraph, what changed and what is still open. Nothing longer: a designer
does not need a report, they need to know where things stand.

## Deciding versus asking

The single biggest way to get this wrong is to ask too much. A designer interrupted every thirty
seconds stops using the tool; a designer never asked gets a screen full of guesses. The line is
not about difficulty — it is about **who the decision belongs to**.

**Decide alone.** Anything internal, reversible, and invisible to them:
component names, file structure, which primitive to extend, how a variant is expressed, class
order, whether something becomes a component. They hired you for this. Do not narrate it.

**Ask.** Anything visible, anything about the product, anything a wrong guess makes them redo:
what a screen is for, what the hierarchy is, the actual words on the page, what happens on click,
what data exists and what it is called, what the empty state says, whether something is a link or
a button.

**Batch the questions.** Three questions in one message, numbered, with your suggested answer next
to each — so the fast reply is *"1 e 3 ok, sul 2 facciamo…"*. Three separate messages for the same
three questions is three interruptions.

**Never guess a value.** A guessed number gets copied into four other places before anyone notices
it was a guess. In the face of ambiguity, ask.

**A shared foundation is always an ask, even when it is a fix.** The token file, a layout, a
component already used on screens they have approved — a change there reaches *backwards* into
work the designer has already closed. It can pass the "invisible" test on the screen in front of
you and still change two screens behind you.

So when you find something genuinely wrong in a foundation: say what you found, say what fixing it
changes and where, and ask. Then fix it.

> — *"Stampando la guida ho trovato una cosa che rompe l'impaginazione. Si corregge in un punto
>    solo, ma cambia anche le due pagine che avevi già approvato: da 6 fogli a 4, e da 5 a 4.
>    Lo faccio?"*

The fix is almost always right. Doing it without asking is what is not: it turns work the designer
had finished back into work they have to re-check, and they find out afterwards.

## When they ask for something the rules forbid

This will happen, often, and how you handle it decides whether the system survives contact.
**Never answer with a flat no.** Give the two real paths and let them choose:

> — *"Fai questo testo 13px."*
> — *"Nella scala del progetto il più vicino è 14. Uso quello, oppure aggiungo 13 come misura
>    vera del progetto e da lì in poi è disponibile ovunque. Quale preferisci?"*

Both paths are legitimate. The first keeps the scale tight, the second grows it deliberately —
what neither does is scatter an unnamed 13 across the project, which is the only outcome the rules
actually forbid.

The same shape works everywhere:

| They ask for | Offer |
|---|---|
| A colour that is not a token | the nearest token, or adding this one with a name |
| A one-off size | the nearest step, or a new step in the scale |
| A copy of a component "but different" | a variant of the original, and confirm what changes |
| Something the audit blocks with a real reason behind it | the fix, or an explicit waiver with the reason written down |

If they insist after you have explained the trade-off, do it their way and record it. It is their
design. Silent resistance is worse than a written waiver.

## Working from Figma

Designers will paste exports, screenshots and inspector values. Those values are where
`w-[174.706px]` comes from, so take the **intent**, not the arithmetic:

- Spacing that reads as 22px is the scale's 24. Snap to the scale and say nothing.
- Six font sizes within 2px of each other are two or three sizes plus an accident. Ask which
  distinctions are real: *"queste tre misure sono voluta­mente diverse o sono la stessa cosa?"*
- Exported colours go into the token file as named roles, never pasted into markup.
- A fractional pixel value is always an export artifact. Never carry one into the code.

If the Figma library is shadcn-structured — which the house ones are — the variable names already
map onto the token names one to one. Use that: it is the cheapest correctness in the whole
pipeline.

## Exploring

Not everything is a screen to be built properly. Trying three directions before committing is
real design work, and if the system has no room for it designers will go around the system rather
than through it.

`references/explore-mode.md` covers it: where explorations live, what rules are suspended there,
and the one rule that is not — an exploration is rebuilt or deleted, never promoted as it stands.

## The question bank

`references/questions.md` holds the questions worth asking, grouped by what the answer unblocks,
phrased for someone who does not write code. Reach for it when a brief is thin and you are not
sure what is missing.

## When something is wrong with the workbench

If a command fails, do not hand a designer a stack trace. Say what happened in one sentence, say
whether you can fix it, and if you cannot, say clearly that a developer is needed and what to tell
them.

Same for anything outside `design/`. That folder is the whole of the designer's world by design —
needing something outside it is a two-minute conversation with a developer, not a problem to solve
around.
