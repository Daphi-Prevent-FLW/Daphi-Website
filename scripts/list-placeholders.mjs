// Lists everything on the site that is still a placeholder, so nothing is forgotten before launch.
//   npm run list:placeholders            report (exit 0)
//   npm run list:placeholders -- --strict   exit 1 if anything remains (e.g. as a pre-launch gate)
// Covers: reference records (placeholder / needs-verification), statistic placeholders, and every
// source line containing "[PLACEHOLDER]", "[STAT PLACEHOLDER:" or `status: 'placeholder'`
// (copy in src/i18n, data files such as the timeline and acknowledgments, pages, components).
import fs from 'node:fs';
import path from 'node:path';
import { references } from '../src/data/references.mjs';
import { statPlaceholders } from '../src/data/stat-placeholders.mjs';
import { siteConfig } from '../src/config/site.config.mjs';

const root = path.resolve(import.meta.dirname, '..');
const strict = process.argv.includes('--strict');
const rel = (f) => path.relative(root, f).split(path.sep).join('/');
const title = (v) => (typeof v === 'string' ? v : v.en);

let total = 0;
const section = (heading, lines) => {
  console.log(`\n${heading} (${lines.length})`);
  if (lines.length === 0) console.log('  none');
  for (const l of lines) console.log(`  - ${l}`);
  total += lines.length;
};

console.log(`Placeholder report (showPlaceholderMarkers = ${siteConfig.showPlaceholderMarkers})`);

section(
  'References still to be replaced with real, verified sources',
  references.filter((r) => r.status === 'placeholder').map((r) => `${r.id}: ${title(r.title)}`),
);
section(
  'References added but not yet fact-checked (status "needs-verification")',
  references.filter((r) => r.status === 'needs-verification').map((r) => `${r.id}: ${title(r.title)}`),
);
section(
  'Statistic placeholders (replace with a fact-checked figure + citation)',
  statPlaceholders.map((s) => `${s.id} (page ${s.page}, section ${s.section}, cites ${s.cite})`),
);

const SKIP_FILES = new Set(['src/data/references.mjs', 'src/data/stat-placeholders.mjs', 'src/lib/placeholder.ts']);
const MARK = /\[PLACEHOLDER\]|\[STAT PLACEHOLDER:|status:\s*['"]placeholder['"]/;
const isComment = (line) => /^\s*(\*|\/\/|\/\*|<!--)/.test(line);
const found = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(ts|mjs|astro|md|json)$/.test(entry.name) && !SKIP_FILES.has(rel(full))) {
      fs.readFileSync(full, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (MARK.test(line) && !isComment(line)) found.push(`${rel(full)}:${i + 1}  ${line.trim().slice(0, 110)}`);
        });
    }
  }
})(path.join(root, 'src'));
section('Placeholder content in source files (copy, timeline, acknowledgments, pages, ...)', found);

console.log(`\nTotal placeholder items: ${total}`);
if (strict && total > 0) process.exit(1);
