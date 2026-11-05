// Pure logic of the built-site quality check (no file system access, so the tests can feed it synthetic pages).
// scripts/check-quality.mjs reads dist/ and calls analyzeQuality(); scripts/test-check-quality.mjs proves each rule fails.
//
// METHOD: regex-based HTML scanning (like links-core.mjs), NOT a full HTML parser. It is tuned for the markup Astro emits
// (double-quoted attributes, no unclosed tags). Odd markup can produce false positives or negatives; see ISSUES.md.
//
// Input
//   pages:     Map<urlPath, html>    '/' (language entry), '/en/', '/he/data/', '/404.html'
//   files:     Set<urlPath>          every non-HTML file in dist ('/favicon.svg', '/sitemap-0.xml', ...)
//   texts:     Map<urlPath, string>  contents of .css and .js files in dist (scanned for third-party URLs / storage / tracking)
//   siteUrl:   string                normalised origin or '' (unset)
//   robotsTxt: string | null
//   sitemaps:  Map<urlPath, xml>     every sitemap*.xml in dist
//   langs, dirs                      e.g. ['en','he'], { en:'ltr', he:'rtl' }
// Output { errors, warnings, stats }; each finding is { rule, url, message }.
import { parseAttrs, startTags } from './links-core.mjs';

const STRIP = /<(script|style)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->/gi;
const HEBREW = /[\u0590-\u05FF]/;
const LATIN = /[A-Za-z]/;
const SPECIAL = new Set(['/', '/404.html']); // entry page and 404 are bilingual: no single page language
const SITEMAP_NAME = /^\/sitemap[^/]*\.xml$/;
const normText = (s) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export const pageLang = (url, langs) => langs.find((l) => url === `/${l}/` || url.startsWith(`/${l}/`)) ?? null;

/** Facts about one page, extracted once. */
export function inspectPage(html) {
  const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] ?? '';
  const htmlAttrs = parseAttrs(htmlTag);
  const tags = startTags(html);
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decode(m[1]).trim());
  const metaByName = (name) => tags.filter((t) => t.name === 'meta' && (t.attrs.name ?? '').toLowerCase() === name);
  const metaByProp = (prop) => tags.filter((t) => t.name === 'meta' && (t.attrs.property ?? '').toLowerCase() === prop);
  const links = (rel) => tags.filter((t) => t.name === 'link' && (t.attrs.rel ?? '').toLowerCase().split(/\s+/).includes(rel));
  return { htmlAttrs, tags, titles, metaByName, metaByProp, links };
}

/** Accessible-name check for <a href> (text, aria-label, aria-labelledby, or an <img> with non-empty alt / svg <title>). */
function anchorsWithoutName(html) {
  const clean = html.replace(STRIP, ' ');
  const bad = [];
  for (const m of clean.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attrs = parseAttrs(`<a ${m[1]}>`);
    if (!('href' in attrs)) continue;
    if ((attrs['aria-label'] ?? '').trim() || (attrs['aria-labelledby'] ?? '').trim()) continue;
    const inner = m[2]
      .replace(/<img\b[^>]*>/gi, (img) => ` ${parseAttrs(img).alt ?? ''} `)
      .replace(/<svg\b[\s\S]*?<\/svg>/gi, (svg) => ` ${svg.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''} `);
    if (!normText(inner)) bad.push(`<a href="${attrs.href}">`);
  }
  return bad;
}

