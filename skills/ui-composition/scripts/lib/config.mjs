/**
 * Every threshold the audit uses, in one place.
 *
 * The defaults come from measuring real house code (legacoop/app/src, 88 files):
 * .astro sits at p50=32 / p90=108 / max=207, .vue at p50=95 / p90=227 / max=317.
 * Budgets are set above p90 so ordinary work passes and only genuine sprawl trips.
 *
 * A project overrides any of this with `ui-audit.config.json` next to the workbench.
 */

export const DEFAULTS = {
  /** Where the workbench lives, relative to the repo root. */
  root: 'design',

  /** The one file allowed to contain raw colour values. */
  tokenFile: 'src/styles/theme.css',

  /**
   * Extensions the audit reads.
   *
   * `.css` is here so *"no colour outside the token file"* is a rule and not a
   * hope: without it the audit never opened a stylesheet, and a second design
   * system living in a second `.css` passed clean. `.php` is here because the
   * WordPress target ships PHP and had no gate at all — the colour, class and
   * accessibility rules are regex over markup and read it unchanged. `.ts` is here
   * because a variant map does not stop being a variant map when it moves one file
   * over: shadcn-vue keeps it in a sibling `index.ts`, and a class const moved out
   * of a component used to leave the gate entirely.
   */
  extensions: ['.astro', '.vue', '.html', '.css', '.php', '.ts'],

  /**
   * Directory *names* excluded from the walk — build output and dependencies.
   * Matched per path segment, never as a substring: `.astro` here means the build
   * cache directory, and must not swallow a `components/astro/` folder.
   * A project adds its own vendored directories through `ui-audit.config.json`.
   */
  ignoreDirs: [
    'node_modules', 'dist', '.astro', '.git', '.output', '.nuxt', '.svelte-kit',
  ],

  /**
   * Paths excluded by where they sit, not by what they are called.
   *
   * Explorations are throwaway by design and are never promoted as they stand, so
   * holding them to rules meant to keep a project coherent over months would only
   * push the exploring somewhere nobody can see it. See design-workflow.
   *
   * Matched as a path fragment rather than a directory name: `explore` on its own
   * also excused a production route called `/explore`, which is an ordinary thing
   * for a product to have and was silently never audited.
   */
  ignorePaths: ['pages/explore/'],

  budgets: {
    /** Max lines for a component before it is doing two jobs. */
    component: 150,
    /** Max lines for an assembled page. */
    page: 250,
    /** Fraction of a budget at which the audit starts warning. */
    warnAt: 0.8,
    /** Above this props count, a component is configuration rather than composition. */
    props: 8,
  },

  duplication: {
    /** Jaccard similarity over 5-grams of the structural token stream. */
    threshold: 0.85,
    /** Files shorter than this are too small for similarity to mean anything. */
    minTokens: 40,
  },

  /**
   * Utilities whose value must always be a token. An arbitrary value here is
   * never a one-off: it is a scale step nobody declared.
   */
  scaleUtilities: [
    'text', 'leading', 'tracking', 'rounded', 'shadow',
    'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl',
    'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml',
    'gap', 'gap-x', 'gap-y', 'space-x', 'space-y',
    'border', 'border-x', 'border-y', 'border-t', 'border-r', 'border-b', 'border-l',
  ],

  /** Tailwind's own colour ramps. Reaching for one means bypassing the tokens. */
  defaultRamps: [
    'slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow',
    'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet',
    'purple', 'fuchsia', 'pink', 'rose',
  ],

  /** Utilities that take a colour, for the smuggled-colour check. */
  colorUtilities: [
    'bg', 'text', 'border', 'ring', 'fill', 'stroke', 'from', 'to', 'via',
    'outline', 'decoration', 'shadow', 'accent', 'caret', 'divide', 'placeholder',
  ],
}

export const SEVERITY = { BLOCKING: 'blocking', ADVISORY: 'advisory' }

/** Merge a project's `ui-audit.config.json` over the defaults, one level deep. */
export function resolveConfig(overrides = {}) {
  const merged = { ...DEFAULTS, ...overrides }
  for (const key of ['budgets', 'duplication']) {
    merged[key] = { ...DEFAULTS[key], ...(overrides[key] ?? {}) }
  }
  return merged
}
