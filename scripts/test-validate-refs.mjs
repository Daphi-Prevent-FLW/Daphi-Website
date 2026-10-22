// Proves the reference validator really fails on broken input (negative tests).
//   npm run test:refs      (data tests always; rendered-page tests need dist/ from `npm run build`)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { references } from '../src/data/references.mjs';
import { citations } from '../src/data/citations.mjs';
import { statPlaceholders } from '../src/data/stat-placeholders.mjs';
import { LANGS, ROUTES } from '../src/config/routes.mjs';
import en from '../src/i18n/en.ts';
import he from '../src/i18n/he.ts';
import { validateData, validateDist } from './lib/refs-core.mjs';

const clone = (x) => structuredClone(x);
const base = () => ({
  references: clone(references),
  citations: clone(citations),
  statPlaceholders: clone(statPlaceholders),
  routeIds: ROUTES.map((r) => r.id),
  sectionKeys: { en: Object.keys(en.refs.sections), he: Object.keys(he.refs.sections) },
  showPlaceholderMarkers: true,
});

let failures = 0;
function expect(name, errors, pattern) {
  const hit = pattern ? errors.some((e) => pattern.test(e)) : errors.length === 0;
  if (!hit) {
    failures++;
    console.error(`FAIL: ${name}\n  got: ${errors.length ? errors.join('\n       ') : '(no errors)'}`);
  } else console.log(`ok:   ${name}`);
}

