// Internal link and fragment validation over the built site (dist/). Part of `npm run build` and `npm run validate`.
//   node scripts/check-links.mjs
// Checks (see scripts/lib/links-core.mjs): every root-relative link/asset resolves, every #fragment exists on its
// target page, ids are unique, aria references resolve, the language switcher leads to the equivalent page, pages only
// link to their own language, stable section ids exist once on the right page, the intent journeys exist, external
// links are https + noopener noreferrer, and the future-platform document link only renders when configured.
import fs from 'node:fs';
import path from 'node:path';
import { LANGS, SECTION_IDS, SECTION_PAGES } from '../src/config/routes.mjs';
import { siteConfig } from '../src/config/site.config.mjs';
import { analyze } from './lib/links-core.mjs';
import { JOURNEYS } from './journeys.mjs';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

const pages = new Map();
const files = new Set();
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const url = '/' + path.relative(dist, full).split(path.sep).join('/');
      if (entry.name.endsWith('.html')) {
        const pageUrl = entry.name === 'index.html' ? url.slice(0, -'index.html'.length) : url;
        pages.set(pageUrl, fs.readFileSync(full, 'utf8'));
      } else files.add(url);
    }
  }
})(dist);

const problems = [];
const sections = Object.entries(SECTION_IDS).map(([key, id]) => {
  const slug = SECTION_PAGES[key];
  if (!slug) problems.push(`SECTION_IDS.${key} has no entry in SECTION_PAGES (src/config/routes.mjs)`);
  return { key, id, slug };
});
for (const key of Object.keys(SECTION_PAGES)) if (!(key in SECTION_IDS)) problems.push(`SECTION_PAGES.${key} has no matching SECTION_IDS entry`);

const platformDocUrl = /^https:\/\//i.test((siteConfig.futurePlatformDocUrl ?? '').trim()) ? new URL(siteConfig.futurePlatformDocUrl.trim()).href : null;
const { errors, warnings, stats } = analyze({ pages, files, langs: [...LANGS], sections, journeys: JOURNEYS, platformDocUrl });
errors.unshift(...problems);

for (const w of warnings) console.log(`note: ${w}`);
if (errors.length) {
  console.error(`\nLink check FAILED (${errors.length} problem${errors.length === 1 ? '' : 's'}):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(
  `Link check passed: ${stats.pages} pages, ${stats.internalLinks} internal links (${stats.fragmentLinks} with fragments), ` +
    `${stats.journeysChecked} journey checks, ${stats.externalLinks} external links; ids unique, aria references resolve, ` +
    'language switcher and section ids OK.',
);
