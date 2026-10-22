// @ts-check
/**
 * CITATION INSTANCES: every place a reference is cited on the site.
 *
 * A marker is rendered with  <Cite id="c-home-demo-1" lang={lang} />  and the id must exist here.
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
  // Stage 2 demonstration (shown on the Home and FLW Prevention stubs; removed/replaced in Stage 3).
  { id: 'c-home-demo-1', ref: 'flw-global-overview-01', page: 'home', section: 'demo' },
  { id: 'c-home-demo-2', ref: 'flw-business-level-01', page: 'home', section: 'demo' },
  { id: 'c-home-demo-3', ref: 'flw-global-overview-01', page: 'home', section: 'demo' }, // repeated reference
  { id: 'c-prevention-demo-1', ref: 'flw-supply-chain-losses-01', page: 'flwPrevention', section: 'demo' },
  { id: 'c-prevention-demo-2', ref: 'flw-global-overview-01', page: 'flwPrevention', section: 'demo' }, // same ref, other page
  { id: 'c-prevention-demo-3', ref: 'flw-environment-impacts-01', page: 'flwPrevention', section: 'demo' },
  { id: 'c-prevention-demo-4', ref: 'flw-measurement-methods-01', page: 'flwPrevention', section: 'demo' },
  { id: 'c-prevention-demo-5', ref: 'flw-prevention-approaches-01', page: 'flwPrevention', section: 'demo' },
  { id: 'c-prevention-demo-stat-1', ref: 'flw-global-overview-01', page: 'flwPrevention', section: 'demo' }, // used by a statistic placeholder
];
