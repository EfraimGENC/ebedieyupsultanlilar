// https://nuxt.com/docs/api/configuration/nuxt-config

// i18n config'i paylaşımlı olarak tanımla
const i18nConfig = {
  baseUrl: "https://www.ebedieyupsultanlilar.com",
  locales: [
    { code: "tr", name: "Türkçe", language: "tr-TR", file: "tr-TR.json" },
    { code: "en", name: "English", language: "en-US", file: "en-US.json" },
    { code: "fr", name: "Français", language: "fr-FR", file: "fr-FR.json" },
  ],
  customRoutes: "meta" as const,
  defaultLocale: "tr" as const,
  strategy: "prefix_except_default" as const,
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: "i18n_redirected",
    redirectOn: "root" as const,
  },
};

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "nuxt-seo-utils",
    "nuxt-gtag",
  ],

  css: ["~/assets/css/main.css"],

  app: {
    head: {
      viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/sitemap.xml", "/robots.txt", "/"],
    },
  },

  routeRules: {
    "/**": { prerender: true },
  },

  i18n: i18nConfig,

  site: {
    url: "https://www.ebedieyupsultanlilar.com",
  },

  gtag: {
    id: "G-WDN1JTYD40",
    loadingStrategy: "async",
  },
});
