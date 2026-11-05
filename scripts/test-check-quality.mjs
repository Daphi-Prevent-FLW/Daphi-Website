// Proves the quality check really fails on bad input (mostly negative tests) and passes on a valid synthetic site.
//   npm run test:quality
// Fixtures are SYNTHETIC (in memory, plus a temp directory for the CLI tests, never committed): they say nothing about
// the real build output. Run `npm run check:quality` against a real `dist/` for that.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { analyzeQuality } from './lib/quality-core.mjs';
import { normalizeSiteUrl } from '../src/config/site-url.mjs';

const SITE = 'https://example.test';
const langs = ['en', 'he'];
const dirs = { en: 'ltr', he: 'rtl' };
const slugs = ['', 'data/'];

/** One valid localized page. `siteUrl` '' omits canonical/hreflang/og:url like the real SeoHead does. */
function localized(lang, slug, siteUrl, extraBody = '', extraHead = '') {
  const url = `/${lang}/${slug}`;
  const other = lang === 'en' ? 'he' : 'en';
  const hebrew = lang === 'he';
  const seo = siteUrl
    ? `<link rel="canonical" href="${siteUrl}${url}"><link rel="alternate" hreflang="en" href="${siteUrl}/en/${slug}"><link rel="alternate" hreflang="he" href="${siteUrl}/he/${slug}"><link rel="alternate" hreflang="x-default" href="${siteUrl}/"><meta property="og:url" content="${siteUrl}${url}">`
    : '';
  const title = hebrew ? `כותרת ${slug || 'בית'}` : `Title ${slug || 'home'}`;
  const desc = hebrew ? `תיאור ${slug || 'בית'}` : `Description ${slug || 'home'}`;
  return `<!doctype html><html lang="${lang}" dir="${dirs[lang]}"><head><meta charset="utf-8"><title>${title}</title><meta name="description" content="${desc}">${seo}` +
    `<meta property="og:type" content="website"><meta property="og:site_name" content="Daphi"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}">` +
    `<meta property="og:locale" content="${hebrew ? 'he_IL' : 'en_US'}"><meta property="og:locale:alternate" content="${hebrew ? 'en_US' : 'he_IL'}"><meta name="twitter:card" content="summary">${extraHead}</head>` +
    `<body><nav><a href="/${other}/${slug}" lang="${other}" hreflang="${other}">${other === 'he' ? 'עברית' : 'English'}</a></nav><main id="main"><h1>${title}</h1><h2 id="s1">Section</h2><h3>Sub</h3>` +
    `<a href="https://example.org/x" target="_blank" rel="noopener noreferrer">External</a><img src="/favicon.svg" alt="">${extraBody}</main></body></html>`;
}

function entryPage(siteUrl) {
  const seo = siteUrl
    ? `<link rel="alternate" hreflang="en" href="${siteUrl}/en/"><link rel="alternate" hreflang="he" href="${siteUrl}/he/"><link rel="alternate" hreflang="x-default" href="${siteUrl}/"><link rel="canonical" href="${siteUrl}/"><meta property="og:url" content="${siteUrl}/">`
    : '';
  return `<!doctype html><html lang="en" dir="ltr"><head><title>Daphi | דפי</title><meta name="description" content="Choose a language">${seo}<meta property="og:type" content="website"><meta property="og:site_name" content="Daphi"><meta property="og:title" content="Daphi"><meta property="og:description" content="Choose a language"></head><body><main><h1>Daphi | דפי</h1><a href="/en/" lang="en">English</a><a href="/he/" lang="he">עברית</a></main></body></html>`;
}
const notFound = `<!doctype html><html lang="en" dir="ltr"><head><title>Page not found | העמוד לא נמצא</title><meta name="description" content="Not found"><meta name="robots" content="noindex"></head><body><main><h1>Not found</h1></main></body></html>`;

