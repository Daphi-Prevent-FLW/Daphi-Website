// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { siteConfig } from './src/config/site.config.mjs';

/**
 * Deployment/build settings are intentionally kept in this one small file so they are
 * easy to reconcile with the existing Daphi repository.
 *
 * - Output is fully static (no Cloudflare adapter needed): Cloudflare serves ./dist
 *   as static assets (see wrangler.jsonc) or via Cloudflare Pages.
 * - `site` comes from src/config/site.config.mjs. While siteUrl is empty the site URL is
 *   unset: no canonical URLs and no sitemap are generated (a sitemap requires absolute URLs).
 */
const site = siteConfig.siteUrl || undefined;

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
  integrations: site ? [sitemap()] : [],
});
