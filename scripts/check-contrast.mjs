// WCAG contrast check for the design-token colour pairs. Reads src/styles/tokens.css, so tokens and
// documentation cannot drift apart.   npm run check:contrast
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.resolve(import.meta.dirname, '../src/styles/tokens.css'), 'utf8');
const color = (name) => {
  const m = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${name} not found / not a hex colour`);
  return m[1];
};

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [label, foreground token, background token, required ratio]
const pairs = [
  ['body text on background', 'color-text', 'color-bg', 4.5],
  ['body text on surface', 'color-text', 'color-surface', 4.5],
  ['secondary text (accent-text) on background', 'color-accent-text', 'color-bg', 4.5],
  ['secondary text (accent-text) on surface', 'color-accent-text', 'color-surface', 4.5],
  ['light text on strong panel', 'color-on-strong', 'color-strong', 4.5],
  ['accent borders/icons on background (3:1 UI)', 'color-accent', 'color-bg', 3],
  ['accent borders on surface (3:1 UI)', 'color-accent', 'color-surface', 3],
  ['large text on accent panel (3:1 large only)', 'color-on-panel', 'color-panel', 3],
  ['focus ring on background (3:1)', 'color-text', 'color-bg', 3],
];

let failed = 0;
for (const [label, fg, bg, min] of pairs) {
  const r = ratio(color(fg), color(bg));
  const ok = r >= min;
  if (!ok) failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2)}:1 (need ${min}:1)  ${label}  [${color(fg)} on ${color(bg)}]`);
}
// Documented limitation: brand accent on cream is NOT valid for small text.
const accentSmall = ratio(color('color-accent'), color('color-bg'));
console.log(`NOTE  accent on background is ${accentSmall.toFixed(2)}:1: reserved for borders, icons and large text only.`);
process.exit(failed ? 1 : 0);