function sitemapXml(siteUrl, urls) {
  const alt = (u) => langs.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${u.replace(/^(https?:\/\/[^/]+)\/[a-z]{2}\//, `$1/${l}/`)}"/>`).join('');
  return `<urlset xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.map((u) => `<url><loc>${u}</loc>${/\/(en|he)\//.test(u) ? alt(u) : ''}</url>`).join('')}</urlset>`;
}

/** A small valid site. siteUrl '' = the "unset" state. */
function site(siteUrl) {
  const pages = new Map([['/', entryPage(siteUrl)], ['/404.html', notFound]]);
  for (const l of langs) for (const s of slugs) pages.set(`/${l}/${s}`, localized(l, s, siteUrl));
  const files = new Set(['/favicon.svg', '/robots.txt']);
  const sitemaps = new Map();
  let robotsTxt = 'User-agent: *\nAllow: /\n';
  if (siteUrl) {
    const urls = [...pages.keys()].filter((u) => u !== '/404.html').map((u) => siteUrl + u);
    sitemaps.set('/sitemap-index.xml', `<sitemapindex><sitemap><loc>${siteUrl}/sitemap-0.xml</loc></sitemap></sitemapindex>`);
    sitemaps.set('/sitemap-0.xml', sitemapXml(siteUrl, urls));
    robotsTxt += `\nSitemap: ${siteUrl}/sitemap-index.xml\n`;
  }
  return { pages, files, texts: new Map(), siteUrl, robotsTxt, sitemaps, langs, dirs };
}

const run = (siteUrl, mutate) => {
  const s = site(siteUrl);
  mutate?.(s);
  return analyzeQuality(s);
};
const edit = (s, url, fn) => s.pages.set(url, fn(s.pages.get(url)));

let failures = 0;
let count = 0;
function expect(name, result, rule, pattern, level = 'errors') {
  count++;
  const hit = rule ? result[level].some((f) => f.rule === rule && (!pattern || pattern.test(f.message))) : result.errors.length === 0;
  if (!hit) {
    failures++;
    const all = [...result.errors, ...result.warnings].map((f) => `[${f.rule}] ${f.url}: ${f.message}`);
    console.error(`FAIL: ${name}\n  got: ${all.length ? all.join('\n       ') : '(no findings)'}`);
  } else console.log(`ok:   ${name}`);
}
const expectWarn = (name, result, rule, pattern) => expect(name, result, rule, pattern, 'warnings');

// ---- valid fixtures
expect('valid site, siteUrl set', run(SITE));
expect('valid site, siteUrl unset', run(''));
count++;
if (run(SITE).warnings.length) { failures++; console.error('FAIL: valid site must have no warnings: ' + JSON.stringify(run(SITE).warnings)); } else console.log('ok:   valid site has no warnings');

// ---- title / description / h1
expect('missing title', run('', (s) => edit(s, '/en/', (h) => h.replace(/<title>.*?<\/title>/, ''))), 'title', /found 0/);
expect('duplicate <title> tags in one file', run('', (s) => edit(s, '/en/', (h) => h.replace('</head>', '<title>x</title></head>'))), 'title', /found 2/);
expect('empty title', run('', (s) => edit(s, '/en/', (h) => h.replace(/<title>.*?<\/title>/, '<title> </title>'))), 'title', /empty/);
expect('same title on two pages', run('', (s) => edit(s, '/en/data/', (h) => h.replace(/<title>.*?<\/title>/, '<title>Title home</title>'))), 'title', /duplicate/);
expect('missing meta description', run('', (s) => edit(s, '/en/', (h) => h.replace(/<meta name="description"[^>]*>/, ''))), 'description', /found 0/);
expect('empty meta description', run('', (s) => edit(s, '/en/', (h) => h.replace(/(<meta name="description" content=")[^"]*/, '$1'))), 'description', /empty/);
expect('same description on two pages', run('', (s) => edit(s, '/en/data/', (h) => h.replace(/(<meta name="description" content=")[^"]*/, '$1Description home'))), 'description', /duplicate/);
expect('two <h1>', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<h1>again</h1></main>'))), 'h1', /found 2/);
expect('no <h1>', run('', (s) => edit(s, '/en/', (h) => h.replace('<h1>', '<p>').replace('</h1>', '</p>'))), 'h1', /found 0/);
expect('h1 inside a script does not count', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<script>var a="<h1>x</h1>"</script></main>'))));

// ---- html lang / dir
expect('<html> without lang', run('', (s) => edit(s, '/en/', (h) => h.replace(' lang="en"', ''))), 'html-lang', /no lang/);
expect('<html> without dir', run('', (s) => edit(s, '/en/', (h) => h.replace(' dir="ltr"', ''))), 'html-dir', /no dir/);
expect('lang does not match the URL', run('', (s) => edit(s, '/he/', (h) => h.replace('lang="he" dir="rtl"', 'lang="en" dir="ltr"'))), 'html-lang', /URL language is "he"/);
expect('he with dir=ltr', run('', (s) => edit(s, '/he/', (h) => h.replace('dir="rtl"', 'dir="ltr"'))), 'html-dir', /must have dir="rtl"/);
expect('unknown lang', run('', (s) => edit(s, '/en/', (h) => h.replace('lang="en"', 'lang="fr"'))), 'html-lang', /not one of/);

// ---- headings
expect('heading level skip (h3 -> h5)', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<h5>deep</h5></main>'))), 'heading-skip', /h3 to h5/);
expect('skip h2 -> h4 directly', run('', (s) => edit(s, '/en/', (h) => h.replace('<h3>Sub</h3>', '<h4>Sub</h4>'))), 'heading-skip', /h2 to h4/);
expect('going back up (h3 -> h2) is fine', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<h2>again</h2></main>'))));

// ---- images, links, ids, aria
expect('image without alt', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<img src="/favicon.svg"></main>'))), 'img-alt');
expect('alt="" is fine', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<img src="/favicon.svg" alt=""></main>'))));
expect('empty link', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<a href="/en/data/"></a></main>'))), 'link-name');
expect('link with only an empty-alt image', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<a href="/en/data/"><img src="/favicon.svg" alt=""></a></main>'))), 'link-name');
expect('link named by an image alt is fine', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<a href="/en/data/"><img src="/favicon.svg" alt="Data"></a></main>'))));
expect('link named by aria-label is fine', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<a href="/en/data/" aria-label="Data"><svg></svg></a></main>'))));
expect('icon-only link without a name', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<a href="/en/data/"><svg><path d=""/></svg></a></main>'))), 'link-name');
expect('target=_blank without rel', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<a href="https://example.org" target="_blank">x</a></main>'))), 'target-blank');
expect('target=_blank with noopener only', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<a href="https://example.org" target="_blank" rel="noopener">x</a></main>'))), 'target-blank');
expect('duplicate id', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<p id="s1"></p></main>'))), 'duplicate-id', /"s1"/);
expect('aria-labelledby to nowhere', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<section aria-labelledby="ghost"></section></main>'))), 'aria-ref', /aria-labelledby="ghost"/);
expect('aria-controls to nowhere', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<button aria-controls="ghost">x</button></main>'))), 'aria-ref', /aria-controls/);
expect('aria-describedby with one missing id', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<p aria-describedby="s1 ghost">x</p></main>'))), 'aria-ref', /"ghost"/);
expect('aria-labelledby to an existing id is fine', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<section aria-labelledby="s1"></section></main>'))));

// ---- third-party / storage / tracking
expect('external stylesheet', run('', (s) => edit(s, '/en/', (h) => h.replace('</head>', '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=X"></head>'))), 'third-party');
expect('external script', run('', (s) => edit(s, '/en/', (h) => h.replace('</head>', '<script src="https://cdn.example.com/a.js"></script></head>'))), 'third-party');
expect('protocol-relative image', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<img src="//cdn.example.com/a.png" alt=""></main>'))), 'third-party');
expect('external URL in inline CSS', run('', (s) => edit(s, '/en/', (h) => h.replace('</head>', '<style>@import url(https://x.test/a.css);</style></head>'))), 'third-party');
expect('external link <a href> is allowed', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<a href="https://example.org/y">y</a></main>'))));
expect('xmlns namespace is not a request', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<svg xmlns="http://www.w3.org/2000/svg"></svg></main>'))));
expect('inline script with localStorage', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<script>localStorage.setItem("a","b")</script></main>'))), 'storage-tracking');
expect('inline script with fetch', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<script>fetch("/x")</script></main>'))), 'storage-tracking');
expect('inline script with document.cookie', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<script>document.cookie="a=b"</script></main>'))), 'storage-tracking');
expect('inline script with an analytics vendor', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<script>var u="googletagmanager";</script></main>'))), 'storage-tracking');
expect('harmless inline script is fine', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<script>document.documentElement.classList.add("js")</script></main>'))));
expect('bundled .js with sessionStorage', run('', (s) => s.texts.set('/_astro/a.js', 'sessionStorage.x=1')), 'storage-tracking');
expect('bundled .css with a remote url()', run('', (s) => s.texts.set('/_astro/a.css', 'a{background:url(https://x.test/a.png)}')), 'third-party');
expect('bundled .css with a local font url() is fine', run('', (s) => s.texts.set('/_astro/a.css', '@font-face{src:url(/fonts/a.woff2)}')));
expectWarn('bundled .js containing a URL string warns only', run('', (s) => s.texts.set('/_astro/a.js', 'var u="https://docs.example.com/x"')), 'third-party');

// ---- robots meta
expect('404 without noindex', run('', (s) => s.pages.set('/404.html', notFound.replace('<meta name="robots" content="noindex">', ''))), 'robots-meta', /404/);
expect('normal page with noindex', run('', (s) => edit(s, '/en/', (h) => h.replace('</head>', '<meta name="robots" content="noindex,follow"></head>'))), 'robots-meta', /indexable/);

// ---- Open Graph
expect('missing og:title', run('', (s) => edit(s, '/en/', (h) => h.replace(/<meta property="og:title"[^>]*>/, ''))), 'open-graph', /og:title/);
expect('og:locale of the wrong language', run('', (s) => edit(s, '/he/', (h) => h.replace('content="he_IL"', 'content="en_US"'))), 'open-graph', /og:locale must be/);
expect('og:locale:alternate equals og:locale', run('', (s) => edit(s, '/en/', (h) => h.replace('og:locale:alternate" content="he_IL"', 'og:locale:alternate" content="en_US"'))), 'open-graph', /alternate/);
expect('missing twitter:card', run('', (s) => edit(s, '/en/', (h) => h.replace(/<meta name="twitter:card"[^>]*>/, ''))), 'open-graph', /twitter:card/);
expect('og:image with siteUrl unset', run('', (s) => edit(s, '/en/', (h) => h.replace('</head>', '<meta property="og:image" content="/assets/brand/og.png"></head>'))), 'open-graph', /siteUrl is unset/);
expect('og:url with siteUrl unset', run('', (s) => edit(s, '/en/', (h) => h.replace('</head>', '<meta property="og:url" content="/en/"></head>'))), 'open-graph', /siteUrl is unset/);
expect('og:image that does not exist in dist', run(SITE, (s) => edit(s, '/en/', (h) => h.replace('</head>', `<meta property="og:image" content="${SITE}/og.png"></head>`))), 'open-graph', /does not exist/);
expect('og:image that exists is fine', run(SITE, (s) => { s.files.add('/og.png'); edit(s, '/en/', (h) => h.replace('</head>', `<meta property="og:image" content="${SITE}/og.png"></head>`)); }));
expect('og:image relative with siteUrl set', run(SITE, (s) => { s.files.add('/og.png'); edit(s, '/en/', (h) => h.replace('</head>', '<meta property="og:image" content="/og.png"></head>')); }), 'open-graph', /not an absolute/);
expect('og:url differs from canonical', run(SITE, (s) => edit(s, '/en/', (h) => h.replace(`og:url" content="${SITE}/en/"`, `og:url" content="${SITE}/he/"`))), 'open-graph', /og:url must equal/);
expectWarn('og:title differs from <title>', run('', (s) => edit(s, '/en/', (h) => h.replace(/(og:title" content=")[^"]*/, '$1Other'))), 'open-graph', /differs/);

// ---- canonical / hreflang / x-default
expect('canonical present although siteUrl unset', run('', (s) => edit(s, '/en/', (h) => h.replace('</head>', '<link rel="canonical" href="/en/"></head>'))), 'canonical', /unset/);
expect('hreflang present although siteUrl unset', run('', (s) => edit(s, '/en/', (h) => h.replace('</head>', '<link rel="alternate" hreflang="he" href="/he/"></head>'))), 'hreflang', /unset/);
expect('missing canonical', run(SITE, (s) => edit(s, '/en/data/', (h) => h.replace(/<link rel="canonical"[^>]*>/, ''))), 'canonical', /found 0/);
expect('canonical of another page', run(SITE, (s) => edit(s, '/en/data/', (h) => h.replace(`canonical" href="${SITE}/en/data/"`, `canonical" href="${SITE}/en/"`))), 'canonical', /expected/);
expect('canonical without trailing slash', run(SITE, (s) => edit(s, '/en/data/', (h) => h.replace(`canonical" href="${SITE}/en/data/"`, `canonical" href="${SITE}/en/data"`))), 'canonical');
expect('relative canonical with siteUrl set', run(SITE, (s) => edit(s, '/en/data/', (h) => h.replace(`canonical" href="${SITE}/en/data/"`, 'canonical" href="/en/data/"'))), 'canonical');
expect('missing x-default', run(SITE, (s) => edit(s, '/en/', (h) => h.replace(/<link rel="alternate" hreflang="x-default"[^>]*>/, ''))), 'x-default');
expect('x-default pointing at /en/', run(SITE, (s) => edit(s, '/en/', (h) => h.replace(`x-default" href="${SITE}/"`, `x-default" href="${SITE}/en/"`))), 'x-default', /entry page/);
expect('entry page x-default pointing at /en/', run(SITE, (s) => edit(s, '/', (h) => h.replace(`x-default" href="${SITE}/"`, `x-default" href="${SITE}/en/"`))), 'x-default');
expect('relative hreflang with siteUrl set', run(SITE, (s) => edit(s, '/en/', (h) => h.replace(`hreflang="he" href="${SITE}/he/"`, 'hreflang="he" href="/he/"'))), 'hreflang', /not absolute/);
expect('hreflang to a page that is not in dist', run(SITE, (s) => edit(s, '/en/', (h) => h.replace(`hreflang="he" href="${SITE}/he/"`, `hreflang="he" href="${SITE}/he/nope/"`))), 'hreflang', /not in dist/);
expect('hreflang to the wrong equivalent page', run(SITE, (s) => edit(s, '/en/data/', (h) => h.replace(`hreflang="he" href="${SITE}/he/data/"`, `hreflang="he" href="${SITE}/he/"`))), 'hreflang', /should be/);
expect('missing self hreflang', run(SITE, (s) => edit(s, '/en/', (h) => h.replace(/<link rel="alternate" hreflang="en"[^>]*>/, ''))), 'hreflang', /found none/);
expect('duplicate hreflang', run(SITE, (s) => edit(s, '/en/', (h) => h.replace('</head>', `<link rel="alternate" hreflang="en" href="${SITE}/en/"></head>`))), 'hreflang', /duplicate/);
expect('hreflang not reciprocal', run(SITE, (s) => edit(s, '/he/data/', (h) => h.replace(/<link rel="alternate" hreflang="en"[^>]*>/, `<link rel="alternate" hreflang="en" href="${SITE}/en/">`))), 'hreflang', /not reciprocal|should be/);
expect('404 with a canonical', run(SITE, (s) => s.pages.set('/404.html', notFound.replace('</head>', `<link rel="canonical" href="${SITE}/404.html"></head>`))), 'canonical', /404/);

// ---- robots.txt / sitemap
expect('robots.txt missing', run('', (s) => { s.robotsTxt = null; }), 'robots', /missing/);
expect('robots.txt blocks everything', run('', (s) => { s.robotsTxt = 'User-agent: *\nDisallow: /\n'; }), 'robots', /blocks/);
expect('Sitemap line although siteUrl unset', run('', (s) => { s.robotsTxt += '\nSitemap: https://example.test/sitemap-index.xml\n'; }), 'robots', /unset/);
expect('sitemap generated although siteUrl unset', run('', (s) => s.sitemaps.set('/sitemap-0.xml', '<urlset/>')), 'sitemap', /unset/);
expect('Sitemap line missing with siteUrl set', run(SITE, (s) => { s.robotsTxt = 'User-agent: *\nAllow: /\n'; }), 'robots', /Sitemap/);
expect('Sitemap line with the wrong URL', run(SITE, (s) => { s.robotsTxt = `User-agent: *\nSitemap: ${SITE}/sitemap.xml\n`; }), 'robots', /Sitemap/);
expect('sitemap-index missing with siteUrl set', run(SITE, (s) => s.sitemaps.delete('/sitemap-index.xml')), 'sitemap', /sitemap-index.xml is missing/);
expect('page missing from the sitemap', run(SITE, (s) => s.sitemaps.set('/sitemap-0.xml', s.sitemaps.get('/sitemap-0.xml').replace(new RegExp(`<url><loc>${SITE}/he/data/</loc>.*?</url>`), ''))), 'sitemap', /missing from the sitemap/);
expect('sitemap lists the 404 page', run(SITE, (s) => s.sitemaps.set('/sitemap-0.xml', s.sitemaps.get('/sitemap-0.xml').replace('</urlset>', `<url><loc>${SITE}/404.html</loc></url></urlset>`))), 'sitemap', /not an indexable/);
expect('sitemap lists a URL that does not exist', run(SITE, (s) => s.sitemaps.set('/sitemap-0.xml', s.sitemaps.get('/sitemap-0.xml').replace('</urlset>', `<url><loc>${SITE}/en/ghost/</loc></url></urlset>`))), 'sitemap', /not an indexable/);
expectWarn('sitemap without xhtml:link alternates warns', run(SITE, (s) => s.sitemaps.set('/sitemap-0.xml', s.sitemaps.get('/sitemap-0.xml').replace(/<xhtml:link[^>]*\/>/g, ''))), 'sitemap-alternates');

// ---- language warnings
expectWarn('Hebrew page with a Latin-only title', run('', (s) => edit(s, '/he/', (h) => h.replace(/<title>.*?<\/title>/, '<title>Only Latin</title>').replace(/og:title" content="[^"]*"/, 'og:title" content="Only Latin"'))), 'hebrew-latin-only', /<title>/);
expectWarn('Hebrew page with a Latin-only description', run('', (s) => edit(s, '/he/', (h) => h.replace(/(<meta name="description" content=")[^"]*/, '$1Only Latin'))), 'hebrew-latin-only', /description/);
expectWarn('English page with Hebrew text', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<p>שלום</p></main>'))), 'english-hebrew', /Hebrew text/);
expectWarn('English title with Hebrew', run('', (s) => edit(s, '/en/data/', (h) => h.replace(/<title>.*?<\/title>/, '<title>Data דפי</title>'))), 'english-hebrew', /<title>/);
expect('Hebrew inside lang="he" on an English page is fine (switcher)', run(SITE), null);
expect('Hebrew inside a lang="he" span is fine', run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<p><span lang="he">שלום</span></p></main>'))));
count++;
{
  const r = run('', (s) => edit(s, '/en/', (h) => h.replace('</main>', '<p>שלום</p></main>')));
  if (r.errors.length) { failures++; console.error('FAIL: Hebrew text on an English page must only warn, not fail'); } else console.log('ok:   Hebrew on an English page is a warning, not an error');
}

// ---- siteUrl normalisation (src/config/site-url.mjs, used by SeoHead, robots.txt, astro.config.mjs)
{
  const throws = (v) => { try { normalizeSiteUrl(v); return false; } catch { return true; } };
  const checks = [
    ['siteUrl: empty / undefined -> unset', normalizeSiteUrl('') === '' && normalizeSiteUrl(undefined) === '' && normalizeSiteUrl('  ') === ''],
    ['siteUrl: trailing slash removed', normalizeSiteUrl('https://example.org/') === 'https://example.org'],
    ['siteUrl: invalid value throws', throws('example.org') && throws('not a url')],
    ['siteUrl: non-http protocol throws', throws('ftp://example.org')],
    ['siteUrl: path, query or fragment throws', throws('https://example.org/sub') && throws('https://example.org/?a=1') && throws('https://example.org/#x')],
  ];
  for (const [name, ok] of checks) { count++; if (!ok) { failures++; console.error(`FAIL: ${name}`); } else console.log(`ok:   ${name}`); }
}

// ---- CLI (temp dir, synthetic): skip / require-dist / pass / fail / warnings keep exit 0
const script = path.join(import.meta.dirname, 'check-quality.mjs');
const cli = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
function writeDist(dir, s) {
  for (const [url, html] of s.pages) {
    const file = url.endsWith('.html') ? path.join(dir, url) : path.join(dir, url, 'index.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html);
  }
  fs.writeFileSync(path.join(dir, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  if (s.robotsTxt !== null) fs.writeFileSync(path.join(dir, 'robots.txt'), s.robotsTxt);
}
const cliCheck = (name, ok) => { count++; if (!ok) { failures++; console.error(`FAIL: ${name}`); } else console.log(`ok:   ${name}`); };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'daphi-quality-'));
try {
  const missing = path.join(tmp, 'nothing');
  let r = cli(`--dist=${missing}`);
  cliCheck('CLI: missing dist/ is skipped (exit 0, friendly message)', r.status === 0 && /skipped/.test(r.stdout));
  r = cli(`--dist=${missing}`, '--require-dist');
  cliCheck('CLI: missing dist/ with --require-dist fails (exit 1)', r.status === 1 && /dist\/ not found/.test(r.stderr));
  const good = path.join(tmp, 'good');
  writeDist(good, site(''));
  r = cli(`--dist=${good}`);
  cliCheck('CLI: valid synthetic dist passes (exit 0, summary printed)', r.status === 0 && /Quality check passed/.test(r.stdout));
  const warnOnly = path.join(tmp, 'warn');
  const w = site('');
  edit(w, '/en/', (h) => h.replace('</main>', '<p>שלום</p></main>'));
  writeDist(warnOnly, w);
  r = cli(`--dist=${warnOnly}`);
  cliCheck('CLI: warnings are listed and keep exit 0', r.status === 0 && /Warnings \(1/.test(r.stdout) && /english-hebrew/.test(r.stdout));
  const bad = path.join(tmp, 'bad');
  const b = site('');
  edit(b, '/en/', (h) => h.replace('</main>', '<h1>second</h1></main>'));
  writeDist(bad, b);
  r = cli(`--dist=${bad}`);
  cliCheck('CLI: an error exits 1 with the rule and page in the message', r.status === 1 && /\[h1\] \/en\//.test(r.stderr));
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

if (failures) {
  console.error(`\n${failures} of ${count} quality tests FAILED`);
  process.exit(1);
}
console.log(`\nAll ${count} quality tests passed (synthetic fixtures, not the real build output).`);
