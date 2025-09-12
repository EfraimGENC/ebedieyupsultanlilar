// https://nuxt.com/docs/api/configuration/nuxt-config
import type { ContentFile } from "@nuxt/content";

const prerenderPaths = new Set<string>();

// i18n config'i paylaşımlı olarak tanımla
const i18nConfig = {
  baseUrl: "https://www.ebedieyupsultanlilar.com",
  locales: [
    { code: "tr", name: "Türkçe", language: "tr-TR", file: "tr-TR.json" },
    { code: "en", name: "English", language: "en-US", file: "en-US.json" },
    { code: "fr", name: "Français", language: "fr-FR", file: "fr-FR.json" },
  ],
  customRoutes: "config" as const,
  pages: {
    about: {
      tr: "/hakkinda" as const,
      en: "/about" as const,
      fr: "/a-propos" as const,
    },
    person: {
      tr: "/kisi" as const,
      en: "/person" as const,
      fr: "/personne" as const,
    },
    "person-slug": {
      tr: "/kisi/[slug]" as const,
      en: "/person/[slug]" as const,
      fr: "/personne/[slug]" as const,
    },
  },
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
    "content:file:afterParse"(ctx) {
      const { file, content } = ctx;
      const { locales, defaultLocale } = i18nConfig;

      const path = (content as ContentFile).path;
      const slug = path.split("/").pop() || "";
      const pathPrefixes = i18nConfig.pages["person-slug"];
      let translatedPaths: Record<string, string> = {};

      // Translate paths for each locale
      locales.forEach((locale) => {
        if (pathPrefixes) {
          let pathPrefix =
            pathPrefixes[locale.code as keyof typeof pathPrefixes];
          if (pathPrefix) {
            translatedPaths[locale.code] = pathPrefix.replace("[slug]", slug);
          }
        } else {
          translatedPaths[locale.code] = path;
        }
      });

      // Add each translated path to the prerender paths
      Object.entries(translatedPaths).forEach(([locale, path]) => {
        if (locale === defaultLocale) {
          prerenderPaths.add(path);
        } else {
          prerenderPaths.add(`/${locale}${path}`);
        }
      });
    },

    // Prerender başlamadan önce rotaları Nitro'ya ekle
    async "prerender:routes"(ctx: any) {
      for (const p of prerenderPaths) ctx.routes.add(p);
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
