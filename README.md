# Daphi website

Bilingual (English / Hebrew, LTR / RTL) informational website for **Daphi**, a nonprofit working to eliminate food loss and waste (FLW).
Built with [Astro](https://astro.build) as a fully static site, deployable on Cloudflare.

> **Status: Stage 2 of 7 (citation system and Resources page).** The site shell, routing, localization, header/footer, design tokens,
> seven pages per language, and the complete citation system (reference registry, citation markers with popovers, backlinks, Resources
> page, validators) exist. Real page content arrives in later stages (see `HANDOFF.md`). This README grows with each stage;
> sections marked *(later stage)* are not written yet.

## Requirements

- **Node.js 22.22.0 or newer** (Astro 7 requirement; `.nvmrc` pins 22.22.0) and npm 10+.
- No global dependencies, environment variables or external files are needed.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Production build to `dist/`, then the reference validation and the route/link check |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | Astro/TypeScript type check |
| `npm run validate` | Contrast + mailto tests + reference-validator tests + reference validation + route/link check (run `npm run build` first) |
| `npm run validate:refs` | Reference/citation validation: registry data, plus the built pages if `dist/` exists (fails the build on errors) |
| `npm run test:refs` | Negative tests that prove the validator fails on broken data/markup (31 cases) |
| `npm run list:placeholders` | Lists every placeholder still on the site (`-- --strict` exits 1 if any remain) |
| `npm run check:routes` | Post-build check of every page, metadata, hreflang, links and `#fragments` |
| `npm run check:contrast` | WCAG contrast check of the design-token colour pairs |
| `npm run test:mailto` | Test of the shared mailto helper |
| `npm run sync:fonts` | Re-copy font files from `@fontsource` to `public/fonts` (already committed) |

## Routing and localization

- Every page lives under a language prefix: `/en/…` and `/he/…`. Slugs are identical in both languages:

  | Page | Route |
  | --- | --- |
  | Home | `/{lang}/` |
  | FLW Prevention | `/{lang}/flw-prevention/` |
  | Partnerships | `/{lang}/partnerships/` |
  | Data | `/{lang}/data/` |
  | About | `/{lang}/about/` |
  | Resources & References | `/{lang}/resources/` |
  | Acknowledgments | `/{lang}/acknowledgments/` |

- **`/` is a language entry page** (two plain links, works without JavaScript). If the browser's first preferred language is Hebrew,
  a tiny script forwards to `/he/`; otherwise the visitor chooses. English is the default language.
- `/404.html` is a bilingual not-found page.
- **Language switcher** (header and footer): links to the *equivalent* page in the other language; the current `#fragment` is kept
  by a small script. Because every page exists in both languages, there is no fallback-to-home case today.
- `lang`/`dir` are set on `<html>` per route (`en`/`ltr`, `he`/`rtl`). All CSS uses **logical properties** (`margin-inline-start`,
  `text-align: start`, …), so RTL needs no mirrored stylesheet. The logo/email icon are never mirrored.
- **Translations** live in `src/i18n/en.ts` and `src/i18n/he.ts`. `he.ts` is type-checked against the English shape, so a missing
  string fails `npm run check`. Components read strings through `getDictionary(lang)`; do not hard-code visible text in components.
- Route list and section IDs: `src/config/routes.mjs`. URL helper: `routePath(lang, routeId, hash?)` in `src/lib/routes.ts`.
- To add a page: add it to `ROUTES`, add `nav`/`pages` entries to both dictionaries, create `src/pages/[lang]/<slug>.astro`.

## Placeholders

The site publishes **no actual statistics and no real references** (the owner supplies fact-checked ones). Everything that is not final is
a marked placeholder:

- **In data**: records carry an explicit flag, e.g. `status: 'placeholder'` (references; timeline and acknowledgments later).
- **In source text**: the prefix `[PLACEHOLDER] …` (generic) or `[STAT PLACEHOLDER: …]` (a missing figure), so it can be found by search.
- **On the page**: a dashed badge with a text label (not colour alone): "Placeholder", "Statistic placeholder", "Reference placeholder"
  (`src/components/PlaceholderMark.astro`). The `[PLACEHOLDER]` wrapper is stripped when rendering and replaced by the badge.
- **One switch**: `showPlaceholderMarkers` in `src/config/site.config.mjs` (default `true`) hides the badges once content is final. Reference
  entries always state in words that they are placeholders until their status is changed, and `validate:refs` warns if the badges are
  switched off while placeholders remain.
- **Find what is left**: `npm run list:placeholders`.
- **Statistics**: use `<StatPlaceholder id="…" lang={lang} />` (records in `src/data/stat-placeholders.mjs`). Each is tied to a citation and
  therefore to a reference; the validator fails if it is not, or if a description contains a digit.

## References and citations

Single source of truth: **`src/data/references.mjs`** (the registry) and **`src/data/citations.mjs`** (every place a reference is cited).
Nothing bibliographic is duplicated in components or pages.

How it fits together

- A **reference** has a permanent `id` (e.g. `flw-global-overview-01`), a `status` (`placeholder` | `needs-verification` | `verified`), and
  optional bibliographic fields (organization, year, publisher, DOI, URL, locator). Empty fields are simply not rendered. Text fields can be a
  string or `{ en, he }`.
- A **citation instance** is one marker in one place: `{ id: 'c-home-demo-1', ref: '<reference id>', page: 'home', section: 'demo' }`.
  One reference can have any number of instances (repeated citation, several pages).
- The **number** shown in `[1]` is the reference's position in `references.mjs` (first record = 1), the same on every page. Identity is the
  `id`, never the number or the title, so re-ordering or replacing a source never breaks a marker or backlink.
- **Marker** (`<Cite id="c-home-demo-1" lang={lang} />`): an anchor to `/{lang}/resources/#ref-<reference id>`. This works with no JavaScript.
  With JavaScript it adds a popover (title, organization/year when known, status, "View full reference" link) on hover, keyboard focus or tap;
  Escape closes it; on touch screens the first tap opens the popover and the second follows the link. The popover is clamped inside the viewport
  and works in RTL. Its text is also available through `aria-describedby`.
- **Backlinks**: every entry on the Resources page lists each place that cites it, linking to the marker (`/{lang}/<page>/#<citation id>`).
- **Page-level list**: `BaseLayout` automatically renders a compact "References on this page" list at the bottom of any page that cites something.

### Replace a placeholder with a real source
1. In `src/data/references.mjs` keep the record's `id`. Fill in `title`, `organization`, `year`, `publisher`, `doi` (bare, e.g. `10.1234/abcd`) and/or
   `url` (https), `description`, `locator`.
2. Remove the `[PLACEHOLDER]` prefix from the titles. Set `status: 'needs-verification'` while it is not yet fact-checked, `'verified'` when it is
   (`verified` requires organization, year and a DOI or URL).
3. `npm run build`. Markers and backlinks keep working because they point to the `id`.

### Add a new reference
Append a record to `src/data/references.mjs` (a new, unique, lowercase-kebab `id` that is *not* a slug of the title). Appending keeps existing
numbers unchanged; inserting in the middle renumbers the markers after it.

### Cite a source on another page
1. Add an instance to `src/data/citations.mjs` (`id` convention `c-<page>-<section>-<n>`; `page` is a route id; `section` is a key of `refs.sections`).
2. If `section` is new, add its label to `refs.sections` in **both** `src/i18n/en.ts` and `src/i18n/he.ts` (used in the backlink text).
3. Put `<Cite id="c-…" lang={lang} />` in the page, directly after the text it supports (no space before it).
   Do not add a manual references list: the page-level list is automatic.

### Check and find what still needs verification
- `npm run validate:refs` (also part of `npm run build`) checks: unique/kebab ids; ids independent of titles; every marker points to an existing
  reference; every citation is rendered exactly once on its page in both languages and nothing else is rendered; numbers agree for repeated
  citations; every backlink exists, sits under the right entry and its target exists; placeholders have no fabricated metadata (no DOI, URL, year,
  organization) and render as placeholders with no external link; verified entries are not labelled as placeholders; every statistic placeholder is
  tied to a reference; orphan references (warning); badges switched off while placeholders remain (warning).
- `npm run list:placeholders` lists references with status `placeholder` and `needs-verification` separately, plus every other placeholder.

## Central configuration

`src/config/site.config.mjs` holds: site URL (**unset**), contact email, brand-asset paths, future-platform Google Doc URL (**unset**),
application gateway state, and `showPlaceholderMarkers` (see Placeholders). Design tokens (colours, fonts, type scale, spacing) are in
`src/styles/tokens.css`.

## Mailto links

Every `mailto:` link is built with `buildMailto()` in `src/lib/mailto.ts` (percent-encoding, CRLF line breaks, Hebrew-safe).
The address comes from `siteConfig.email`.

## Brand assets and fallbacks

See `public/assets/brand/README.md` for expected filenames. Missing logos fall back to a clearly styled text wordmark; a missing email
icon falls back to a text-only link. Files are detected at build time, so adding the file and rebuilding is enough.
The current favicon (`public/favicon.svg`) is a neutral temporary ring, **not** a Daphi logo.

## Fonts

Secular One (primary headings) and Varela Round (everything else), both with Latin **and Hebrew** glyphs, self-hosted from
`public/fonts` (`font-display: swap`, preloaded, metric-adjusted fallbacks). Both families have a single weight (400): headings
never synthesize bold, and the browser may synthesize bold for short Varela Round UI emphasis. Fonts are licensed under the SIL OFL.

## Colour and contrast

The brand palette is used as specified. `#478F74` on `#F9F6E9` is only 3.6:1, so it is used for borders, icons and large decoration and
**never for small text**; small secondary text uses the derived `#2F6B55` (5.8:1). `#478F74` panels carry large text only; panels with
body text use `#066466` with `#F9F6E9`. `npm run check:contrast` verifies this.

## Cloudflare deployment

The output is static, so **no Cloudflare adapter is needed**. `wrangler.jsonc` serves `./dist` as static assets, and `public/_headers`
adds security headers and long-lived caching for fonts and hashed assets.

Steps that need your Cloudflare account (not done here):
1. Create a Cloudflare account/Workers & Pages project, or connect the Git repository.
2. Build command `npm run build`, output directory `dist`, Node 22.22+.
3. (Workers static assets) `npx wrangler login`, then `npx wrangler deploy`. (Wrangler is not a dependency of this project; `npx` fetches it.)
4. Attach the custom domain, then set `siteUrl` in `src/config/site.config.mjs` and rebuild (enables canonical URLs, sitemap, absolute hreflang/OG URLs).

The `Content-Security-Policy` in `_headers` currently allows inline scripts (the small menu/language scripts are inline; the citation-popover
script is bundled by Astro and may be inlined too); tighten it in a later stage if desired.

## Integrating this project into the existing Daphi repository

*(Later stage: written in full in Stage 7.)* Do not copy files over the existing project blindly. Files most likely to conflict:
`package.json`, `package-lock.json`, `astro.config.*`, `tsconfig.json`, `wrangler.*`, `.gitignore`, `.nvmrc`, `public/` (`favicon.svg`,
`robots.txt`, `_headers`), and any existing `src/layouts`, `src/pages`, `src/styles`.

## Still to be supplied

Official favicon, production domain, Google Doc URL for the future platform, application URL, **real references (replace the six placeholder
records) and fact-checked statistics**, verified sensor details, About text, acknowledgment entries, prevention-process infographic, native review of Hebrew copy.
Full list: `HANDOFF.md`.

## License
* The *software* is under AGPL-3.0.
* For *trademarks*, *logos*, *graphics*, *articles*, *data*, and all other forms of content and brand material and identity, see [TRADEMARKS.md](/TRADEMARKS.md) and [CONTENT-AND_DATA-LICENSE.md](/CONTENT-AND_DATA-LICENSE.md).
