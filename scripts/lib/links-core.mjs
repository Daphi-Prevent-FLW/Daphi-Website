// Pure logic of the internal link / fragment validator (no file system access), so the tests can feed it
// synthetic pages. scripts/check-links.mjs reads dist/ and calls analyze(); scripts/test-check-links.mjs
// proves that every rule really fails on broken input.
//
// Input
//   pages:  Map<urlPath, html>   e.g. '/en/data/' -> '<!doctype html>...'
//   files:  Set<urlPath>         static files, e.g. '/favicon.svg'
//   langs:  ['en','he']
//   sections: [{ key, id, slug }]          stable section ids and the page slug they live on
//   journeys: [{ from, href, label }]      a page that MUST contain an <a href="..."> (intent journeys); `{lang}` is expanded per language
//   platformDocUrl: string | null           configured future-platform document URL (null = not supplied)
// Output { errors: string[], warnings: string[], stats }

const VOID_BLOCKS = /<(script|style)\b[\s\S]*?<\/\1>|<!--[\s\S]*?-->/gi;
const decodeEntities = (v) =>
  v.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** Parse the attributes of one start tag into a plain object (lower-cased names, decoded values). */
export function parseAttrs(tag) {
  const attrs = {};
  const inner = tag.replace(/^<[^\s>/]+/, '').replace(/\/?>$/, '');
  const re = /([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  for (const m of inner.matchAll(re)) attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '');
  return attrs;
}

/** All start tags of the page (outside script/style/comments) as { name, attrs, raw }. */
export function startTags(html) {
  const clean = html.replace(VOID_BLOCKS, ' ');
  return [...clean.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g)].map((m) => ({
    name: m[1].toLowerCase(),
    attrs: parseAttrs(m[0]),
    raw: m[0],
    index: m.index,
  }));
}

