import { acknowledgments as data } from '../data/acknowledgments.mjs';
import { configuredHttpsUrl } from './external.ts';
import { buildMailto } from './mailto.ts';
import type { Localized } from './references';

export interface Acknowledgment {
  id: string;
  status: 'confirmed' | 'placeholder';
  name: Localized;
  picture?: string;
  linkedin?: string;
  website?: string;
  email?: string;
}

export const acknowledgments = data as unknown as Acknowledgment[];

const EMAIL_RE = /^[^\s@<>"',;:]+@[^\s@<>"',;:]+\.[^\s@<>"',;:]+$/;

/**
 * Conditional rendering rules in one pure function (tested by scripts/test-acknowledgments.mjs):
 * every optional field becomes null unless it is valid, so the component never renders an empty,
 * "#", or otherwise inactive link. Invalid values count as missing.
 */
export function entryLinks(entry: Pick<Acknowledgment, 'linkedin' | 'website' | 'email'>) {
  const email = typeof entry.email === 'string' ? entry.email.trim() : '';
  return {
    linkedin: configuredHttpsUrl(entry.linkedin),
    website: configuredHttpsUrl(entry.website),
    email: EMAIL_RE.test(email) ? { address: email, href: buildMailto({ to: email }) } : null,
  };
}

/** Throws a readable error for data mistakes (duplicate ids, placeholder naming rules). */
export function assertAcknowledgmentsValid(items: Acknowledgment[] = acknowledgments): void {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const item of items) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(item.id)) problems.push(`"${item.id}": id must be lowercase-kebab`);
    if (ids.has(item.id)) problems.push(`"${item.id}": duplicate id`);
    ids.add(item.id);
    const names = typeof item.name === 'string' ? [item.name] : [item.name.en, item.name.he];
    if (names.some((n) => !n || !n.trim())) problems.push(`"${item.id}": empty name`);
    const marked = names.map((n) => /^\s*\[PLACEHOLDER\]/.test(n));
    if (item.status === 'placeholder' && marked.some((m) => !m)) problems.push(`"${item.id}": placeholder name must start with [PLACEHOLDER]`);
    if (item.status === 'confirmed' && marked.some(Boolean)) problems.push(`"${item.id}": confirmed entry still has a [PLACEHOLDER] name`);
    if (item.picture !== undefined && (/^[a-z]+:|^\/\//i.test(item.picture) || item.picture.includes('..'))) {
      problems.push(`"${item.id}": picture must be a path inside /public (no URL, no ..)`);
    }
  }
  if (problems.length) throw new Error(`Invalid acknowledgments data (src/data/acknowledgments.mjs):\n  - ${problems.join('\n  - ')}`);
}
