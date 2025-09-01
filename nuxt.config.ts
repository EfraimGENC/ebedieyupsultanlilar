// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxtjs/i18n",
  ],

  i18n: {
    baseUrl: "https://www.ebedieyupsultanlilar.com",
    locales: [
      { code: "tr", language: "tr-TR", file: 'tr-TR.json' },
      { code: "en", language: "en-US", file: 'en-US.json' },
      { code: "fr", language: "fr-FR", file: 'fr-FR.json' },
    ],
    defaultLocale: "tr",
    strategy: "prefix_except_default",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
  },
});
