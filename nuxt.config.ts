// https://nuxt.com/docs/api/configuration/nuxt-config
const prerenderPaths = new Set<string>();

// i18n config'i paylaşımlı olarak tanımla
const i18nConfig = {
  baseUrl: "https://www.ebedieyupsultanlilar.com",
  locales: [
    { code: "tr", name: "Türkçe", language: "tr-TR", file: "tr-TR.json" },
    { code: "en", name: "English", language: "en-US", file: "en-US.json" },
    { code: "fr", name: "Français", language: "fr-FR", file: "fr-FR.json" },
  ],
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
    "@nuxt/content",
    "@nuxt/eslint",
    "@nuxt/ui",
    "@nuxtjs/i18n",
    "nuxt-seo-utils",
    "nuxt-gtag",
  ],

  css: ["~/assets/css/main.css"],

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ["/sitemap.xml", "/robots.txt", "/"],
    },
  },

  hooks: {
    // Build sırasında Content tüm dosyaları parse ederken path'leri yakala
    "content:file:afterParse"(file) {
      const path = file.content?.path;

      if (typeof path === "string") {
        // Default locale için prefix yok (prefix_except_default strategy)
        prerenderPaths.add(path);

        // Paylaşımlı i18n config'den locale'ları al
        const { locales, defaultLocale } = i18nConfig;

        // Tüm diller için path'leri oluştur
        locales.forEach((locale) => {
          if (locale.code !== defaultLocale) {
            // Diğer diller için prefix ekle
            prerenderPaths.add(`/${locale.code}${path}`);
          }
        });
      }
    },

    // Prerender başlamadan önce rotaları Nitro'ya ekle
    async "prerender:routes"(ctx: any) {
      for (const p of prerenderPaths) ctx.routes.add(p);
    },
  },

  routeRules: {
    "/": { prerender: true },
    "/person/**": { prerender: true },
    "/en/person/**": { prerender: true },
    "/fr/person/**": { prerender: true },
  },

  i18n: i18nConfig,

  site: {
    url: "https://www.ebedieyupsultanlilar.com",
  },

  gtag: {
    id: 'G-WDN1JTYD40',
    loadingStrategy: 'async',
    
  },
});
