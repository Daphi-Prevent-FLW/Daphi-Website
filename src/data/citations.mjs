// @ts-check
/**
 * CITATION INSTANCES: every place a reference is cited on the site.
 *
 * A marker is rendered with  <Cite id="c-home-hero-1" lang={lang} />  and the id must exist here.
 * One reference can be cited many times (one instance per place). Instance ids are permanent
 * DOM ids, used as backlink targets from the Resources page: never reuse or rename one casually.
 *
 *   id       unique, lowercase-kebab, convention c-<page>-<section>-<n>
 *   ref      id of a record in src/data/references.mjs
 *   page     route id (src/config/routes.mjs: home, flwPrevention, partnerships, data, about, resources, acknowledgments)
 *   section  key in the dictionary's `refs.sections` (gives the human label used in backlinks)
 *
 * `npm run validate:refs` checks that every instance is rendered exactly once on its page, in both
 * languages, and that nothing is rendered that is not listed here.
 *
 * @typedef {Object} Citation
 * @property {string} id
 * @property {string} ref
 * @property {string} page
 * @property {string} section
 */

/** @type {Citation[]} */
export const citations = [
  // ----- Home (hero introduction)
  { id: 'c-home-hero-1', ref: 'flw-global-overview-01', page: 'home', section: 'hero' },
  { id: 'c-home-hero-2', ref: 'flw-supply-chain-losses-01', page: 'home', section: 'hero' },
  { id: 'c-home-hero-3', ref: 'flw-environment-impacts-01', page: 'home', section: 'hero' },

  // ----- FLW Prevention: the scale of food loss and waste
  { id: 'c-prevention-scale-1', ref: 'flw-measurement-methods-01', page: 'flwPrevention', section: 'scale' },
  { id: 'c-prevention-scale-2', ref: 'flw-supply-chain-losses-01', page: 'flwPrevention', section: 'scale' },
  { id: 'c-prevention-scale-3', ref: 'flw-measurement-methods-01', page: 'flwPrevention', section: 'scale' }, // repeated reference, other place
  // used by the statistic placeholders (src/data/stat-placeholders.mjs)
  { id: 'c-prevention-scale-stat-1', ref: 'flw-global-overview-01', page: 'flwPrevention', section: 'scale' },
  { id: 'c-prevention-scale-stat-2', ref: 'flw-supply-chain-losses-01', page: 'flwPrevention', section: 'scale' },
  { id: 'c-prevention-scale-stat-3', ref: 'flw-business-level-01', page: 'flwPrevention', section: 'scale' },
  { id: 'c-prevention-scale-stat-4', ref: 'flw-environment-impacts-01', page: 'flwPrevention', section: 'scale' },

  // ----- FLW Prevention: how prevention works
  { id: 'c-prevention-process-1', ref: 'flw-prevention-approaches-01', page: 'flwPrevention', section: 'process' },
  { id: 'c-prevention-process-2', ref: 'flw-measurement-methods-01', page: 'flwPrevention', section: 'process' },
];
