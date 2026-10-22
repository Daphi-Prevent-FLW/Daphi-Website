import { references as referenceData } from '../data/references.mjs';
import { citations as citationData } from '../data/citations.mjs';
import { statPlaceholders as statData } from '../data/stat-placeholders.mjs';
import type { Lang } from '../i18n';
import { routePath, type RouteId } from './routes';

export type RefStatus = 'placeholder' | 'needs-verification' | 'verified';
export type Localized = string | { en: string; he: string };

export interface Reference {
  id: string;
  status: RefStatus;
  title: Localized;
  organization?: Localized;
  year?: string;
  publisher?: Localized;
  doi?: string;
  url?: string;
  description: Localized;
  locator?: Localized;
  allowUncited?: boolean;
}
export interface Citation {
  id: string;
  ref: string;
  page: RouteId;
  section: string;
}
export interface StatPlaceholderRecord {
  id: string;
  cite: string;
  page: RouteId;
  section: string;
  description: Localized;
}

export const references = referenceData as Reference[];
export const citations = citationData as Citation[];
export const statPlaceholders = statData as StatPlaceholderRecord[];

/** Pick the text for a language (plain strings are used for both). */
export function localized(value: Localized | undefined, lang: Lang): string {
  if (value === undefined) return '';
  return typeof value === 'string' ? value : value[lang];
}

const refById = new Map(references.map((r) => [r.id, r]));
const citeById = new Map(citations.map((c) => [c.id, c]));
const statById = new Map(statPlaceholders.map((s) => [s.id, s]));

export function getReference(id: string): Reference {
  const ref = refById.get(id);
  if (!ref) throw new Error(`Unknown reference id "${id}" (src/data/references.mjs)`);
  return ref;
}
export function getCitation(id: string): Citation {
  const cite = citeById.get(id);
  if (!cite) throw new Error(`Unknown citation instance "${id}" (src/data/citations.mjs)`);
  return cite;
}
export function getStatPlaceholder(id: string): StatPlaceholderRecord {
  const stat = statById.get(id);
  if (!stat) throw new Error(`Unknown statistic placeholder "${id}" (src/data/stat-placeholders.mjs)`);
  return stat;
}

/** Display number of a reference: its 1-based position in the registry (documented in the README). */
export function referenceNumber(refId: string): number {
  const index = references.findIndex((r) => r.id === refId);
  if (index < 0) throw new Error(`Unknown reference id "${refId}"`);
  return index + 1;
}

/** DOM id of a reference entry on the Resources page. */
export const refAnchor = (refId: string) => `ref-${refId}`;

/** URL of a reference entry on the Resources page. */
export function referenceHref(lang: Lang, refId: string): string {
  return routePath(lang, 'resources', refAnchor(refId));
}

/** Every place a reference is cited (in registry-listed order): drives the backlinks. */
export function citationsOfReference(refId: string): Citation[] {
  return citations.filter((c) => c.ref === refId);
}

/** References cited on a page, de-duplicated, in registry order. */
export function referencesOfPage(page: RouteId): Reference[] {
  const ids = new Set(citations.filter((c) => c.page === page).map((c) => c.ref));
  return references.filter((r) => ids.has(r.id));
}

/** A reference that is not a verified publication (placeholder or still to be fact-checked). */
export const isUnverified = (ref: Reference) => ref.status !== 'verified';

/** https link for a DOI. */
export const doiHref = (doi: string) => `https://doi.org/${doi}`;
