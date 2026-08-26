/**
 * Which of our ramps fills each of Nuxt UI's roles.
 *
 * `primary: 'brand'` points at the `--color-brand-*` ramp declared in theme.css.
 * The rest are Tailwind's own ramps, which is fine here: they are being chosen at
 * configuration level, once, not pasted into markup.
 */
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'brand',
      neutral: 'slate',
      success: 'green',
      warning: 'amber',
      error: 'red',
    },
  },
})
