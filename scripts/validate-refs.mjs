// Reference / citation validation. Run as part of `npm run build` (after astro build) or alone:
//   npm run validate:refs                 data checks, plus rendered-page checks if dist/ exists
//   node scripts/validate-refs.mjs --require-dist   fail if dist/ is missing (used by the build)
// Exits 1 on errors; prints a readable report.
import fs from 'node:fs';
import path from 'node:path';
import { references } from '../src/data/references.mjs';
import { citations } from '../src/data/citations.mjs';
import { statPlaceholders } from '../src/data/stat-placeholders.mjs';
import { LANGS, ROUTES } from '../src/config/routes.mjs';
import { siteConfig } from '../src/config/site.config.mjs';
import en from '../src/i18n/en.ts';
import he from '../src/i18n/he.ts';
import { validateData, validateDist } from './lib/refs-core.mjs';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
const requireDist = process.argv.includes('--require-dist');
const dictionaries = { en, he };

const data = validateData({
  references,
  citations,
  statPlaceholders,
  routeIds: ROUTES.map((r) => r.id),
  sectionKeys: { en: Object.keys(en.refs.sections), he: Object.keys(he.refs.sections) },
  showPlaceholderMarkers: siteConfig.showPlaceholderMarkers,
});
const errors = [...data.errors];
const warnings = [...data.warnings];

let renderedChecked = false;
if (fs.existsSync(dist)) {
  errors.push(
    ...validateDist({ dist, langs: [...LANGS], routes: [...ROUTES], references, citations, statPlaceholders, dictionaries }).errors,
  );
  renderedChecked = true;
} else if (requireDist) {
  errors.push('dist/ not found: run "astro build" first');
} else {
  warnings.push('dist/ not found: rendered-page checks skipped (run "npm run build")');
}

const count = (status) => references.filter((r) => r.status === status).length;
console.log('Reference validation');
console.log(
  `  registry: ${references.length} references (${count('placeholder')} placeholder, ${count('needs-verification')} needs-verification, ${count('verified')} verified); ` +
    `${citations.length} citation markers; ${statPlaceholders.length} statistic placeholder(s)`,
);
console.log(`  rendered pages checked: ${renderedChecked ? `yes (${LANGS.length * ROUTES.length} pages)` : 'no'}`);
for (const w of warnings) console.log(`  warning: ${w}`);
if (errors.length) {
  console.error(`\nReference validation FAILED (${errors.length} error${errors.length === 1 ? '' : 's'}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('  result: OK');
