import en from './en';
import he from './he';
import type { Dictionary } from './en';
import { LANGS, DEFAULT_LANG, DIRS } from '../config/routes.mjs';

export type Lang = (typeof LANGS)[number];
export type { Dictionary };

const dictionaries: Record<Lang, Dictionary> = { en, he };

export { LANGS, DEFAULT_LANG };

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

export function getDictionary(lang: Lang): Dictionary {
  return dictionaries[lang];
}

export function getDir(lang: Lang): 'ltr' | 'rtl' {
  return DIRS[lang];
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'he' : 'en';
}

/** Shared getStaticPaths for every [lang]/... page. */
export function langStaticPaths() {
  return LANGS.map((lang) => ({ params: { lang } }));
}
