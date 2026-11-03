// @ts-check
/**
 * PROJECT TIMELINE: the single data file behind the About-page timeline. Edit this file, never the component.
 *
 * Order = display order (earliest first, then the current milestone, then planned items).
 * Text may be a string (both languages) or { en, he }.
 *
 *   id           stable, unique, lowercase-kebab. Never reuse or rename casually (it is the DOM id of the item).
 *   status       'confirmed'    verified by Daphi
 *                'placeholder'  invented structure only: title/description MUST start with "[PLACEHOLDER]"
 *                               (rendered with a visible badge; listed by `npm run list:placeholders`)
 *   current      true on exactly ONE item: the milestone Daphi is working on now (checked by src/lib/timeline.ts)
 *   planned      true for something that is planned but not done (never gets a date; never presented as available)
 *   date         optional. { label, iso? }.  label is what visitors read ("Now", "Planned", "2019", "Spring 2021"...).
 *                Add `iso` ("2019" or "2019-04") to render a machine-readable <time datetime>. Leave `date` out
 *                while a date is unknown: the item then reads "Date not yet confirmed". NEVER guess a date.
 *   title        short heading
 *   description  one or two sentences
 *   link         optional { route, hash?, label }: route is a route id from src/config/routes.mjs
 *   project      optional short label of the project the item belongs to
 *
 * Unverified history is represented ONLY by explicit placeholders. No founding date, achievement,
 * partnership or future deadline may be added here until it is verified.
 *
 * To turn a placeholder into real history: replace the texts, remove the "[PLACEHOLDER]" prefix,
 * set status: 'confirmed', add the date (label + iso), done.
 *
 * @typedef {string | { en: string, he: string }} Localized
 * @typedef {Object} TimelineItem
 * @property {string} id
 * @property {'confirmed' | 'placeholder'} status
 * @property {boolean} [current]
 * @property {boolean} [planned]
 * @property {{ label: Localized, iso?: string }} [date]
 * @property {Localized} title
 * @property {Localized} description
 * @property {{ route: string, hash?: string, label: Localized }} [link]
 * @property {Localized} [project]
 */
import { sensor } from './sensor.mjs';
import { SECTION_IDS } from '../config/routes.mjs';

/** @type {TimelineItem[]} */
export const timeline = [
  // ----- Placeholder history: structure only, undated on purpose.
  {
    id: 'history-beginning',
    status: 'placeholder',
    title: {
      en: '[PLACEHOLDER] How Daphi began',
      he: '[PLACEHOLDER] איך דפי התחילה',
    },
    description: {
      en: '[PLACEHOLDER] The first milestone in Daphi’s history. Replace with a verified event and date, or delete this item.',
      he: '[PLACEHOLDER] אבן הדרך הראשונה בהיסטוריה של דפי. יש להחליף באירוע מאומת ובתאריך, או למחוק את הפריט.',
    },
  },
  {
    id: 'history-early-work',
    status: 'placeholder',
    title: {
      en: '[PLACEHOLDER] Early projects',
      he: '[PLACEHOLDER] פרויקטים ראשונים',
    },
    description: {
      en: '[PLACEHOLDER] A project or step that followed. Replace with verified content and a date, or delete this item.',
      he: '[PLACEHOLDER] פרויקט או צעד שבא אחר כך. יש להחליף בתוכן מאומת ובתאריך, או למחוק את הפריט.',
    },
  },
  {
    id: 'history-growth',
    status: 'placeholder',
    title: {
      en: '[PLACEHOLDER] A later milestone',
      he: '[PLACEHOLDER] אבן דרך מאוחרת יותר',
    },
    description: {
      en: '[PLACEHOLDER] Another step in Daphi’s development. Replace with verified content and a date, or delete this item.',
      he: '[PLACEHOLDER] עוד צעד בהתפתחות של דפי. יש להחליף בתוכן מאומת ובתאריך, או למחוק את הפריט.',
    },
  },

  // ----- Current milestone (confirmed). Title and description come from the shared sensor content.
  {
    id: 'developing-sensor',
    status: 'confirmed',
    current: true,
    date: { label: { en: 'Now', he: 'כעת' } },
    title: sensor.milestone.title,
    description: sensor.milestone.description,
    project: { en: 'Sensor development', he: 'פיתוח החיישן' },
  },

  // ----- Planned (confirmed as a plan only: not deployed, no date).
  {
    id: 'future-data-platform',
    status: 'confirmed',
    planned: true,
    date: { label: { en: 'Planned', he: 'מתוכנן' } },
    title: { en: 'A future FLW data platform', he: 'פלטפורמת נתונים עתידית על אובדן ובזבוז מזון' },
    description: {
      en: 'Daphi plans to build a platform for granular food loss and waste data. It has not been deployed and is not available for public use.',
      he: 'דפי מתכננת לבנות פלטפורמה לנתונים מפורטים על אובדן ובזבוז מזון. היא טרם הופעלה ואינה זמינה לשימוש הציבור.',
    },
    link: {
      route: 'data',
      hash: SECTION_IDS.dataExplore,
      label: { en: 'About the planned platform', he: 'על הפלטפורמה המתוכננת' },
    },
  },
];
