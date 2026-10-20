// Copies the self-hosted font files (latin + hebrew subsets) from @fontsource into public/fonts.
// The copied files ARE committed, so the site builds without running this; run it only to refresh them:
//   npm run sync:fonts
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'public', 'fonts');
fs.mkdirSync(out, { recursive: true });

const files = [
  ['@fontsource/secular-one', 'secular-one-latin-400-normal.woff2'],
  ['@fontsource/secular-one', 'secular-one-hebrew-400-normal.woff2'],
  ['@fontsource/varela-round', 'varela-round-latin-400-normal.woff2'],
  ['@fontsource/varela-round', 'varela-round-hebrew-400-normal.woff2'],
];

for (const [pkg, file] of files) {
  const src = path.join(root, 'node_modules', pkg, 'files', file);
  if (!fs.existsSync(src)) {
    console.error(`Missing ${src}. Run "npm install" first.`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(out, file));
  console.log(`copied ${file}`);
}
