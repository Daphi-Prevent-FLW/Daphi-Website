// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './src/config/site.config.mjs';
import { normalizeSiteUrl } from './src/config/site-url.mjs';
import { LANGS, DEFAULT_LANG } from './src/config/routes.mjs';

/**
 * Deployment/build settings are intentionally kept in this one small file so they are
 * easy to reconcile with the existing Daphi repository.
 *
 * - Output is fully static (no Cloudflare adapter needed): Cloudflare serves ./dist
 *   as static assets (see wrangler.jsonc) or via Cloudflare Pages.
 * - `site` comes from src/config/site.config.mjs. While siteUrl is empty the site URL is
 *   unset: no canonical URLs, no hreflang, no og:url/og:image, no sitemap and no Sitemap line in
 *   robots.txt (all of these require absolute URLs). The build still succeeds.
 * - Sitemap: the `i18n` option makes the integration add xhtml:link alternates between the language
 *   versions (locale codes are plain `en`/`he`; no regions are invented).
 */
const site = normalizeSiteUrl(siteConfig.siteUrl) || undefined;

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  integrations: site
    ? [sitemap({ i18n: { defaultLocale: DEFAULT_LANG, locales: Object.fromEntries(LANGS.map((l) => [l, l])) } })]
    : [],
});
