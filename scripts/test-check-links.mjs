// Proves the link validator really fails on broken input (negative tests), and passes on the built site.
//   npm run test:links      (the last test needs dist/ from `npm run build`)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { analyze } from './lib/links-core.mjs';

const langs = ['en', 'he'];
const sections = [{ key: 'dataShare', id: 'share-data', slug: 'data' }];
const journeys = [{ label: 'tile', from: '/{lang}/', href: '/{lang}/data/#share-data' }];
const docBlock = (state, link = '') => `<ul><li data-action="platform-doc" data-state="${state}">${link}</li></ul>`;
const page = (lang, slug, body = '', switchHref) => {
  const other = lang === 'en' ? 'he' : 'en';
  const rest = slug ? `/${slug}/` : '/';
  return `<html><body><nav><a href="/${lang}${rest}" hreflang="${lang}" data-lang-switch>x</a><a href="/${other}${rest}" hreflang="${other}" data-lang-switch>y</a></nav>${body}</body></html>`.replace(
    `href="/${other}${rest}"`,
    `href="${switchHref ?? `/${other}${rest}`}"`,
  );
};
/** A small valid site; each test mutates a copy. */
const site = () => {
  const pages = new Map();
  for (const l of langs) {
    pages.set(`/${l}/`, page(l, '', `<a href="/${l}/data/#share-data">tile</a>`));
    pages.set(`/${l}/data/`, page(l, 'data', `<h2 id="share-data">s</h2>${docBlock('missing')}`));
  }
  return { pages, files: new Set(['/favicon.svg']) };
};
const run = (mutate, extra = {}) => {
  const s = site();
  mutate?.(s);
  return analyze({ ...s, langs, sections, journeys, platformDocUrl: null, ...extra });
};

let failures = 0;
function expect(name, result, pattern) {
  const hit = pattern ? result.errors.some((e) => pattern.test(e)) : result.errors.length === 0;
  if (!hit) {
    failures++;
    console.error(`FAIL: ${name}\n  got: ${result.errors.length ? result.errors.join('\n       ') : '(no errors)'}`);
  } else console.log(`ok:   ${name}`);
}
const edit = (s, url, fn) => s.pages.set(url, fn(s.pages.get(url)));

expect('valid synthetic site', run());
expect('broken internal link', run((s) => edit(s, '/en/', (h) => h + '<a href="/en/nope/">x</a>')), /broken internal link/);
expect('missing fragment on another page', run((s) => edit(s, '/en/', (h) => h + '<a href="/en/data/#nothing">x</a>')), /missing fragment target "#nothing"/);
expect('missing fragment on the same page', run((s) => edit(s, '/en/', (h) => h + '<a href="#nothing">x</a>')), /missing fragment target/);
expect('empty fragment', run((s) => edit(s, '/en/', (h) => h + '<a href="/en/data/#">x</a>')), /empty fragment/);
expect('"#" link', run((s) => edit(s, '/en/', (h) => h + '<a href="#">x</a>')), /empty or "#" link/);
expect('link without trailing slash', run((s) => edit(s, '/en/', (h) => h + '<a href="/en/data">x</a>')), /trailing slash/);
expect('relative link', run((s) => edit(s, '/en/', (h) => h + '<a href="data/">x</a>')), /relative link/);
expect('javascript: link', run((s) => edit(s, '/en/', (h) => h + '<a href="javascript:void(0)">x</a>')), /javascript:/);
expect('missing asset', run((s) => edit(s, '/en/', (h) => h + '<img src="/missing.png" alt="">')), /broken internal link/);
expect('existing asset is fine', run((s) => edit(s, '/en/', (h) => h + '<img src="/favicon.svg" alt="">')));
expect('duplicate id', run((s) => edit(s, '/en/data/', (h) => h + '<p id="share-data"></p>')), /duplicate id/);
expect('aria-labelledby to nowhere', run((s) => edit(s, '/en/', (h) => h + '<section aria-labelledby="ghost"></section>')), /aria-labelledby="ghost"/);
expect('aria-controls to nowhere', run((s) => edit(s, '/en/', (h) => h + '<button aria-controls="ghost"></button>')), /aria-controls/);
expect('link into the other language outside the switcher', run((s) => edit(s, '/en/', (h) => h + '<a href="/he/data/">x</a>')), /other language/);
expect('language switcher goes to the wrong page', run((s) => s.pages.set('/en/data/', page('en', 'data', `<h2 id="share-data">s</h2>${docBlock('missing')}`, '/he/'))), /expected \/he\/data\//);
expect('section id missing', run((s) => edit(s, '/he/data/', (h) => h.replace('id="share-data"', ''))), /found 0 times/);
expect('section id on a missing page', run((s) => s.pages.delete('/he/data/')), /page for section/);
expect('journey link removed', run((s) => edit(s, '/he/', (h) => h.replace('/he/data/#share-data', '/he/data/'))), /journey "tile": no link/);
expect('external link without rel', run((s) => edit(s, '/en/', (h) => h + '<a href="https://example.org/">x</a>')), /noopener noreferrer/);
expect('external link with rel is fine', run((s) => edit(s, '/en/', (h) => h + '<a href="https://example.org/" rel="noopener noreferrer">x</a>')));
expect('external http link', run((s) => edit(s, '/en/', (h) => h + '<a href="http://example.org/" rel="noopener noreferrer">x</a>')), /not https/);
expect('target=_blank without noopener', run((s) => edit(s, '/en/', (h) => h + '<a href="/en/data/" target="_blank">x</a>')), /target="_blank"/);
expect('platform doc link rendered although URL unset', run((s) => edit(s, '/en/data/', (h) => h.replace(docBlock('missing'), docBlock('linked', '<a href="https://docs.google.com/x" rel="noopener noreferrer">d</a>')))), /not set but/);
expect('platform doc missing-state marker removed', run((s) => edit(s, '/en/data/', (h) => h.replace('data-state="missing"', ''))), /missing-URL state/);
expect('platform doc action removed', run((s) => edit(s, '/en/data/', (h) => h.replace(docBlock('missing'), ''))), /platform-doc/);
const url = 'https://docs.google.com/document/d/example/edit';
const withDoc = (s) => {
  for (const l of langs) edit(s, `/${l}/data/`, (h) => h.replace(docBlock('missing'), docBlock('linked', `<a href="${url}" rel="noopener noreferrer">d</a>`)));
};
expect('platform doc configured and linked', run(withDoc, { platformDocUrl: url }));
expect('platform doc configured but not linked', run(null, { platformDocUrl: url }), /has no link to it/);
expect('links inside <script> and comments are ignored', run((s) => edit(s, '/en/', (h) => h + '<script>var a="<a href=\'/en/nope/\'>"</script><!-- <a href="/en/nope/"> -->')));
expect('unquoted attributes are understood', run((s) => edit(s, '/en/', (h) => h + '<a href=/en/nope/>x</a>')), /broken internal link/);

// The real build.
const dist = path.resolve(import.meta.dirname, '..', 'dist');
if (fs.existsSync(dist)) {
  const r = spawnReal();
  expect('built site passes the link check', r);
} else console.log('skip: built site (no dist/; run "npm run build" first)');

function spawnReal() {
  // Re-use the CLI so the test covers the real wiring (config, journeys, section map).
  const out = spawnSync(process.execPath, [path.join(import.meta.dirname, 'check-links.mjs')], { encoding: 'utf8' });
  return { errors: out.status === 0 ? [] : [out.stderr || out.stdout] };
}

if (failures) {
  console.error(`\n${failures} link-check test(s) failed.`);
  process.exit(1);
}
console.log('\nAll link-check tests passed.');
