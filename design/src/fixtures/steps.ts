/**
 * Every step of using cairn, from an empty repository to a component running in
 * production. One line each, numbered once across the whole page.
 *
 * The numbering does not restart per group. A reader following this with a
 * terminal open needs "step 21", not "step 6 of the fourth group" — so the page
 * carries a running count and this file only says what the steps are.
 *
 * Nothing here is optional and nothing is summarised. A step somebody has to ask
 * a colleague about is a step this list is missing, which is why the audiences
 * are separated but the count is not.
 */
import type { Audience } from './skills'

export interface StepGroup {
  /** The heading of the group. */
  title: string
  readBy: Audience
  /** How often the group runs. One phrase, lower case. */
  cadence: string
  /** Why the group exists, in one or two sentences. Backticked terms are set as code. */
  why: string
  /** One imperative line each. Backticked terms are set as code. */
  steps: string[]
}

export interface NumberedGroup extends StepGroup {
  /** 1-based number of this group's first step in the running count. */
  start: number
}

const GROUPS: StepGroup[] = [
  {
    title: 'Setting the project up',
    readBy: 'developer',
    cadence: 'once, at the start of a project',
    why: 'cairn does not touch how a project is built. It is installed into one that already exists, or into one being started the way it would have been anyway.',
    steps: [
      'Install Node 22.19 or newer.',
      'Build the project the way you always would — docker, the backend, the database, the real frontend. cairn does not enter this part and does not ask you to change any of it.',
      'Run `npx @lotrek/cairn install` inside the project folder. It puts the skills where Claude and Copilot look for them, and does nothing else.',
      'Type `/ui-kickoff` in the chat with your agent. A terminal command cannot ask you questions, which is why this is a second step and not a flag on the first.',
      'Answer the five questions: what you are building, whether there is a component kit to build on, where the brand starts, which folders belong to developers, and what language the team works in.',
      'Let it scaffold `design/`, seed the token file with the real brand, write `UI-STACK.md` and `BRIEF.md`, install the audit into `design/.ui/`, and write the instruction files that every later session reads.',
      'Fill in the "Where things land" table in `design/UI-STACK.md`: which workbench folder becomes which folder of the project. Decided once, here, so that no promotion ever guesses it.',
      'Read what it reports at the end. The build, the check and the inventory all have to be green before anybody else opens the folder.',
      'Commit the workbench, `design/.ui/` included. In your project that is the only copy of the tooling, and a designer who clones without it has no check to run.',
    ],
  },
  {
    title: 'Handing it to a designer',
    readBy: 'both',
    cadence: 'once per person, per machine',
    why: 'The boundary between the two roles is the folder, not a permission list: a designer opens `design/` and their agent cannot reach past it. Everything here happens on their laptop, so none of it can be scaffolded from yours.',
    steps: [
      'Install Node and the coding agent on the designer’s machine, and sign in.',
      'Clone the project there.',
      'Write the per-machine permission file that keeps the developers’ folders read-only. It is about the person, not the project, so it is never committed.',
      'Tell them to open the `design/` folder, not the repository root. That one instruction is the whole boundary.',
      'Have them run `npm install` inside `design/`, once.',
    ],
  },
  {
    title: 'A design session',
    readBy: 'designer',
    cadence: 'every session',
    why: 'One screen at a time, and a stop at the end of each. You are never asked about code, and you are always asked what the screen is for.',
    steps: [
      'Type `/design-workflow` and say what you want to make today and how far you want to get. You are asked this every session: no document answers it, because it is a decision rather than a fact.',
      'Answer the questions about the product — what the screen is for, who opens it, the real words on it, what happens on click.',
      'Answer the three everybody skips: what is on screen when the list is empty, while it is loading, and when something breaks.',
      'Open the address you are given, look at it, and say what is wrong. A screen goes round three times; that is normal, not a sign that anything went wrong.',
      'Ask for the thing the rules forbid, if you want it. You get two real paths — the nearest value the project already has, or that value added to the project by name — never a flat no.',
      'Let the session close itself with the handoff. It is written from what is actually there, and writing it by hand is how it stops being true.',
    ],
  },
  {
    title: 'Taking it into production',
    readBy: 'developer',
    cadence: 'every time you pick the work up',
    why: 'The workbench is a living source and production is a copy of it. Everything here is about knowing what moved before you touch anything, and leaving a record so the next person can know too.',
    steps: [
      'Read `design/HANDOFF.md`. It answers what is real and what is faked, which decides everything after it.',
      'Run `node design/.ui/ui-drift.mjs --root design` to see what the designer moved since you last took a copy.',
      'Run `node design/.ui/ui-audit.mjs --root design --all`.',
      'Triage every file before touching any of it: keep, normalize, rewrite. It is a two-minute table and the cheapest moment there is to find out that four files need rewriting.',
      'Promote along the "Where things land" table, and wire the real data without changing a component’s props.',
      'Replace the fixtures with the real source. They are the one folder that is never promoted.',
      'Record every promotion: `node design/.ui/ui-drift.mjs --root design --record <file> --to <where it went>`. An unrecorded promotion turns the next drift report into noise.',
      'Run the audit over the production folders too, pointed at the production token file.',
    ],
  },
  {
    title: 'Keeping the two in step',
    readBy: 'both',
    cadence: 'from then on',
    why: 'This is the part that decides whether the arrangement survives its second month. None of it is difficult and all of it is skippable, which is exactly why it is written down.',
    steps: [
      'Send back what production learned: a field that can be empty, real content longer than any fixture, a state nobody drew.',
      'Regenerate the inventory whenever the components change — `npm run design:inventory`. It is what stops the next screen rebuilding something that already exists.',
      'When a rule is genuinely wrong for one case, take the waiver, write the reason on the line above it, and record it in `UI-STACK.md`.',
      'When the same waiver is taken a third time, change the rule instead of the code — upstream, where every project gets the change.',
    ],
  },
]

/**
 * The groups, each carrying where it starts in the running count.
 *
 * Computed here rather than in the page, because the gallery on `/composition`
 * shows a real group too and the two must not disagree about its number.
 */
function numbered(groups: StepGroup[]): NumberedGroup[] {
  const counted: NumberedGroup[] = []
  let next = 1

  for (const group of groups) {
    counted.push({ ...group, start: next })
    next += group.steps.length
  }

  return counted
}

export const stepGroups: NumberedGroup[] = numbered(GROUPS)

/** Every step on the page, counted once, so the prose cannot disagree with the list. */
export const stepCount = GROUPS.reduce((total, group) => total + group.steps.length, 0)
