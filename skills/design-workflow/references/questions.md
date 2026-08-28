# The question bank

Questions worth asking a designer, grouped by **what the answer unblocks**. Reach for this when a
brief is thin and you are not sure what is missing.

Two rules that matter more than the list itself:

- **Batch them.** Three numbered questions in one message, each with your suggested answer beside
  it, so the fast reply is "1 and 3 fine, on 2 let's do…". The same three questions in three
  messages is three interruptions.
- **Ask them in the team's working language**, the one recorded in `UI-STACK.md`. The phrasings
  below are the intent, not the script.

## Scope — what am I actually building?

| Ask | Why it matters | A thin answer, and the push |
|---|---|---|
| What is this screen, in one sentence? | If the sentence needs an "and", it is probably two screens | "The dashboard" → "What's the first thing someone needs to see when it opens?" |
| Who opens it, and what are they trying to do? | Decides hierarchy before anything else | "Everyone" → "Who opens it most often, in a normal week?" |
| What is the one thing they should be able to do here? | The one thing gets the emphasis; everything else is support | Three answers → say so, and ask which is first |
| Is there an existing screen this should resemble? | Consistency is cheaper than invention, and they may already have decided | — |

## Hierarchy — what wins the eye?

| Ask | Why it matters |
|---|---|
| What should they see first, second, third? | This is the layout. Asking it as a design question gets a better answer than asking about layout |
| What can be quiet? | Designers name what matters easily and what does not matter rarely. The quiet parts are where a screen gets its calm |
| Is anything here a warning, an error, or a success? | These have their own tokens and their own weight; guessing them wrong looks careless |

## Words — what does it actually say?

Never invent copy without saying you are inventing it.

| Ask | Why it matters |
|---|---|
| What does this button say? | An action keeps its name through the whole flow. "Publish" produces "Published", never "Success" |
| Real headings, or placeholders for now? | A design tested on placeholder text is a design that has not been tested |
| Who is speaking — the product, the company, a person? | Decides the register of every string on the screen |

When you do write placeholder copy, write it in the product's real voice and flag which parts are
yours. Lorem ipsum hides exactly the problems the words would reveal.

## Data — what is on the screen, and what is it called?

This is the section that saves developers the most time, because it becomes the data contract in
the handoff.

| Ask | Why it matters |
|---|---|
| What does one of these have? Walk me through a real one | Field by field, from a real example rather than an imagined one |
| Which of those can be missing? | An optional field is an empty state waiting to happen. Better to know now |
| How many are there, usually? And at most? | Three items and three hundred are different designs |
| Where does it come from — someone types it, or a system produces it? | Decides how wild the values get |
| What is the longest one of these you have ever seen? | The row that breaks the layout, found before it ships |

## States — what happens when it is not the happy path?

| Ask | Phrase it as |
|---|---|
| Empty | "What's here before there's anything?" — and it is an invitation to act, not an apology |
| Loading | "What do they see while it's loading?" — "nothing, it's instant" is a valid answer worth recording |
| Error | "If it doesn't work, what should this say?" — what happened, and what to do about it |
| Too much | "What if there are two hundred?" — pagination, truncation, or scroll |

## Behaviour — what is interactive?

| Ask | Why it matters |
|---|---|
| What happens when they click this? | A link goes somewhere, a button does something. They look the same and behave differently |
| Does anything on this screen change without a page load? | The only question that decides whether an island is needed |
| Is anything here disabled sometimes? When, and does it say why? | A disabled control with no explanation is a dead end |

## Responsive — what happens on a phone?

| Ask | Why it matters |
|---|---|
| Will this be used on a phone? | If yes, design it there first; if no, it still has to not break |
| What can be dropped or collapsed on a small screen? | Better answered by the designer than discovered by you |

## Scope boundary — when do I stop?

| Ask | Why it matters |
|---|---|
| Is this screen alone, or the first of several? | Decides whether to build shared pieces now or later |
| Anything explicitly out of scope for today? | Gives permission to leave things undone, which is what keeps a session finishing |

New ideas that arrive mid-screen do not get folded in. Note them, finish what you agreed, and
raise them at the end.

## Questions never to ask a designer

Some things are yours to decide, and asking makes you look like you are avoiding the work:

- What to name a component, or where to put a file
- Whether something should be a component or a variant
- Which utility class, which prop, which primitive to extend
- Anything about git, builds, dependencies or configuration

If one of these genuinely has no good answer, pick the reversible option and mention it in one
line at the end.
