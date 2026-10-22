// @ts-check
/**
 * STATISTIC PLACEHOLDERS. The site publishes NO actual figures: wherever a number would normally
 * appear, a record from this file is rendered with <StatPlaceholder id="..." lang={lang} />.
 *
 * Each record is tied to a citation instance (src/data/citations.mjs), which in turn points to a
 * reference. `npm run validate:refs` fails if a placeholder is not tied to an existing reference,
 * or is not rendered where it says it is.
 *
 *   id            unique, lowercase-kebab
 *   cite          id of the citation instance rendered right after the placeholder
 *   page/section  where it is used (same meaning as in citations.mjs)
 *   description   text written as "[STAT PLACEHOLDER: ...]" saying what figure belongs here and which
 *                 distinctions the final figure must state (year, scope, measured vs estimated ...).
 *                 string or { en, he }.
 *
 * To finish: replace the <StatPlaceholder> in the page with the fact-checked figure plus its <Cite>,
 * then delete the record here.
 *
 * @typedef {Object} StatPlaceholder
 * @property {string} id
 * @property {string} cite
 * @property {string} page
 * @property {string} section
 * @property {string | { en: string, he: string }} description
 */

/** @type {StatPlaceholder[]} */
export const statPlaceholders = [
  {
    id: 'stat-demo-global-estimate',
    cite: 'c-prevention-demo-stat-1',
    page: 'flwPrevention',
    section: 'demo',
    description: {
      en: '[STAT PLACEHOLDER: global estimate of food lost or wasted; specify year, scope, and whether measured or estimated]',
      he: '[STAT PLACEHOLDER: הערכה גלובלית לכמות המזון שאבדה או בוזבזה; יש לציין שנה, היקף והאם הנתון נמדד או מוערך]',
    },
  },
];
