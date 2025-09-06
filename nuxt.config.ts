// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/sitemap",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxtjs/i18n",
  ],

  css: ["~/assets/css/main.css"],

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/sitemap.xml", "/robots.txt"],
    },
  },

  i18n: {
    baseUrl: "https://www.ebedieyupsultanlilar.com",
    locales: [
      { code: "tr", name: "Türkçe", language: "tr-TR", file: "tr-TR.json" },
      { code: "en", name: "English", language: "en-US", file: "en-US.json" },
      { code: "fr", name: "Français", language: "fr-FR", file: "fr-FR.json" },
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
