// @ts-check
/**
 * CENTRAL REFERENCE REGISTRY: the single source of truth for every source cited on the site.
 *
 * IN THIS BUILD EVERY RECORD IS A PLACEHOLDER (status: 'placeholder'). They are editorial stand-ins,
 * NOT claims that such publications exist. No title, author, organization, date, DOI or URL here is real.
 *
 * Identity rules (see README, "References and citations"):
 *  - `id` is the permanent identity. It is NOT derived from the title and never changes when the
 *    placeholder is replaced by a real source. Markers and backlinks point to the id.
 *  - The number shown to visitors ([1], [2] ...) is derived from the position in this array
 *    (first record = 1). Re-ordering this array renumbers the markers; ids stay stable.
 *
 * To replace a placeholder with a real source: keep `id`, fill in the real fields, drop the
 * "[PLACEHOLDER]" prefix from the titles and set `status` to 'verified'
 * (use 'needs-verification' while a real source has been added but not yet fact-checked).
 *
 * Any text field may be a plain string (used for both languages) or { en, he }.
 *
 * @typedef {string | { en: string, he: string }} Localized
 * @typedef {'placeholder' | 'needs-verification' | 'verified'} RefStatus
 * @typedef {Object} Reference
 * @property {string} id               Stable unique id: lowercase-kebab, independent of title and number.
 * @property {RefStatus} status
 * @property {Localized} title
 * @property {Localized} [organization] Author / issuing organization (omit if unknown).
 * @property {string} [year]            Publication year or date (omit if unknown).
 * @property {Localized} [publisher]    Publisher or journal.
 * @property {string} [doi]             Bare DOI, e.g. "10.1234/abcd" (rendered as https://doi.org/...).
 * @property {string} [url]             External https URL.
 * @property {Localized} description    Short description of what the source is for.
 * @property {Localized} [locator]      Page / section / table / figure.
 * @property {boolean} [allowUncited]   Set true to silence the "never cited" warning for this record.
 */

/** @type {Reference[]} */
export const references = [
  {
    id: 'flw-global-overview-01',
    status: 'placeholder',
    title: {
      en: '[PLACEHOLDER] Global food loss and waste statistics',
      he: '[PLACEHOLDER] סטטיסטיקות גלובליות על אובדן ובזבוז מזון',
    },
    description: {
      en: 'Editorial placeholder. Replace with a verified source for global estimates of food loss and waste (state the year, scope and whether the figures are measured or estimated).',
      he: 'מקום שמור לעריכה. יש להחליף במקור מאומת להערכות גלובליות של אובדן ובזבוז מזון (יש לציין שנה, היקף והאם המספרים נמדדו או הוערכו).',
    },
  },
  {
    id: 'flw-supply-chain-losses-01',
    status: 'placeholder',
    title: {
      en: '[PLACEHOLDER] Food loss across supply chains',
      he: '[PLACEHOLDER] אובדן מזון לאורך שרשראות האספקה',
    },
    description: {
      en: 'Editorial placeholder. Replace with a verified source describing where in the supply chain food is lost, and how each stage is defined.',
      he: 'מקום שמור לעריכה. יש להחליף במקור מאומת שמתאר היכן בשרשרת האספקה אובדן המזון מתרחש וכיצד מוגדר כל שלב.',
    },
  },
  {
    id: 'flw-business-level-01',
    status: 'placeholder',
    title: {
      en: '[PLACEHOLDER] Food waste in food businesses',
      he: '[PLACEHOLDER] בזבוז מזון בעסקי מזון',
    },
    description: {
      en: 'Editorial placeholder. Replace with a verified source on food waste at business level (for example retail, food service or manufacturing), distinct from consumer-level waste.',
      he: 'מקום שמור לעריכה. יש להחליף במקור מאומת על בזבוז מזון ברמת העסק (למשל קמעונאות, שירותי מזון או ייצור), בנפרד מבזבוז ברמת הצרכן.',
    },
  },
  {
    id: 'flw-environment-impacts-01',
    status: 'placeholder',
    title: {
      en: '[PLACEHOLDER] Environmental impacts of food waste',
      he: '[PLACEHOLDER] השפעות סביבתיות של בזבוז מזון',
    },
    description: {
      en: 'Editorial placeholder. Replace with a verified source on the environmental impacts of food loss and waste, noting its method and limitations.',
      he: 'מקום שמור לעריכה. יש להחליף במקור מאומת על ההשפעות הסביבתיות של אובדן ובזבוז מזון, תוך ציון השיטה והמגבלות.',
    },
  },
  {
    id: 'flw-measurement-methods-01',
    status: 'placeholder',
    title: {
      en: '[PLACEHOLDER] Methods for measuring food loss and waste',
      he: '[PLACEHOLDER] שיטות למדידת אובדן ובזבוז מזון',
    },
    description: {
      en: 'Editorial placeholder. Replace with a verified source on how food loss and waste is measured, and how measurement methods differ.',
      he: 'מקום שמור לעריכה. יש להחליף במקור מאומת על האופן שבו נמדדים אובדן ובזבוז מזון ועל ההבדלים בין שיטות המדידה.',
    },
  },
  {
    id: 'flw-prevention-approaches-01',
    status: 'placeholder',
    title: {
      en: '[PLACEHOLDER] Food waste prevention approaches',
      he: '[PLACEHOLDER] גישות למניעת בזבוז מזון',
    },
    description: {
      en: 'Editorial placeholder. Replace with a verified source on approaches to preventing food loss and waste, and what is known about how well they work.',
      he: 'מקום שמור לעריכה. יש להחליף במקור מאומת על גישות למניעת אובדן ובזבוז מזון ועל מה שידוע לגבי יעילותן.',
    },
  },
];
