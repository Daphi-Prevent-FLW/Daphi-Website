// Quality check over the built site (dist/): SEO metadata, language/direction, headings, accessibility basics,
// hreflang/canonical/sitemap/robots consistency, third-party requests. Node only, no dependencies.
//   node scripts/check-quality.mjs                 (skips with a message when dist/ does not exist)
//   node scripts/check-quality.mjs --require-dist  (fails when dist/ does not exist)
//   node scripts/check-quality.mjs --dist=<dir>    (check another directory; used by test:quality)
// Exit 1 on any ERROR; warnings are listed and do not fail. HTML is scanned with regular expressions (same approach as
// check-links.mjs), not a full HTML parser. Rules live in scripts/lib/quality-core.mjs and are proven by `npm run test:quality`.
import fs from 'node:fs';
import path from 'node:path';
import { LANGS, DIRS } from '../src/config/routes.mjs';
import { siteConfig } from '../src/config/site.config.mjs';
import { normalizeSiteUrl } from '../src/config/site-url.mjs';
import { analyzeQuality } from './lib/quality-core.mjs';

const requireDist = process.argv.includes('--require-dist');
const distArg = process.argv.find((a) => a.startsWith('--dist='))?.slice('--dist='.length);
const dist = distArg ? path.resolve(distArg) : path.resolve(import.meta.dirname, '..', 'dist');
if (!fs.existsSync(dist)) {
  if (requireDist) {
    console.error('dist/ not found (--require-dist). Run "npm run build" first.');
    process.exit(1);
  }
  console.log('check:quality skipped: dist/ not found (run "npm run build" first; use --require-dist to make this an error).');
  process.exit(0);
}

let siteUrl;
try {
  siteUrl = normalizeSiteUrl(siteConfig.siteUrl);
} catch (e) {
  console.error(`Quality check FAILED: ${e.message}`);
  process.exit(1);
}

const pages = new Map();
const files = new Set();
const texts = new Map();
const sitemaps = new Map();
let robotsTxt = null;
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    const url = '/' + path.relative(dist, full).split(path.sep).join('/');
    if (entry.name.endsWith('.html')) pages.set(entry.name === 'index.html' ? url.slice(0, -'index.html'.length) : url, fs.readFileSync(full, 'utf8'));
    else {
      files.add(url);
      if (url === '/robots.txt') robotsTxt = fs.readFileSync(full, 'utf8');
      if (/^\/sitemap[^/]*\.xml$/.test(url)) sitemaps.set(url, fs.readFileSync(full, 'utf8'));
      if (url.endsWith('.css') || url.endsWith('.js')) texts.set(url, fs.readFileSync(full, 'utf8'));
    }
  }
})(dist);

const { errors, warnings, stats } = analyzeQuality({ pages, files, texts, siteUrl, robotsTxt, sitemaps, langs: [...LANGS], dirs: DIRS });

const line = (f) => `  [${f.rule}] ${f.url}: ${f.message}`;
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}, do not fail the check):`);
  for (const w of warnings) console.log(line(w));
}
const rules = Object.entries(stats.rules).sort(([a], [b]) => a.localeCompare(b));
console.log(`\nQuality check: ${stats.pages} pages, siteUrl ${siteUrl || '(unset: no canonical/hreflang/sitemap expected)'}`);
if (rules.length) {
  console.log('  rule                 errors  warnings');
  for (const [rule, c] of rules) console.log(`  ${rule.padEnd(20)} ${String(c.errors).padStart(6)}  ${String(c.warnings).padStart(8)}`);
}
if (errors.length) {
  console.error(`\nQuality check FAILED (${errors.length} error${errors.length === 1 ? '' : 's'}):`);
  for (const e of errors) console.error(line(e));
  process.exit(1);
}
console.log(`Quality check passed (${warnings.length} warning${warnings.length === 1 ? '' : 's'}).`);
