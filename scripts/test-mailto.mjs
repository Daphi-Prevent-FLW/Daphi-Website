// Sanity test for the shared mailto helper (Node's built-in TypeScript stripping).   npm run test:mailto
import assert from 'node:assert/strict';
import { buildMailto } from '../src/lib/mailto.ts';

const a = buildMailto({ subject: "Funding support for Daphi's sensor development", body: 'Hello,\nI am interested.' });
assert.equal(
  a,
  'mailto:daphi.dnw@gmail.com?subject=Funding%20support%20for%20Daphi%27s%20sensor%20development&body=Hello%2C%0D%0AI%20am%20interested.',
);

const he = buildMailto({ subject: 'תמיכה בפיתוח', body: 'שלום' });
assert.ok(he.startsWith('mailto:daphi.dnw@gmail.com?subject=%D7%AA'), 'Hebrew is percent-encoded');
assert.ok(!/[ +]/.test(he), 'no raw spaces or plus signs');
assert.equal(buildMailto(), 'mailto:daphi.dnw@gmail.com');
assert.throws(() => buildMailto({ to: 'not-an-email' }));
assert.equal(decodeURIComponent(new URL(a).searchParams.get('subject')), "Funding support for Daphi's sensor development");

console.log('mailto helper: all checks passed');
