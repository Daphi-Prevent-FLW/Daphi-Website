/**
 * Placeholder text conventions (see README "Placeholders"):
 *   "[PLACEHOLDER] text"             generic editorial placeholder
 *   "[STAT PLACEHOLDER: text]"       a statistic that must be supplied
 * Source data keeps the prefix (so it can be found by search and `npm run list:placeholders`);
 * rendering strips it and shows a badge (PlaceholderMark) instead.
 */
export const PLACEHOLDER_PREFIX = /^\s*\[PLACEHOLDER\]\s*/;
export const STAT_PLACEHOLDER = /^\s*\[STAT PLACEHOLDER:\s*([\s\S]*?)\s*\]\s*$/;

/** Text without its "[PLACEHOLDER]" / "[STAT PLACEHOLDER: …]" wrapper. */
export function stripPlaceholderMarkup(text: string): string {
  const stat = text.match(STAT_PLACEHOLDER);
  if (stat) return stat[1];
  return text.replace(PLACEHOLDER_PREFIX, '');
}