const safeDecode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export function analyze({ pages, files, langs, sections = [], journeys = [], platformDocUrl = null }) {
  const errors = [];
  const warnings = [];
  const stats = { pages: pages.size, internalLinks: 0, fragmentLinks: 0, externalLinks: 0, journeysChecked: 0 };
  const err = (where, msg) => errors.push(`${where}: ${msg}`);

  // 1. Parse every page once; collect ids.
  const parsed = new Map();
  for (const [url, html] of pages) {
    const tags = startTags(html);
    const ids = new Map();
    for (const t of tags) {
      const id = t.attrs.id;
      if (id === undefined) continue;
      ids.set(id, (ids.get(id) ?? 0) + 1);
    }
    parsed.set(url, { tags, ids, html });
    for (const [id, n] of ids) if (n > 1) err(url, `duplicate id "${id}" (${n} times)`);
    if (url !== '/404.html') {
      for (const t of tags) {
        if (t.attrs.id === '') err(url, `empty id on <${t.name}>`);
      }
    }
    // aria / label references must point to an id on the same page.
    for (const t of tags) {
      for (const attr of ['aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'for']) {
        if (t.attrs[attr] === undefined) continue;
        if (attr === 'for' && t.name !== 'label') continue;
        for (const ref of t.attrs[attr].split(/\s+/).filter(Boolean)) {
          if (!ids.has(ref)) err(url, `${attr}="${ref}" on <${t.name}> points to no id on this page`);
        }
      }
    }
  }

  const resolve = (pathPart) => {
    const p = safeDecode(pathPart);
    if (p.endsWith('/')) return pages.has(p) ? { kind: 'page', url: p } : null;
    if (files.has(p)) return { kind: 'file', url: p };
    if (pages.has(p)) return { kind: 'page', url: p };
    if (pages.has(p + '/')) return { kind: 'noslash', url: p + '/' };
    return null;
  };

  // 2. Every link and asset reference.
  for (const [url, { tags }] of parsed) {
    const lang = langs.find((l) => url.startsWith(`/${l}/`));
    for (const t of tags) {
      const isA = t.name === 'a' || t.name === 'area';
      const raw = isA ? t.attrs.href : t.name === 'img' || t.name === 'source' || t.name === 'script' ? t.attrs.src : undefined;
      if (raw === undefined) continue;
      if (/^\s*javascript:/i.test(raw)) {
        err(url, `javascript: link: ${raw}`);
        continue;
      }
      if (raw === '' || raw === '#') {
        if (isA) err(url, `empty or "#" link: <${t.name} href="${raw}">`);
        continue;
      }
      if (/^mailto:|^tel:/i.test(raw)) continue; // mailto format is checked by check-routes
      if (/^(https?:)?\/\//i.test(raw)) {
        stats.externalLinks++;
        if (isA) {
          if (/^http:\/\//i.test(raw)) err(url, `external link is not https: ${raw}`);
          const rel = (t.attrs.rel ?? '').toLowerCase().split(/\s+/);
          if (!rel.includes('noopener') || !rel.includes('noreferrer')) err(url, `external link without rel="noopener noreferrer": ${raw}`);
        }
        continue;
      }
      if (isA && t.attrs.target === '_blank') {
        const rel = (t.attrs.rel ?? '').toLowerCase().split(/\s+/);
        if (!rel.includes('noopener')) err(url, `target="_blank" without rel="noopener": ${raw}`);
      }
      if (!raw.startsWith('/') && !raw.startsWith('#')) {
        err(url, `relative link is not allowed (use root-relative): ${raw}`);
        continue;
      }
      stats.internalLinks++;
      const hashAt = raw.indexOf('#');
      const pathPart = (hashAt === -1 ? raw : raw.slice(0, hashAt)).split('?')[0];
      const hash = hashAt === -1 ? null : safeDecode(raw.slice(hashAt + 1));
      let target;
      if (pathPart === '') target = { kind: 'page', url };
      else {
        target = resolve(pathPart);
        if (!target) {
          err(url, `broken internal link: ${raw}`);
          continue;
        }
        if (target.kind === 'noslash') {
          err(url, `link to a page without the trailing slash: ${raw}`);
          target = { kind: 'page', url: target.url };
        }
      }
      if (hash !== null) {
        stats.fragmentLinks++;
        if (hash === '') err(url, `empty fragment: ${raw}`);
        else if (target.kind === 'page' && !parsed.get(target.url)?.ids.has(hash)) err(url, `missing fragment target "#${hash}" on ${target.url} (link: ${raw})`);
      }
      // Language integrity: a page only links to the other language through the language switcher.
      if (isA && lang && pathPart) {
        const other = langs.find((l) => l !== lang && pathPart.startsWith(`/${l}/`));
        if (other && t.attrs['data-lang-switch'] === undefined) err(url, `link into the other language outside the language switcher: ${raw}`);
      }
    }

    // The language switcher must lead to the EQUIVALENT page.
    if (lang) {
      const rest = url.slice(lang.length + 1); // '/data/' or '/'
      for (const t of tags) {
        if (t.name !== 'a' || t.attrs['data-lang-switch'] === undefined) continue;
        const hl = t.attrs.hreflang;
        if (!hl) {
          err(url, 'language switch link without hreflang');
          continue;
        }
        const expected = `/${hl}${rest}`;
        if ((t.attrs.href ?? '').split('#')[0] !== expected) err(url, `language switch to "${hl}" goes to ${t.attrs.href}, expected ${expected}`);
      }
    }
  }

  // 3. Stable section ids exist exactly once, on the right page, in every language.
  for (const lang of langs) {
    for (const s of sections) {
      const url = `/${lang}/${s.slug}/`;
      const page = parsed.get(url);
      if (!page) {
        err(url, `page for section "${s.key}" is missing`);
        continue;
      }
      const n = page.ids.get(s.id) ?? 0;
      if (n !== 1) err(url, `stable section id "#${s.id}" (${s.key}) found ${n} times, expected exactly once`);
    }
  }

  // 4. Intent journeys: the promised links exist and lead somewhere real.
  for (const lang of langs) {
    for (const j of journeys) {
      const from = j.from.replaceAll('{lang}', lang);
      const href = j.href.replaceAll('{lang}', lang);
      const page = parsed.get(from);
      stats.journeysChecked++;
      if (!page) {
        err(from, `journey "${j.label}": source page missing`);
        continue;
      }
      if (!page.tags.some((t) => t.name === 'a' && t.attrs.href === href)) err(from, `journey "${j.label}": no link to ${href}`);
    }
  }

  // 5. Future-platform document link: absent unless configured; present and https when configured.
  for (const lang of langs) {
    const url = `/${lang}/data/`;
    const page = parsed.get(url);
    if (!page) continue;
    const block = page.html.match(/<li\b[^>]*data-action="?platform-doc"?[^>]*>[\s\S]*?<\/li>/i)?.[0];
    if (!block) {
      err(url, 'platform document action (data-action="platform-doc") not found');
      continue;
    }
    const links = [...block.matchAll(/<a\b[^>]*>/gi)].map((m) => parseAttrs(m[0]));
    if (platformDocUrl) {
      if (!links.some((a) => a.href === platformDocUrl)) err(url, `futurePlatformDocUrl is set but the page has no link to it`);
    } else if (links.length) {
      err(url, 'futurePlatformDocUrl is not set but the platform document action renders a link');
    } else if (!/data-state="?missing"?/.test(block)) {
      err(url, 'platform document action does not show the missing-URL state');
    }
  }
  if (!platformDocUrl) warnings.push('futurePlatformDocUrl is not set: the Data page shows the editorial placeholder instead of a link.');

  return { errors, warnings, stats };
}
