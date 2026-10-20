// Post-build route/structure/link check. Runs after `astro build` (see package.json "build").
//   node scripts/check-routes.mjs
// Verifies, for every language x page: the file exists, <html lang dir> is correct, one <h1>,
// title + description, hreflang (+ x-default), skip link, <main id="main">, mailto links are well-formed,
// and every root-relative href/src (incl. #fragments) resolves inside dist/.
import fs from 'node:fs';
import path from 'node:path';
import { LANGS, DIRS, ROUTES } from '../src/config/routes.mjs';
import { siteConfig } from '../src/config/site.config.mjs';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
const errors = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

const read = (file) => fs.readFileSync(file, 'utf8');
const pageFile = (lang, slug) => path.join(dist, lang, slug, 'index.html');
const cache = new Map();
const htmlOf = (file) => (cache.has(file) ? cache.get(file) : (cache.set(file, read(file)), cache.get(file)));

/** Resolve a root-relative URL to a file in dist/ (or null). */
function resolveUrl(urlPath) {
  const clean = decodeURIComponent(urlPath);
  const candidates = clean.endsWith('/')
    ? [path.join(dist, clean, 'index.html')]
    : [path.join(dist, clean), path.join(dist, clean, 'index.html')];
  return candidates.find((c) => fs.existsSync(c) && fs.statSync(c).isFile()) ?? null;
}

const pages = [];
for (const lang of LANGS) {
  for (const route of ROUTES) {
    const file = pageFile(lang, route.slug);
    const label = `/${lang}/${route.slug ? route.slug + '/' : ''}`;
    if (!fs.existsSync(file)) {
      err(label, 'page missing from build output');
      continue;
    }
    pages.push({ lang, route, file, label });
  }
}
for (const extra of ['index.html', '404.html', 'robots.txt', 'favicon.svg', '_headers']) {
  if (!fs.existsSync(path.join(dist, extra))) err(extra, 'missing from build output');
}

const mailtoRe = /^mailto:[^\s@?]+@[^\s@?]+\.[^\s@?]+(\?(subject|body)=[^&\s]*(&(subject|body)=[^&\s]*)?)?$/;

for (const { lang, route, file, label } of pages) {
  const html = htmlOf(file);

  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
  if (!new RegExp(`\\blang="?${lang}"?`).test(htmlTag)) err(label, `<html> lang is not "${lang}"`);
  if (!new RegExp(`\\bdir="?${DIRS[lang]}"?`).test(htmlTag)) err(label, `<html> dir is not "${DIRS[lang]}"`);

  const h1s = html.match(/<h1\b/gi) ?? [];
  if (h1s.length !== 1) err(label, `expected exactly 1 <h1>, found ${h1s.length}`);
  if (!/<title>[^<]+<\/title>/i.test(html)) err(label, 'missing/empty <title>');
  if (!/<meta name="?description"? content="?[^">]+/i.test(html)) err(label, 'missing meta description');
  for (const code of [...LANGS, 'x-default']) {
    if (!new RegExp(`<link rel="?alternate"? hreflang="?${code}"?`, 'i').test(html)) err(label, `missing hreflang="${code}"`);
  }
  if (!/class="?skip-link/.test(html) || !/href="?#main/.test(html)) err(label, 'missing skip link');
  if (!/<main\b[^>]*\bid="?main"?/.test(html)) err(label, 'missing <main id="main">');
  if (!siteConfig.siteUrl && /rel="?canonical/i.test(html)) err(label, 'canonical present although siteUrl is unset');
  if (route.inNav && route.id !== 'home' && !/aria-current="?page"?/.test(html)) err(label, 'no aria-current="page" in navigation');

  // Hard rules from the brief: no empty / "#" links.
  if (/href=(""|''|"#"|'#')/.test(html)) err(label, 'empty or "#" href found');
  if (/#000000|#000\b|#ffffff|#fff\b/i.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) {
    err(label, 'pure black/white hard-coded in markup');
  }

  // Links and assets.
  for (const m of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (url.startsWith('mailto:')) {
      if (!mailtoRe.test(url)) err(label, `malformed mailto: ${url}`);
      continue;
    }
    if (!url.startsWith('/') || url.startsWith('//')) continue; // external / protocol links
    const [pathPart, hash] = url.split('#');
    const target = pathPart ? resolveUrl(pathPart.split('?')[0]) : file;
    if (!target) {
      err(label, `broken internal link: ${url}`);
      continue;
    }
    if (hash && target.endsWith('.html')) {
      if (!new RegExp(`\\bid="${hash}"`).test(htmlOf(target))) err(label, `missing fragment target: ${url}`);
    }
  }
}

if (errors.length) {
  console.error(`\nRoute check FAILED (${errors.length} problem${errors.length === 1 ? '' : 's'}):`);
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}
console.log(
  `Route check passed: ${pages.length} localized pages (${LANGS.join(', ')}) + root, 404 and static files verified; ` +
    'lang/dir, headings, metadata, hreflang, skip links, mailto format and internal links/fragments OK.',
);
