import { ROUTES } from '../config/routes.mjs';
import type { Lang } from '../i18n';

export type RouteId = (typeof ROUTES)[number]['id'];

const slugById = new Map<string, string>(ROUTES.map((r) => [r.id, r.slug]));

/** Prefix a root-relative path with Astro's configured base path (normally '/'). */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}

/**
 * Root-relative URL of a page in a language, e.g. routePath('he','data','share-data') -> /he/data/#share-data
 * Always ends in a slash (trailingSlash: 'always').
 */
export function routePath(lang: Lang, id: RouteId, hash?: string): string {
  const slug = slugById.get(id);
  if (slug === undefined) throw new Error(`Unknown route id: ${id}`);
  const path = slug ? `${lang}/${slug}/` : `${lang}/`;
  return withBase(path) + (hash ? `#${hash}` : '');
}

/** Root-relative URL of the language entry page ('/'). */
export function rootPath(): string {
  return withBase('');
}

export const navRoutes = ROUTES.filter((r) => r.inNav);
