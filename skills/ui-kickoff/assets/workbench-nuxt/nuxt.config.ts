export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/theme.css'],
  /**
   * The workbench is deliberately plain: no data layer, no auth, no backend.
   * `npm run design:build` pre-renders every screen to static HTML in `dist/`,
   * which is what a client can be shown without anyone standing up a server.
   */
  ssr: true,
  devtools: { enabled: false },

  /**
   * `nuxt generate` writes to `.output/public`. Three documents in this workbench
   * promise `dist/`, and the kickoff gates on `dist/` existing, so the output moves
   * to where everything already says it is rather than the other way round.
   */
  nitro: { output: { publicDir: 'dist' } },

  app: {
    head: {
      /**
       * Set this to the language the site is actually written in, at kickoff.
       * A page that lies about its language is read wrong by a screen reader and
       * indexed wrong by a search engine, and nothing else here surfaces it.
       */
      htmlAttrs: { lang: 'en' },
    },
  },
})
