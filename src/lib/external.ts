/**
 * External destinations that are configured in site.config.mjs and may still be unset.
 * Rule (master prompt 11.1 / 18.4): never render a link whose destination has not been supplied.
 * Only absolute https:// URLs count as "configured"; anything else (empty, a typo, "TODO") is treated as missing.
 */
export function configuredHttpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (!/^https:\/\/[^\s/$.?#][^\s]*$/i.test(v)) return null;
  try {
    return new URL(v).href;
  } catch {
    return null;
  }
}