const HEADING = /^h([1-6])$/;
const EXTERNAL = /^(?:https?:)?\/\//i;
// Attributes that make the browser REQUEST something (an <a href> is only a link and is allowed).
const REQUEST_ATTRS = { link: ['href'], script: ['src'], img: ['src', 'srcset'], source: ['src', 'srcset'], iframe: ['src'], video: ['src', 'poster'], audio: ['src'], embed: ['src'], object: ['data'], form: ['action'], input: ['src'], track: ['src'] };
const STORAGE_OR_TRACKING = /\b(localStorage|sessionStorage|indexedDB|XMLHttpRequest|sendBeacon)\b|document\.cookie|\bfetch\s*\(|google-analytics|googletagmanager|gtag\s*\(|\bga\s*\(\s*['"]|fbq\s*\(|hotjar|plausible|matomo|segment\.com|mixpanel|clarity\.ms/i;
const W3C_NS = /^https?:\/\/www\.w3\.org\/(?:1999|2000|1998)\//; // xmlns values are not requests

export function analyzeQuality({ pages, files = new Set(), texts = new Map(), siteUrl = '', robotsTxt = null, sitemaps = new Map(), langs = ['en', 'he'], dirs = { en: 'ltr', he: 'rtl' } }) {
  const errors = [];
  const warnings = [];
  const err = (rule, url, message) => errors.push({ rule, url, message });
  const warn = (rule, url, message) => warnings.push({ rule, url, message });
  const info = new Map();
  for (const [url, html] of pages) info.set(url, inspectPage(html));
  const titleSeen = new Map();
  const descSeen = new Map();

  for (const [url, html] of pages) {
    const p = info.get(url);
    const lang = pageLang(url, langs);
    const special = SPECIAL.has(url);
    const clean = html.replace(STRIP, ' ');

    // --- title / description / h1 ---
    if (p.titles.length !== 1) err('title', url, `expected exactly 1 <title>, found ${p.titles.length}`);
    else if (!p.titles[0]) err('title', url, 'empty <title>');
    else titleSeen.set(p.titles[0], [...(titleSeen.get(p.titles[0]) ?? []), url]);
    const descs = p.metaByName('description');
    if (descs.length !== 1) err('description', url, `expected exactly 1 meta description, found ${descs.length}`);
    else if (!(descs[0].attrs.content ?? '').trim()) err('description', url, 'empty meta description');
    else descSeen.set(descs[0].attrs.content.trim(), [...(descSeen.get(descs[0].attrs.content.trim()) ?? []), url]);
    const h1s = p.tags.filter((t) => t.name === 'h1').length;
    if (h1s !== 1) err('h1', url, `expected exactly 1 <h1>, found ${h1s}`);

    // --- html lang / dir ---
    const { lang: hl, dir: hd } = p.htmlAttrs;
    if (!hl) err('html-lang', url, '<html> has no lang attribute');
    if (!hd) err('html-dir', url, '<html> has no dir attribute');
    if (hl && !langs.includes(hl)) err('html-lang', url, `<html lang="${hl}"> is not one of ${langs.join(', ')}`);
    if (hd && !['ltr', 'rtl'].includes(hd)) err('html-dir', url, `<html dir="${hd}"> must be ltr or rtl`);
    if (hl && hd && dirs[hl] && hd !== dirs[hl]) err('html-dir', url, `lang="${hl}" must have dir="${dirs[hl]}" (found "${hd}")`);
    if (lang && hl && hl !== lang) err('html-lang', url, `URL language is "${lang}" but <html lang="${hl}">`);

    // --- heading levels ---
    let prev = 0;
    for (const t of p.tags) {
      const m = HEADING.exec(t.name);
      if (!m) continue;
      const level = Number(m[1]);
      if (prev && level > prev + 1) err('heading-skip', url, `heading level skips from h${prev} to h${level}`);
      prev = level;
    }

    // --- images, links, ids, aria ---
    for (const t of p.tags) if (t.name === 'img' && !('alt' in t.attrs)) err('img-alt', url, `<img src="${t.attrs.src ?? ''}"> has no alt attribute (use alt="" for decorative images)`);
    for (const bad of anchorsWithoutName(html)) err('link-name', url, `link without an accessible name: ${bad}`);
    for (const t of p.tags) {
      if ((t.attrs.target ?? '').toLowerCase() !== '_blank') continue;
      const rel = (t.attrs.rel ?? '').toLowerCase().split(/\s+/);
      if (!rel.includes('noopener') || !rel.includes('noreferrer')) err('target-blank', url, `target="_blank" without rel="noopener noreferrer": <${t.name} href="${t.attrs.href ?? ''}">`);
    }
    const ids = new Map();
    for (const t of p.tags) if (t.attrs.id !== undefined) ids.set(t.attrs.id, (ids.get(t.attrs.id) ?? 0) + 1);
    for (const [id, n] of ids) if (n > 1) err('duplicate-id', url, `duplicate id "${id}" (${n}x)`);
    for (const t of p.tags)
      for (const attr of ['aria-labelledby', 'aria-controls', 'aria-describedby'])
        for (const ref of (t.attrs[attr] ?? '').split(/\s+/).filter(Boolean)) if (!ids.has(ref)) err('aria-ref', url, `${attr}="${ref}" points to a missing id`);

    // --- third-party requests, storage, tracking ---
    // startTags() drops <script>...</script> blocks, so script tags are read separately from the raw HTML.
    const scriptTags = [...html.replace(/<!--[\s\S]*?-->/g, ' ').matchAll(/<script\b[^>]*>/gi)].map((m) => ({ name: 'script', attrs: parseAttrs(m[0]) }));
    for (const t of [...p.tags.filter((x) => x.name !== 'script'), ...scriptTags]) {
      // canonical/alternate <link>s are references, not requests (their absolute-ness is checked below)
      if (t.name === 'link' && /\b(canonical|alternate)\b/i.test(t.attrs.rel ?? '')) continue;
      for (const attr of REQUEST_ATTRS[t.name] ?? []) {
        const v = t.attrs[attr];
        if (v && EXTERNAL.test(v.trim())) err('third-party', url, `<${t.name} ${attr}="${v}"> loads an external resource (no external fonts, scripts, images or styles)`);
      }
    }
    for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi))
      for (const u of m[1].matchAll(/(?:url\(\s*['"]?|@import\s+['"]?)((?:https?:)?\/\/[^'")\s]+)/gi)) err('third-party', url, `inline CSS references ${u[1]}`);
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const type = (parseAttrs(`<script ${m[1]}>`).type ?? '').toLowerCase();
      if (type === 'application/ld+json') continue;
      const hit = m[2].match(STORAGE_OR_TRACKING);
      if (hit) err('storage-tracking', url, `inline script uses "${hit[0]}" (no storage, cookies, network calls or analytics are allowed)`);
    }

    // --- robots meta ---
    const robots = p.metaByName('robots').map((t) => (t.attrs.content ?? '').toLowerCase());
    const noindex = robots.some((r) => r.includes('noindex'));
    if (url === '/404.html' && !noindex) err('robots-meta', url, '404 page must have <meta name="robots" content="noindex">');
    if (url !== '/404.html' && noindex) err('robots-meta', url, 'indexable page has noindex');

    // --- Open Graph / Twitter ---
    const og = (prop) => p.metaByProp(prop).map((t) => t.attrs.content ?? '');
    for (const prop of ['og:title', 'og:description', 'og:type', 'og:site_name'])
      if (url !== '/404.html' && og(prop).filter((v) => v.trim()).length !== 1) err('open-graph', url, `expected exactly 1 non-empty ${prop}`);
    if (lang) {
      const loc = og('og:locale');
      if (loc.length !== 1 || !loc[0].startsWith(`${lang}_`)) err('open-graph', url, `og:locale must be one ${lang}_XX value (found ${JSON.stringify(loc)})`);
      const alts = og('og:locale:alternate');
      if (alts.length !== langs.length - 1 || alts.some((a) => a === loc[0])) err('open-graph', url, `expected ${langs.length - 1} og:locale:alternate value(s) different from og:locale`);
      const tw = p.metaByName('twitter:card');
      if (tw.length !== 1) err('open-graph', url, 'expected exactly 1 twitter:card');
      if (og('og:title')[0] !== p.titles[0]) warn('open-graph', url, 'og:title differs from <title>');
    }

    // --- canonical / hreflang / og:url / og:image ---
    const canon = p.links('canonical');
    const alternates = p.links('alternate').filter((t) => t.attrs.hreflang);
    const ogUrl = og('og:url');
    const ogImg = og('og:image');
    if (url === '/404.html') {
      if (canon.length || alternates.length) err('canonical', url, '404 page must not have canonical or hreflang links');
    } else if (!siteUrl) {
      if (canon.length) err('canonical', url, 'canonical present although siteUrl is unset');
      if (alternates.length) err('hreflang', url, 'hreflang present although siteUrl is unset (hreflang must be absolute)');
      if (ogUrl.length) err('open-graph', url, 'og:url present although siteUrl is unset');
      if (ogImg.length) err('open-graph', url, 'og:image present although siteUrl is unset');
    } else {
      if (canon.length !== 1) err('canonical', url, `expected exactly 1 canonical, found ${canon.length}`);
      else if (canon[0].attrs.href !== siteUrl + url) err('canonical', url, `canonical is "${canon[0].attrs.href}", expected "${siteUrl + url}"`);
      if (ogUrl.length !== 1 || ogUrl[0] !== siteUrl + url) err('open-graph', url, `og:url must equal the canonical "${siteUrl + url}" (found ${JSON.stringify(ogUrl)})`);
      for (const img of ogImg) {
        if (!img.startsWith(siteUrl + '/')) err('open-graph', url, `og:image "${img}" is not an absolute URL on ${siteUrl}`);
        else if (!files.has(img.slice(siteUrl.length))) err('open-graph', url, `og:image "${img}" does not exist in dist/`);
      }
      const byLang = new Map();
      for (const a of alternates) {
        const code = a.attrs.hreflang;
        if (byLang.has(code)) err('hreflang', url, `duplicate hreflang="${code}"`);
        byLang.set(code, a.attrs.href);
        if (!a.attrs.href?.startsWith(siteUrl + '/')) err('hreflang', url, `hreflang="${code}" href "${a.attrs.href}" is not absolute on ${siteUrl}`);
        else if (!pages.has(a.attrs.href.slice(siteUrl.length))) err('hreflang', url, `hreflang="${code}" points to ${a.attrs.href}, which is not in dist/`);
      }
      if (byLang.get('x-default') !== siteUrl + '/') err('x-default', url, `x-default must be the language entry page ${siteUrl}/ (found ${byLang.get('x-default') ?? 'none'})`);
      if (!special) {
        const rest = url.slice(`/${lang}/`.length);
        for (const l of langs) if (byLang.get(l) !== `${siteUrl}/${l}/${rest}`) err('hreflang', url, `hreflang="${l}" should be ${siteUrl}/${l}/${rest} (found ${byLang.get(l) ?? 'none'})`);
        // reciprocity: every alternate page must link back to this page under this page's language
        for (const l of langs) {
          const target = info.get(`/${l}/${rest}`);
          if (!target) continue;
          const back = target.links('alternate').find((t) => t.attrs.hreflang === lang);
          if (back?.attrs.href !== siteUrl + url) err('hreflang', url, `not reciprocal: /${l}/${rest} does not list ${siteUrl + url} as hreflang="${lang}"`);
        }
      } else {
        for (const l of langs) if (byLang.get(l) !== `${siteUrl}/${l}/`) err('hreflang', url, `entry page hreflang="${l}" should be ${siteUrl}/${l}/ (found ${byLang.get(l) ?? 'none'})`);
      }
    }

    // --- language warnings ---
    if (lang === 'he') {
      for (const [what, text] of [['<title>', p.titles[0] ?? ''], ['meta description', descs[0]?.attrs.content ?? '']])
        if (text && !HEBREW.test(text) && LATIN.test(text)) warn('hebrew-latin-only', url, `${what} on a Hebrew page contains no Hebrew letters: "${text}"`);
    }
    if (lang === 'en') {
      // Remove intentional Hebrew spots: elements marked lang="he" (language switcher, quotes) and the language switcher links.
      const noHe = clean.replace(/<([a-zA-Z0-9]+)\b[^>]*\blang="he"[^>]*>[\s\S]*?<\/\1>/gi, ' ');
      const text = noHe.replace(/<[^>]*>/g, ' ');
      const attrsText = [...noHe.matchAll(/\b(?:alt|aria-label|title)="([^"]*)"/gi)].map((m) => m[1]).join(' ');
      const visibleHebrew = (text + ' ' + attrsText).match(/[\u0590-\u05FF]+/g);
      if (visibleHebrew) warn('english-hebrew', url, `English page contains Hebrew text outside lang="he" elements: "${visibleHebrew.slice(0, 3).join(' ')}"`);
      for (const [what, v] of [['<title>', p.titles[0] ?? ''], ['meta description', descs[0]?.attrs.content ?? '']]) if (HEBREW.test(v)) warn('english-hebrew', url, `${what} on an English page contains Hebrew`);
    }
  }

  for (const [title, urls] of titleSeen) if (urls.length > 1) err('title', urls[0], `duplicate <title> "${title}" also on ${urls.slice(1).join(', ')}`);
  for (const [d, urls] of descSeen) if (urls.length > 1) err('description', urls[0], `duplicate meta description also on ${urls.slice(1).join(', ')}`);

  // --- scripts / styles shipped as files ---
  for (const [url, text] of texts) {
    if (url.endsWith('.css'))
      for (const u of text.matchAll(/(?:url\(\s*['"]?|@import\s+['"]?)((?:https?:)?\/\/[^'")\s]+)/gi)) err('third-party', url, `CSS references ${u[1]}`);
    if (url.endsWith('.js')) {
      const hit = text.match(STORAGE_OR_TRACKING);
      if (hit) err('storage-tracking', url, `script uses "${hit[0]}" (no storage, cookies, network calls or analytics are allowed)`);
      for (const u of text.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/g)) if (!W3C_NS.test(u[1])) warn('third-party', url, `script contains the URL ${u[1]} (check it is not requested)`);
    }
  }

  // --- robots.txt and sitemap ---
  const sitemapFiles = [...sitemaps.keys()];
  if (robotsTxt === null) err('robots', '/robots.txt', 'robots.txt is missing');
  else {
    const lines = robotsTxt.split(/\r?\n/).map((l) => l.trim());
    if (lines.some((l) => /^disallow:\s*\/\s*$/i.test(l))) err('robots', '/robots.txt', 'robots.txt blocks the whole site (Disallow: /)');
    const sm = lines.filter((l) => /^sitemap:/i.test(l)).map((l) => l.replace(/^sitemap:\s*/i, ''));
    if (!siteUrl) {
      if (sm.length) err('robots', '/robots.txt', 'Sitemap line present although siteUrl is unset');
      if (sitemapFiles.length) err('sitemap', sitemapFiles[0], 'sitemap generated although siteUrl is unset');
    } else {
      if (sm.length !== 1 || sm[0] !== `${siteUrl}/sitemap-index.xml`) err('robots', '/robots.txt', `expected exactly one "Sitemap: ${siteUrl}/sitemap-index.xml" line (found ${JSON.stringify(sm)})`);
      if (!sitemaps.has('/sitemap-index.xml')) err('sitemap', '/sitemap-index.xml', 'sitemap-index.xml is missing from dist/');
      const locs = new Set();
      const alternatesIn = new Map();
      for (const [su, xml] of sitemaps) {
        if (su === '/sitemap-index.xml') continue;
        for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
          const loc = m[1].match(/<loc>\s*([^<\s]+)\s*<\/loc>/)?.[1];
          if (!loc) continue;
          locs.add(loc);
          alternatesIn.set(loc, [...m[1].matchAll(/<xhtml:link\b[^>]*>/g)].map((x) => parseAttrs(x[0])));
        }
      }
      for (const url of pages.keys()) {
        if (url === '/404.html') continue;
        if (!locs.has(siteUrl + url)) err('sitemap', url, `page ${siteUrl + url} is missing from the sitemap`);
      }
      for (const loc of locs) if (!pages.has(loc.slice(siteUrl.length)) || loc === siteUrl + '/404.html') err('sitemap', loc, 'sitemap lists a URL that is not an indexable page in dist/');
      for (const [loc, alts] of alternatesIn) {
        if (!pageLang(loc.slice(siteUrl.length), langs)) continue;
        const hrefs = new Set(alts.map((a) => a.href));
        for (const l of langs) {
          const other = loc.replace(/^(https?:\/\/[^/]+)\/[a-z]{2}\//, `$1/${l}/`);
          if (!hrefs.has(other)) warn('sitemap-alternates', loc, `no xhtml:link alternate for ${l} (${other}); the sitemap integration may not have generated alternates`);
        }
      }
    }
  }

  const rules = {};
  for (const f of errors) (rules[f.rule] ??= { errors: 0, warnings: 0 }).errors++;
  for (const f of warnings) (rules[f.rule] ??= { errors: 0, warnings: 0 }).warnings++;
  return { errors, warnings, stats: { pages: pages.size, rules } };
}
