// Pure validation logic for the reference / citation system (no file reads of its own except in
// validateDist, which reads built HTML). Used by scripts/validate-refs.mjs and tested by
// scripts/test-validate-refs.mjs with deliberately broken fixtures.
import fs from 'node:fs';
import path from 'node:path';

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DOI = /^10\.\d{4,9}\/\S+$/;
const STATUSES = ['placeholder', 'needs-verification', 'verified'];
const LANGS = ['en', 'he'];
const PH_TITLE = /^\s*\[PLACEHOLDER\]/;
const PH_STAT = /^\s*\[STAT PLACEHOLDER:[\s\S]*\]\s*$/;

const text = (value, lang) => (value === undefined ? '' : typeof value === 'string' ? value : value[lang] ?? '');
const slugify = (s) =>
  s
    .replace(PH_TITLE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Checks of the source data.
 * @param {{references: any[], citations: any[], statPlaceholders: any[], routeIds: string[],
 *   sectionKeys: {en: string[], he: string[]}, showPlaceholderMarkers: boolean}} input
 * @returns {{errors: string[], warnings: string[]}}
 */
export function validateData({ references, citations, statPlaceholders, routeIds, sectionKeys, showPlaceholderMarkers }) {
  const errors = [];
  const warnings = [];
  const E = (m) => errors.push(m);
  const W = (m) => warnings.push(m);

  // ----- references
  const refIds = new Set();
  for (const r of references) {
    const where = `reference "${r.id}"`;
    if (typeof r.id !== 'string' || !KEBAB.test(r.id)) E(`${where}: id must be lowercase-kebab`);
    if (refIds.has(r.id)) E(`${where}: duplicate id`);
    refIds.add(r.id);
    if (!STATUSES.includes(r.status)) E(`${where}: status must be one of ${STATUSES.join(', ')}`);

    for (const lang of LANGS) {
      if (!text(r.title, lang).trim()) E(`${where}: missing ${lang} title`);
      if (!text(r.description, lang).trim()) E(`${where}: missing ${lang} description`);
    }
    // Identity must not be a slug of the title.
    const enTitle = text(r.title, 'en');
    if (enTitle && slugify(enTitle) && r.id.replace(/-\d+$/, '') === slugify(enTitle)) {
      E(`${where}: id is just a slug of the title; ids must be independent of titles`);
    }

    if (r.status === 'placeholder') {
      for (const lang of LANGS) {
        if (!PH_TITLE.test(text(r.title, lang))) E(`${where}: placeholder ${lang} title must start with "[PLACEHOLDER]"`);
      }
      for (const field of ['organization', 'year', 'publisher', 'doi', 'url', 'locator']) {
        if (r[field] !== undefined && r[field] !== '') {
          E(`${where}: placeholder records must not carry "${field}" (no fabricated bibliographic metadata)`);
        }
      }
    } else {
      for (const lang of LANGS) {
        if (PH_TITLE.test(text(r.title, lang))) E(`${where}: status "${r.status}" but the ${lang} title still starts with "[PLACEHOLDER]"`);
      }
      if (r.doi !== undefined && r.doi !== '' && !DOI.test(r.doi)) E(`${where}: doi must be a bare DOI like 10.1234/abcd`);
      if (r.url !== undefined && r.url !== '' && !/^https:\/\/[^\s]+$/.test(r.url)) E(`${where}: url must be an https:// URL`);
      if (r.status === 'verified') {
        if (!text(r.organization, 'en') || !r.year || !(r.doi || r.url)) {
          E(`${where}: "verified" requires organization, year and a doi or url`);
        }
      }
    }
  }

  // ----- citation instances
  const citeById = new Map();
  for (const c of citations) {
    const where = `citation "${c.id}"`;
    if (typeof c.id !== 'string' || !KEBAB.test(c.id)) E(`${where}: id must be lowercase-kebab`);
    if (citeById.has(c.id)) E(`${where}: duplicate citation id`);
    citeById.set(c.id, c);
    if (!refIds.has(c.ref)) E(`${where}: points to unknown reference "${c.ref}"`);
    if (!routeIds.includes(c.page)) E(`${where}: unknown page "${c.page}"`);
    for (const lang of LANGS) {
      if (!sectionKeys[lang].includes(c.section)) E(`${where}: section "${c.section}" has no label in the ${lang} dictionary (refs.sections)`);
    }
  }

  // ----- statistic placeholders
  const statIds = new Set();
  for (const s of statPlaceholders) {
    const where = `statistic placeholder "${s.id}"`;
    if (typeof s.id !== 'string' || !KEBAB.test(s.id)) E(`${where}: id must be lowercase-kebab`);
    if (statIds.has(s.id)) E(`${where}: duplicate id`);
    statIds.add(s.id);
    const cite = citeById.get(s.cite);
    if (!cite) E(`${where}: is not tied to a citation instance ("${s.cite}" does not exist)`);
    else {
      if (!refIds.has(cite.ref)) E(`${where}: its citation does not point to an existing reference`);
      if (cite.page !== s.page || cite.section !== s.section) E(`${where}: page/section differ from its citation "${s.cite}"`);
    }
    for (const lang of LANGS) {
      if (!PH_STAT.test(text(s.description, lang))) E(`${where}: ${lang} description must be written "[STAT PLACEHOLDER: …]"`);
      if (/\d/.test(text(s.description, lang).replace(/^\s*\[STAT PLACEHOLDER:/, ''))) {
        E(`${where}: ${lang} description contains a digit: no actual figures may be published`);
      }
    }
  }

  // ----- orphans and flag
  const cited = new Set(citations.map((c) => c.ref));
  for (const r of references) {
    if (!cited.has(r.id) && !r.allowUncited) W(`reference "${r.id}" is never cited (add a citation or set allowUncited: true)`);
  }
  const unverified = references.filter((r) => r.status !== 'verified').length;
  if (!showPlaceholderMarkers && unverified > 0) {
    W(`showPlaceholderMarkers is false but ${unverified} reference(s) are not verified (they would be hard to tell apart; see npm run list:placeholders)`);
  }
  if (!showPlaceholderMarkers && statPlaceholders.length > 0) {
    W(`showPlaceholderMarkers is false but ${statPlaceholders.length} statistic placeholder(s) remain in the site`);
  }
  return { errors, warnings };
}

// ---------------------------------------------------------------- rendered HTML

/** Parse attributes of an HTML start tag, quoted or unquoted (compressHTML drops quotes). */
export function parseAttrs(tag) {
  const out = {};
  const re = /([^\s=<>"'/]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>"']+)))?/g;
  const body = tag.replace(/^<\w+/, '').replace(/\/?>$/, '');
  for (const m of body.matchAll(re)) out[m[1]] = (m[2] ?? m[3] ?? m[4] ?? '').replaceAll('&amp;', '&');
  return out;
}
const tagsWith = (html, attr) => [...html.matchAll(new RegExp(`<\\w+\\b[^>]*\\b${attr}\\b[^>]*>`, 'g'))].map((m) => parseAttrs(m[0]));
const idCount = (html, id) => (html.match(new RegExp(`\\bid=(?:"${id}"|'${id}'|${id}(?=[\\s>]))`, 'g')) ?? []).length;

/**
 * Checks of the built pages.
 * @param {{dist: string, langs: string[], routes: {id: string, slug: string}[], references: any[], citations: any[],
 *   statPlaceholders: any[], dictionaries: Record<string, any>}} input
 */
export function validateDist({ dist, langs, routes, references, citations, statPlaceholders, dictionaries }) {
  const errors = [];
  const E = (m) => errors.push(m);
  const slugOf = Object.fromEntries(routes.map((r) => [r.id, r.slug]));
  const fileOf = (lang, id) => path.join(dist, lang, slugOf[id], 'index.html');
  const urlOf = (lang, id) => `/${lang}/${slugOf[id] ? slugOf[id] + '/' : ''}`;
  const htmlCache = new Map();
  const html = (lang, id) => {
    const f = fileOf(lang, id);
    if (!htmlCache.has(f)) htmlCache.set(f, fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);
    return htmlCache.get(f);
  };
  const number = (refId) => references.findIndex((r) => r.id === refId) + 1;
  const refById = new Map(references.map((r) => [r.id, r]));
  const citeById = new Map(citations.map((c) => [c.id, c]));

  for (const lang of langs) {
    const label = (id) => `[${lang}] ${urlOf(lang, id)}`;

    for (const route of routes) {
      const page = html(lang, route.id);
      if (page === null) {
        E(`${label(route.id)}: page missing from build output`);
        continue;
      }

      // Markers present on this page must be exactly the citations declared for it.
      const markers = tagsWith(page, 'data-cite');
      const expected = citations.filter((c) => c.page === route.id);
      const seen = new Map();
      for (const m of markers) {
        const id = m['data-cite'];
        seen.set(id, (seen.get(id) ?? 0) + 1);
        const c = citeById.get(id);
        if (!c) {
          E(`${label(route.id)}: marker "${id}" is not in src/data/citations.mjs`);
          continue;
        }
        if (c.page !== route.id) E(`${label(route.id)}: marker "${id}" is declared for page "${c.page}"`);
        if (m['data-cite-ref'] !== c.ref) E(`${label(route.id)}: marker "${id}" renders ref "${m['data-cite-ref']}", expected "${c.ref}"`);
        if (Number(m['data-cite-number']) !== number(c.ref)) {
          E(`${label(route.id)}: marker "${id}" shows number ${m['data-cite-number']}, expected ${number(c.ref)} (repeated citations must agree)`);
        }
        const href = `/${lang}/${slugOf.resources}/#ref-${c.ref}`;
        if (!new RegExp(`id=(?:"?)${id}(?:"?)[^>]*href=(?:"?)${href.replace(/[/#]/g, '\\$&')}`).test(page)) {
          E(`${label(route.id)}: marker "${id}" does not link to ${href}`);
        }
        if (idCount(page, id) !== 1) E(`${label(route.id)}: marker id "${id}" appears ${idCount(page, id)} times as an id (must be 1)`);
      }
      for (const c of expected) {
        if (!seen.has(c.id)) E(`${label(route.id)}: citation "${c.id}" is declared but not rendered`);
        else if (seen.get(c.id) > 1) E(`${label(route.id)}: citation "${c.id}" is rendered ${seen.get(c.id)} times`);
      }

      // Statistic placeholders.
      const stats = tagsWith(page, 'data-stat-placeholder').map((a) => a['data-stat-placeholder']);
      for (const s of statPlaceholders.filter((s) => s.page === route.id)) {
        if (stats.filter((x) => x === s.id).length !== 1) E(`${label(route.id)}: statistic placeholder "${s.id}" must be rendered exactly once`);
      }
      for (const id of stats) {
        const s = statPlaceholders.find((s) => s.id === id);
        if (!s) E(`${label(route.id)}: rendered statistic placeholder "${id}" is not in src/data/stat-placeholders.mjs`);
        else if (s.page !== route.id) E(`${label(route.id)}: statistic placeholder "${id}" is declared for page "${s.page}"`);
      }

      // Page-level reference list: every cited reference appears.
      const cites = expected.length > 0;
      if (cites && route.id !== 'resources') {
        if (!/<aside\b[^>]*class="?page-refs["\s>]/.test(page)) E(`${label(route.id)}: page cites references but has no page-level reference list`);
        else {
          for (const refId of new Set(expected.map((c) => c.ref))) {
            if (!page.includes(`/#ref-${refId}`)) E(`${label(route.id)}: page-level list misses reference "${refId}"`);
          }
        }
      }
    }

    // ----- the Resources page itself
    const res = html(lang, 'resources');
    if (res === null) continue;
    const dict = dictionaries[lang];
    const rl = label('resources');
    const entries = new Map();
    const starts = [...res.matchAll(/<li\b[^>]*\bid=(?:"?)ref-([a-z0-9-]+)(?:"?)[^>]*>/g)];
    starts.forEach((m, i) => {
      const end = i + 1 < starts.length ? starts[i + 1].index : res.indexOf('</ol>', m.index);
      entries.set(m[1], res.slice(m.index, end));
    });
    for (const r of references) {
      if (idCount(res, `ref-${r.id}`) !== 1) E(`${rl}: entry id "ref-${r.id}" must appear exactly once`);
      const entry = entries.get(r.id);
      if (!entry) continue;
      if (r.status === 'placeholder') {
        if (!entry.includes(dict.refs.status.placeholder)) E(`${rl}: placeholder "${r.id}" is not labelled as a placeholder in its entry`);
        if (/href=(?:"?)https?:\/\//.test(entry)) E(`${rl}: placeholder "${r.id}" renders an external link (placeholders must not have one)`);
      } else if (r.status === 'needs-verification') {
        if (!entry.includes(dict.refs.status['needs-verification'])) E(`${rl}: "${r.id}" is not labelled as needing verification`);
      } else if (entry.includes('[PLACEHOLDER]') || entry.includes(dict.refs.status.placeholder)) {
        E(`${rl}: verified reference "${r.id}" still shows placeholder wording`);
      }
    }
    for (const id of entries.keys()) if (!refById.has(id)) E(`${rl}: entry "ref-${id}" is not in the registry`);

    // Backlinks: one per citation instance, all valid.
    const backlinks = tagsWith(res, 'data-backlink');
    const seenBack = new Map();
    for (const b of backlinks) {
      const id = b['data-backlink'];
      const c = citeById.get(id);
      seenBack.set(id, (seenBack.get(id) ?? 0) + 1);
      if (!c) {
        E(`${rl}: backlink to unknown citation "${id}"`);
        continue;
      }
      const expectedHref = `${urlOf(lang, c.page)}#${id}`;
      if (b.href !== expectedHref) E(`${rl}: backlink for "${id}" is "${b.href}", expected "${expectedHref}"`);
      const target = html(lang, c.page);
      if (target === null || idCount(target, id) !== 1) E(`${rl}: backlink target #${id} does not exist on ${urlOf(lang, c.page)}`);
      // It must sit inside the entry of the reference it cites.
      if (!(entries.get(c.ref) ?? '').includes(`data-backlink=${id}`) && !(entries.get(c.ref) ?? '').includes(`data-backlink="${id}"`)) {
        E(`${rl}: backlink "${id}" is not listed under reference "${c.ref}"`);
      }
    }
    for (const c of citations) {
      if (seenBack.get(c.id) !== 1) E(`${rl}: citation "${c.id}" must have exactly one backlink (found ${seenBack.get(c.id) ?? 0})`);
    }
  }
  return { errors };
}
