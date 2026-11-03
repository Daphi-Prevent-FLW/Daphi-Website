// Guard for the "no actual statistics" rule (master prompt 9.1): the site must not publish any figure.
// Scans the VISIBLE text of every built page (tags, scripts, styles and attributes removed) and fails on
// any digit that is not an allowed one:
//   - citation markers like [3]               (rendered as <bdi>[3]</bdi>, also inside the page reference lists)
//   - the e-mail address                      (footer, contact)
//   - "(2)" suffixes of repeated backlinks     (Resources page only)
// Run after `npm run build`:  npm run check:figures   (part of `npm run validate`)
// Stage 5: About and Acknowledgments are now checked too. The ONE deliberate exception: timeline DATES. A date the owner
// supplies in src/data/timeline.mjs renders as <time datetime="...">label</time> and is removed from the About page text before
// the check (a year is history, not a statistic). Digits anywhere else on About (titles, descriptions) still fail.
import fs from 'node:fs';
import path from 'node:path';
import { LANGS, ROUTES } from '../src/config/routes.mjs';
import { siteConfig } from '../src/config/site.config.mjs';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
if (!fs.existsSync(dist)) {
  console.error('dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

const ALLOWED = [
  /\[\d+\]/g, // citation numbers
  new RegExp(siteConfig.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
];
const RESOURCES_ONLY = [/\(\d+\)/g];
const TIME_ELEMENT = /<time\b[^>]*>[\s\S]*?<\/time>/gi; // timeline dates, About page only

const visibleText = (html) =>
  html
    .replace(/<(script|style|svg)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<head\b[\s\S]*?<\/head>/i, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x?[0-9a-f]+;/gi, ' ') // numeric entities
    .replace(/&[a-z]+;/gi, ' ');

const problems = [];
let pages = 0;
for (const lang of LANGS) {
  for (const route of ROUTES) {
    const file = path.join(dist, lang, route.slug, 'index.html');
    if (!fs.existsSync(file)) continue;
    pages++;
    let html = fs.readFileSync(file, 'utf8');
    if (route.id === 'about') html = html.replace(TIME_ELEMENT, ' ');
    let text = visibleText(html);
    for (const re of [...ALLOWED, ...(route.id === 'resources' ? RESOURCES_ONLY : [])]) text = text.replace(re, ' ');
    for (const m of text.matchAll(/\S*\d\S*/g)) problems.push(`/${lang}/${route.slug ? route.slug + '/' : ''}: "${m[0]}"`);
  }
}
if (problems.length) {
  console.error(`Figure check FAILED: digits found in visible text (no statistics may be published):`);
  for (const p of problems) console.error('  - ' + p);
  process.exit(1);
}
console.log(`Figure check passed: no digits in the visible text of ${pages} pages (citation numbers and the e-mail address excluded).`);
