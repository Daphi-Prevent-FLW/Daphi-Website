// @ts-check
/**
 * ACKNOWLEDGMENTS: the editable list of contributors shown on the Acknowledgments page.
 * Edit this file, never the page or the component. Order here = order on the page.
 *
 *   id         stable, unique, lowercase-kebab
 *   status     'placeholder' (invented structure: the name MUST start with "[PLACEHOLDER]") or 'confirmed' (a real, approved entry)
 *   name       string, or { en, he } when the name is written differently in the two languages
 *   picture    OPTIONAL. Path inside /public WITHOUT a leading slash, e.g. 'assets/people/dana-levi.jpg'.
 *              Square-ish photos work best (shown as a small circle). Not found at build time = no image and no empty frame.
 *   linkedin   OPTIONAL. Full https:// URL. When present the NAME becomes the link; otherwise the name is plain text.
 *   website    OPTIONAL. Full https:// URL. Adds a website icon link.
 *   email      OPTIONAL. A plain address (no "mailto:"). Adds an email icon link.
 *
 * Every optional field simply disappears when it is missing: no image, no empty link, no "#" link, no inactive icon.
 * A value that is not a valid https:// URL (or a valid address) is treated as missing, so a typo can never become a dead link.
 *
 * Example of a finished entry (NOT real: shown only to document the shape):
 *   {
 *     id: 'example-person',
 *     status: 'confirmed',
 *     name: { en: 'Example Person', he: 'דוגמה לדוגמה' },
 *     picture: 'assets/people/example-person.jpg',
 *     linkedin: 'https://www.linkedin.com/in/example',
 *     website: 'https://example.org',
 *     email: 'person@example.org',
 *   }
 *
 * No person, picture, profile URL, website or email may be invented. The records below are placeholders
 * that show where real entries go; `npm run list:placeholders` lists them.
 *
 * @typedef {string | { en: string, he: string }} Localized
 * @typedef {Object} Acknowledgment
 * @property {string} id
 * @property {'placeholder' | 'confirmed'} status
 * @property {Localized} name
 * @property {string} [picture]
 * @property {string} [linkedin]
 * @property {string} [website]
 * @property {string} [email]
 */

/** @type {Acknowledgment[]} */
export const acknowledgments = [
  {
    id: 'placeholder-contributor-1',
    status: 'placeholder',
    name: { en: '[PLACEHOLDER] Contributor name', he: '[PLACEHOLDER] שם התורם/ת' },
  },
  {
    id: 'placeholder-contributor-2',
    status: 'placeholder',
    name: { en: '[PLACEHOLDER] Contributor name', he: '[PLACEHOLDER] שם התורם/ת' },
  },
  {
    id: 'placeholder-contributor-3',
    status: 'placeholder',
    name: { en: '[PLACEHOLDER] Contributor name', he: '[PLACEHOLDER] שם התורם/ת' },
  },
];
