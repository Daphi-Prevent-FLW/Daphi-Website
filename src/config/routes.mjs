// @ts-check
/**
 * Language and route registry (plain .mjs so build-time scripts can import it).
 *
 * URL structure:  /{lang}/{slug}/   e.g. /en/flw-prevention/, /he/data/
 * Slugs are identical in both languages, so every page has an equivalent in the other language
 * and the language switcher can map pages one-to-one.
 */

export const LANGS = /** @type {const} */ (['en', 'he']);
export const DEFAULT_LANG = 'en';

export const DIRS = /** @type {const} */ ({ en: 'ltr', he: 'rtl' });

/**
 * Primary pages. `id` is also the key used in src/i18n/*.ts (`nav[id]` and `pages[id]`).
 * `inNav: false` keeps a page out of the primary navigation (Home is reached via the logo).
 */
export const ROUTES = /** @type {const} */ ([
  { id: 'home', slug: '', inNav: false },
  { id: 'flwPrevention', slug: 'flw-prevention', inNav: true },
  { id: 'partnerships', slug: 'partnerships', inNav: true },
  { id: 'data', slug: 'data', inNav: true },
  { id: 'about', slug: 'about', inNav: true },
  { id: 'resources', slug: 'resources', inNav: true },
  { id: 'acknowledgments', slug: 'acknowledgments', inNav: true },
]);

/**
 * Stable in-page section IDs that other pages link to. Kept in one place so links and
 * the page markup cannot drift apart. (Sections themselves are built in later stages.)
 */
export const SECTION_IDS = /** @type {const} */ ({
  partnershipsWorkingWithDaphi: 'working-with-daphi',
  dataExplore: 'explore-data',
  dataMeasurement: 'request-measurement',
  dataShare: 'share-data',
});
