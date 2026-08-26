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
})
