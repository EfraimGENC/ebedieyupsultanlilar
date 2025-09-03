# Copilot Custom Instructions for Ebedi Eyüpsultanlılar

## Project Overview
This project is a multilingual, SEO-optimized biography site for the "Ebedi Eyüpsultanlılar" fountain in Eyüpsultan, Istanbul. It features pages for each notable person listed at the fountain, with biographies, images, and historical context. The stack is Nuxt 4, Nuxt Content, TypeScript, i18n, SSG (`pnpm generate`), and Cloudflare Pages for static CDN deployment.

## Coding Standards
- Use Nuxt 4 conventions: all built-in folders (components, layouts, pages, etc.) are under `app/`.
- Use TypeScript for all code.
- Use Nuxt Content for markdown-driven content.
- Use i18n for all user-facing text, with English, Turkish, and French as supported languages.
- Ensure all pages are SEO-optimized (meta tags, Open Graph, etc.).
- Prefer composables and utility functions for reusable logic.
- Use latest best practices from Nuxt, Nuxt Content, and i18n documentation.
- Use SSG (`pnpm generate`) for static site generation.
- All deployment is to Cloudflare Pages, static only (no SSR, no workers).

## Commit Messages
- Use Conventional Commits (feat, fix, docs, refactor, etc.).
- Write clear, concise messages in English.

## Code Review
- Check for accessibility (a11y) and SEO best practices.
- Ensure all text is translatable and uses i18n.
- Prefer composables for shared logic.
- Avoid hardcoding strings; use i18n keys.

## Directory Structure
- All Nuxt built-in folders are under `app/`.
- Content lives in `content/` and is organized by language.
- i18n locale files are in `i18n/locales/`.

## Other
- Use latest versions of all dependencies.
- Follow official documentation for all tools.

---

For more, see the project README and Nuxt documentation.
