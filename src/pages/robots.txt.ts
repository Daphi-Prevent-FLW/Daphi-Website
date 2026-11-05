/**
 * robots.txt, generated so that the Sitemap line only exists when it can be correct (absolute URL needed).
 * siteUrl unset -> no Sitemap line (and no sitemap is built either). See src/config/site.config.mjs.
 */
import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site.config.mjs';
import { normalizeSiteUrl } from '../config/site-url.mjs';
import { withBase } from '../lib/routes';

export const GET: APIRoute = () => {
  const site = normalizeSiteUrl(siteConfig.siteUrl);
  const lines = ['User-agent: *', 'Allow: /'];
  if (site) lines.push('', `Sitemap: ${site}${withBase('sitemap-index.xml')}`);
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
