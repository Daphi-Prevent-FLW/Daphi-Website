// @ts-check
/**
 * Normalises the configured production URL. Pure function (used by SeoHead, the entry page, robots.txt,
 * astro.config.mjs and the quality script).
 *  - ''/undefined -> '' (unset: no absolute URLs, no canonical, no hreflang, no sitemap)
 *  - 'https://example.org/' -> 'https://example.org' (no trailing slash)
 * Throws on anything that is not a bare http(s) origin, so a typo fails the build loudly instead of
 * producing broken canonical URLs. A sub-path is not supported (configure Astro `base` separately).
 * @param {string | undefined | null} value
 * @returns {string}
 */
export function normalizeSiteUrl(value) {
  const raw = (value ?? '').trim();
  if (!raw) return '';
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`siteUrl "${raw}" is not a valid URL (expected e.g. https://example.org)`);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error(`siteUrl must start with https:// (got "${raw}")`);
  if ((url.pathname !== '/' && url.pathname !== '') || url.search || url.hash)
    throw new Error(`siteUrl must be a bare origin without path, query or fragment (got "${raw}")`);
  return url.origin;
}