// ---- data
expect('real data is valid', validateData(base()).errors);
{
  const d = base(); d.citations[0].ref = 'does-not-exist';
  expect('marker pointing to a missing reference', validateData(d).errors, /unknown reference/);
}
{
  const d = base(); d.references[1].id = d.references[0].id;
  expect('duplicate reference id', validateData(d).errors, /duplicate id/);
}
{
  const d = base(); d.citations[1].id = d.citations[0].id;
  expect('duplicate citation id', validateData(d).errors, /duplicate citation id/);
}
{
  const d = base(); d.references[0].id = 'Global Stats';
  expect('non-kebab id', validateData(d).errors, /lowercase-kebab/);
}
{
  const d = base(); d.references[0].id = 'global-food-loss-and-waste-statistics';
  expect('id that is a slug of the title', validateData(d).errors, /slug of the title/);
}
{
  const d = base(); d.references[0].doi = '10.1234/fake';
  expect('placeholder carrying a DOI (fabricated metadata)', validateData(d).errors, /must not carry "doi"/);
}
{
  const d = base(); d.references[0].url = 'https://example.org/x';
  expect('placeholder carrying a URL', validateData(d).errors, /must not carry "url"/);
}
{
  const d = base(); d.references[0].title = 'Global food loss and waste statistics';
  expect('placeholder without the [PLACEHOLDER] title prefix', validateData(d).errors, /must start with "\[PLACEHOLDER\]"/);
}
{
  const d = base(); d.references[0].status = 'bogus';
  expect('invalid status', validateData(d).errors, /status must be one of/);
}
{
  const d = base(); d.references[0].status = 'verified';
  expect('verified status while still titled [PLACEHOLDER]', validateData(d).errors, /still starts with "\[PLACEHOLDER\]"/);
}
{
  const d = base();
  Object.assign(d.references[0], { status: 'verified', title: 'Real title', description: 'x' });
  expect('verified without organization/year/link', validateData(d).errors, /"verified" requires/);
}
{
  const d = base();
  Object.assign(d.references[0], { status: 'needs-verification', title: 'Real title', description: 'x', doi: 'not-a-doi' });
  expect('malformed DOI', validateData(d).errors, /bare DOI/);
}
{
  const d = base(); d.citations[0].page = 'nowhere';
  expect('citation on an unknown page', validateData(d).errors, /unknown page/);
}
{
  const d = base(); d.citations[0].section = 'no-label';
  expect('citation section without a dictionary label', validateData(d).errors, /no label/);
}
{
  const d = base(); d.statPlaceholders[0].cite = 'missing';
  expect('statistic placeholder not tied to a citation', validateData(d).errors, /not tied to a citation/);
}
{
  const d = base(); d.statPlaceholders[0].description = { en: '[STAT PLACEHOLDER: about 30% of food]', he: d.statPlaceholders[0].description.he };
  expect('statistic placeholder containing a figure', validateData(d).errors, /contains a digit/);
}
{
  const d = base(); d.statPlaceholders[0].description = { en: 'a statistic', he: d.statPlaceholders[0].description.he };
  expect('statistic placeholder without [STAT PLACEHOLDER: …]', validateData(d).errors, /\[STAT PLACEHOLDER/);
}
{
  const d = base(); d.references.push({ id: 'lonely-source-01', status: 'placeholder', title: '[PLACEHOLDER] x', description: 'x' });
  expect('orphan reference warns', validateData(d).warnings, /never cited/);
}
{
  const d = base(); d.showPlaceholderMarkers = false;
  expect('markers off while placeholders remain warns', validateData(d).warnings, /showPlaceholderMarkers is false/);
}

// ---- rendered pages (mutate a copy of dist/)
const dist = path.resolve(import.meta.dirname, '..', 'dist');
if (!fs.existsSync(dist)) {
  console.log('skip: rendered-page tests (dist/ not found: run "npm run build" first)');
} else {
  const dictionaries = { en, he };
  const run = (mutate) => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'daphi-refs-'));
    fs.cpSync(dist, tmp, { recursive: true });
    const edit = (rel, fn) => {
      const f = path.join(tmp, rel);
      fs.writeFileSync(f, fn(fs.readFileSync(f, 'utf8')));
    };
    mutate(edit);
    const input = { dist: tmp, langs: [...LANGS], routes: [...ROUTES], references, citations, statPlaceholders, dictionaries };
    const result = validateDist(input);
    fs.rmSync(tmp, { recursive: true, force: true });
    return result.errors;
  };
  expect('real build output is valid', run(() => {}));
  expect('marker removed from a page', run((edit) => edit('en/index.html', (h) => h.replace('data-cite="c-home-demo-2"', 'data-x="1"'))), /declared but not rendered/);
  expect('marker with the wrong number', run((edit) => edit('en/index.html', (h) => h.replace('data-cite-number="1"', 'data-cite-number="9"'))), /shows number 9/);
  expect('backlink removed', run((edit) => edit('en/resources/index.html', (h) => h.replace('data-backlink="c-home-demo-1"', 'data-x="1"'))), /exactly one backlink/);
  expect('backlink pointing to a missing target', run((edit) => edit('he/resources/index.html', (h) => h.replace('#c-home-demo-1', '#c-home-gone'))), /backlink/);
  expect('reference entry removed from Resources', run((edit) => edit('en/resources/index.html', (h) => h.replace('id="ref-flw-business-level-01"', 'id="ref-renamed"'))), /must appear exactly once/);
  expect('placeholder entry with an external link', run((edit) => edit('en/resources/index.html', (h) => h.replace('<p class="ref__description"', '<a href="https://example.org/fake">x</a><p class="ref__description"'))), /external link/);
  expect('placeholder entry without its status label', run((edit) => edit('en/resources/index.html', (h) => h.replaceAll(en.refs.status.placeholder, 'Reference'))), /not labelled as a placeholder/);
  expect('stat placeholder removed from page', run((edit) => edit('en/flw-prevention/index.html', (h) => h.replace('data-stat-placeholder="stat-demo-global-estimate"', 'data-x="1"'))), /statistic placeholder/);
  expect('unknown marker rendered', run((edit) => edit('he/index.html', (h) => h.replace('data-cite="c-home-demo-1"', 'data-cite="c-home-demo-zzz"'))), /not in src\/data\/citations/);
  expect('page-level reference list removed', run((edit) => edit('en/flw-prevention/index.html', (h) => h.replace('class="page-refs"', 'class="other"'))), /page-level reference list/);
}

if (failures) {
  console.error(`\n${failures} validator test(s) failed`);
  process.exit(1);
}
console.log('\nreference validator tests: all passed');
