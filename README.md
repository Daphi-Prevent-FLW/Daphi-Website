# Daphi website

Bilingual (English / Hebrew, LTR / RTL) informational website for **Daphi**, a nonprofit working to eliminate food loss and waste (FLW).
Built with [Astro](https://astro.build) as a fully static site, deployable on Cloudflare.

> **Status: Stage 7 of 7 (documentation and handoff).** All seven pages exist in both languages with clearly marked placeholders where Daphi's own content is still to come.
> **Stages 5 to 7 have never been compiled or rendered**: the first real `npm run build`, `npm run check` and `npm run validate` still have to run (see `ISSUES.md`, BLD-01..03). Start with `HANDOFF.md`, `ISSUES.md`, `FINAL-REPORT.md`.

## Requirements

- **Node.js 22.22.0 or newer** (Astro 7 requirement; `.nvmrc` pins 22.22.0, `engines` in `package.json` says `>=22.22.0`) and npm 10+.
- No global dependencies, environment variables or external files are needed.

## Commands

| Command | What it does |
| --- | --- |
| `npm ci` | Clean install from `package-lock.json` (use `npm install` only when changing dependencies) |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | `astro build`, then `validate-refs --require-dist`, `check-routes`, `check-links` (stops at the first failure). `check:quality` is **not** part of it yet (ISSUES BLD-03) |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | Astro/TypeScript type check |
| `npm run validate` | `check:contrast`, `test:mailto`, `test:refs`, `test:links`, `test:stage5`, `test:quality`, then on `dist/`: `validate:refs`, `check:routes`, `check:links`, `check:figures`, `check:quality -- --require-dist` (run `npm run build` first) |
| `npm run check:figures` | Fails if any digit (a statistic) appears in the visible text of the built pages; citation numbers and the e-mail address are exempt |
| `npm run validate:refs` | Reference/citation validation: registry data, plus the built pages if `dist/` exists (fails the build on errors) |
| `npm run test:refs` | Negative tests that prove the validator fails on broken data/markup (31 cases) |
| `npm run list:placeholders` | Lists every placeholder still on the site (`-- --strict` exits 1 if any remain) |
| `npm run check:links` | Internal link/fragment validator over `dist/` (part of `npm run build`): resolution, fragments, unique ids, aria references, language switcher, stable section ids, intent journeys (`scripts/journeys.mjs`), external-link safety, platform-doc link state |
| `npm run test:links` | Negative tests proving the link validator fails on broken input |
| `npm run check:routes` | Post-build check of every page, metadata, hreflang (only when `siteUrl` is set; rejected when unset), links and `#fragments` |
| `npm run check:quality` | Quality check of `dist/` (Stage 6b): titles/descriptions, one `<h1>`, `lang`/`dir`, heading levels, alt text, link names, `target=_blank` rel, ids/aria references, hreflang/canonical/`x-default` reciprocity, sitemap and `robots.txt`, no third-party requests/storage/tracking. Errors exit 1, warnings do not. Skips without `dist/`; `-- --require-dist` fails instead. Part of `npm run validate`, not yet of `npm run build` (never run on real output yet; add it after `check-links` once it passes) |
| `npm run test:quality` | 107 tests of that check on synthetic sites (mostly negative) |
| `npm run check:contrast` | WCAG contrast check of the design-token colour pairs |
| `npm run test:mailto` | Test of the shared mailto helper |
| `npm run test:stage5` | Tests of the timeline and acknowledgments data rules and of the acknowledgment conditional-rendering logic (35 checks, most of them negative) |
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
  a tiny script forwards to `/he/`; otherwise the visitor chooses. The master prompt names no default language: the entry page is the hreflang `x-default` and `DEFAULT_LANG = 'en'` is only used for the sitemap configuration (flagged in `ISSUES.md`, SEO-02).
- `/404.html` is a bilingual not-found page.
- **Language switcher** (header and footer): links to the *equivalent* page in the other language; the current `#fragment` is kept
  by a small script. Because every page exists in both languages, there is no fallback-to-home case today.
- `lang`/`dir` are set on `<html>` per route (`en`/`ltr`, `he`/`rtl`). All CSS uses **logical properties** (`margin-inline-start`,
  `text-align: start`, …), so RTL needs no mirrored stylesheet. The logo/email icon are never mirrored.
- **Translations** live in `src/i18n/en.ts` and `src/i18n/he.ts`. `he.ts` is type-checked against the English shape, so a missing
  string fails `npm run check`. Components read strings through `getDictionary(lang)`; do not hard-code visible text in components.
- Route list and section IDs: `src/config/routes.mjs`. URL helper: `routePath(lang, routeId, hash?)` in `src/lib/routes.ts`.
- To add a page: add it to `ROUTES`, add `nav`/`pages` entries to both dictionaries, create `src/pages/[lang]/<slug>.astro`.

## SEO and `siteUrl` (Stage 6b)

`siteUrl` in `src/config/site.config.mjs` is the production address of the site (a bare origin such as `https://example.org`, no path; a typo fails the build). Search engines need **absolute** URLs for some tags, so the output depends on it:

| | `siteUrl` empty (now) | `siteUrl` set |
| --- | --- | --- |
| `<link rel="canonical">` | none | absolute, own URL |
| hreflang `en`, `he`, `x-default` | none (relative hreflang is invalid) | absolute; `x-default` is the language entry page `/` |
| `og:url`, `og:image` | none | `og:url` yes; `og:image` only if a raster file exists at `public/assets/brand/og-image.(png\|jpg\|webp)` |
| sitemap (`sitemap-index.xml`) | none | generated, with `en`/`he` alternates |
| `robots.txt` (generated by `src/pages/robots.txt.ts`) | `Allow: /` only | plus a `Sitemap:` line |

Always present: title, meta description, `og:type/site_name/title/description/locale/locale:alternate`, Twitter card tags; the 404 page is `noindex`. No JSON-LD is emitted (it would assert facts we do not have). Part A names no default language, so `x-default` is the entry page (see `ISSUES.md`, SEO-02). The build never fails because `siteUrl` is empty. Known issues and unverified items: `ISSUES.md`.

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
- A **citation instance** is one marker in one place: `{ id: 'c-home-hero-1', ref: '<reference id>', page: 'home', section: 'hero' }`.
  One reference can have any number of instances (repeated citation, several pages).
- The **number** shown in `[1]` is the reference's position in `references.mjs` (first record = 1), the same on every page. Identity is the
  `id`, never the number or the title, so re-ordering or replacing a source never breaks a marker or backlink.
- **Marker** (`<Cite id="c-home-hero-1" lang={lang} />`): an anchor to `/{lang}/resources/#ref-<reference id>`. This works with no JavaScript.
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

## Partnerships and Data (Stage 4)

- **Partnerships** (`src/pages/[lang]/partnerships.astro`): two `IntentTiles` ("Acquire more clients" -> `#working-with-daphi`; "Monetize my granular FLW data" -> `/{lang}/data/#share-data`),
  the "Working with Daphi" section (general copy, plus placeholder cards for model / eligibility / terms / getting started, and a partnership mailto), and a pointer to the Data page (`#data-collaboration`, no duplicated content).
- **Data** (`src/pages/[lang]/data.astro`): `#explore-data` (states the platform is not deployed; document link, "notify me" and "early access" mailtos), `#request-measurement`, `#share-data` (with all caveats).
- **Platform document link**: set `futurePlatformDocUrl` in `src/config/site.config.mjs` to an `https://` URL. While it is empty (or not https) no link is rendered; a marked placeholder is shown instead (`src/lib/external.ts`).
- Copy and every mailto subject/body: `partnerships` and `data` blocks in `src/i18n/en.ts` / `he.ts` (built with `buildMailto`).
- Stable section ids: `SECTION_IDS` plus `SECTION_PAGES` (which page each lives on) in `src/config/routes.mjs`. Add both when you add a section other pages link to.
- Intent journeys that must keep working are listed in `scripts/journeys.mjs`.

## About and Acknowledgments (Stage 5)

- **About** (`src/pages/[lang]/about.astro`): `#our-story` and `#how-we-work` (three clearly marked placeholder paragraphs each, copy in the `about` block of `src/i18n/en.ts` / `he.ts`),
  `#timeline` (the data-driven timeline, ended by the sensor funding appeal `#sensor-funding-about`, "Discuss funding opportunities"), and `#contact` (the email address with the email icon).
  The "On this page" links (`JumpNav`) are plain anchors.
- **Timeline** is edited in **`src/data/timeline.mjs`** only (the header comment documents every field). Each item has a stable `id`, a `status` (`confirmed` | `placeholder`), an optional date
  (`{ label, iso? }`), a title, a description, and optional `link` / `project`. `current: true` marks the one current milestone ("Developing a sensor"); `planned: true` marks something planned but not done.
  Undated items read "Date not yet confirmed": **never guess a date**. The current milestone's title and description are read from `src/data/sensor.mjs` (`milestone`), so Home and About cannot drift.
  The component (`src/components/Timeline.astro`) is one column with the line and markers at the inline-start edge, so it is correct in LTR and RTL with logical properties only.
  State is not colour-only: the current item is a filled panel with the text "Current milestone"; placeholders have dashed borders and a badge; planned items carry the label "Planned".
  `assertTimelineValid()` fails the build for duplicate ids, not exactly one current item, a placeholder without the `[PLACEHOLDER]` prefix, a dated placeholder or planned item, and similar mistakes.
- **To add a real milestone**: copy an item, give it a new `id`, set `status: 'confirmed'`, remove the `[PLACEHOLDER]` prefixes, add `date: { label: '2019', iso: '2019' }`. Dates render in `<time>`; `npm run check:figures` exempts digits inside `<time>` on the About page only.
- **Funding appeal**: `<FundingCta kind="about">` (shared source `src/data/sensor.mjs`, `funding.about`); heading level 3 because it ends the timeline section.
- **Acknowledgments** (`src/pages/[lang]/acknowledgments.astro`): the list is **`src/data/acknowledgments.mjs`** (header comment documents the fields). Fields `picture`, `linkedin`, `website`, `email` are all optional and simply disappear when missing:
  no picture -> no image and no empty circle; no LinkedIn -> the name is plain text (with it, the name is the link); no website -> no website icon; no email -> no email icon. Values that are not valid (`https://` URL, plain address) count as missing,
  so a typo cannot become a dead link. The rule lives in `entryLinks()` in `src/lib/acknowledgments.ts` and is tested by `npm run test:stage5`.
  Pictures: put the file in `public/assets/people/` and set `picture: 'assets/people/<file>'` (checked at build time; shown as a small circle; decorative `alt=""` because the name is next to it).
  Icons are original generic inline SVG glyphs (website, email); the official email icon is used instead when its file exists. All three seed records are placeholders (`status: 'placeholder'`); no person, URL or address was invented.
  Order is direction-aware with no direction-specific CSS: LTR picture, name, website icon, email icon from the left; RTL the same sequence from the right.
- `StubPage` and the `stub` dictionary block were removed: no page is a stub any more.

## Home, FLW Prevention and the sensor content (Stage 3)

- **Home** (`src/pages/[lang]/index.astro`): hero (exact heading "We prevent food waste." + cited intro), `IntentTiles` ("I want to:"),
  `AppGateway` ("Coming soon"), `SensorSection` (information first, funding appeal last).
- **Intent tile destinations**: FLW Prevention; `/{lang}/partnerships/#working-with-daphi`; Data. Fragment ids come from `SECTION_IDS` in `src/config/routes.mjs`.
  These anchors now live on the real Partnerships and Data sections (Stage 4).
- **Sensor content** is one shared source, `src/data/sensor.mjs` (typed access `src/lib/sensor.ts`): confirmed paragraphs, placeholder details
  (purpose, technical approach, intended application, stage), and both funding appeals (`funding.home` is used on Home, `funding.about` is used on About, see "About and Acknowledgments (Stage 5)").
  `FundingCta.astro` renders either. To fill a detail: edit the text, drop `[PLACEHOLDER]`, set `status: 'confirmed'`. Optional image: `public/assets/brand/sensor-project.*`.
- **Application gateway**: `siteConfig.app` in `src/config/site.config.mjs`. It stays "Coming soon" (email contact only) until `state: 'available'` **and** an `https://` `url` are both set.
- **FLW Prevention** (`src/pages/[lang]/flw-prevention.astro`): sections `#scale`, `#prevention-process`, `#work-with-us`. Page copy is in the `prevention` block of `src/i18n/en.ts` / `he.ts`.
  No figures are published: each place a number would go renders a `StatPlaceholder` (records in `src/data/stat-placeholders.mjs`), and `npm run check:figures` enforces it.
- **Infographic slot**: put the file at `public/assets/brand/flw-prevention-infographic.(svg|png|webp|jpg)`; it replaces the placeholder block automatically. Update `prevention.process.infographic.alt` in both dictionaries to describe it.
- **Business next step**: a mailto link (subject/body in the dictionaries). No form, no booking, no guarantee.

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

The output is static, so **no Cloudflare adapter is needed**. `wrangler.jsonc` serves `./dist` as static assets (`not_found_handling: "404-page"`), and `public/_headers` adds security headers and long-lived caching for fonts and hashed assets. What is known about the Cloudflare account: the owner supplied one Cloudflare build log (after Stage 6b) showing `npm ci` and `astro build` running there. Nothing else about the account, project name, domain or settings is known, so everything below is a description of this project's files plus things to check.

**Settings this project expects**
- Build command `npm run build`; output directory `dist`; Node 22.22 or newer (`.nvmrc` pins 22.22.0, `package.json` `engines` says `>=22.22.0`). Set the Node version explicitly in the Cloudflare build settings if the default is older (check the build log's Node line).
- Workers static assets: `npx wrangler login`, then `npx wrangler deploy` (Wrangler is not a dependency; `npx` fetches it). Pages: connect the repository with the same build command and output directory. Which of the two is used here is the owner's choice and is not decided by this project.
- Reconcile `wrangler.jsonc` (name, `compatibility_date`, `observability`, `previews`) with whatever the existing project or dashboard already defines.

**`_headers` behaviour**
- `/*`: `nosniff`, `Referrer-Policy`, `Permissions-Policy`, and a `Content-Security-Policy` that currently allows **inline scripts and styles** (`'unsafe-inline'`), because the menu/language scripts are inline (ISSUES SEC-01). No third-party origins are allowed; adding analytics, embeds or remote fonts would need a CSP change (and `check:quality` would flag third-party requests).
- `/fonts/*` and `/_astro/*`: `Cache-Control: public, max-age=31536000, immutable`. `/_astro/` files are content-hashed, so this is safe. `/fonts/` files are **not** hashed: if a font file is ever replaced, give it a new filename, otherwise returning visitors keep the old one for up to a year.
- Cloudflare documents `_headers` for both Workers static assets and Pages; verify the headers on the deployed site (see below) rather than assuming.

**404**: the build emits one bilingual `dist/404.html` (`noindex`). With `not_found_handling: "404-page"` (Workers) or on Pages it should be served for unknown paths with HTTP status 404; verify the status code after deploy.

**Custom domain, then `siteUrl`**
1. Attach the custom domain in Cloudflare.
2. Set `siteUrl` in `src/config/site.config.mjs` to the bare origin (for example `https://example.org`; no path, no trailing text; a typo fails the build).
3. Rebuild and redeploy. This turns on canonical, hreflang/`x-default`, `og:url`, the sitemap (`/sitemap-index.xml`) and the `Sitemap:` line in `/robots.txt`.
4. Do not set `siteUrl` to a temporary `*.workers.dev` / `*.pages.dev` address unless that is the address you want in canonical tags. While `siteUrl` is unset the pages carry no canonical and no `noindex`, so a public preview address could be indexed; consider restricting preview URLs (owner decision).

**What a cache can hide**
- A stale local `dist/`: `check:*` and `validate` read whatever is in `dist/`. After changing `siteUrl` or content, run `npm run build` again before `npm run validate`, or you may be checking old output.
- If build caching is enabled for the Cloudflare project (not known), clear it when a change does not appear. Browsers and Cloudflare's edge can also hold old HTML; use a hard reload or a cache purge before concluding that a change failed.

**Verify after deploy** (replace the host; none of this has been run against a real deployment)
```
curl -sI https://HOST/en/            # 200, headers from _headers present
curl -sI https://HOST/en/data        # expect a redirect to the trailing-slash URL
curl -sI https://HOST/no-such-page/  # 404 status, bilingual page body
curl -s  https://HOST/robots.txt     # Allow: /  and the Sitemap line
curl -s  https://HOST/sitemap-index.xml
curl -s  https://HOST/he/ | grep -E 'rel="(canonical|alternate)"|lang=|dir='
curl -sI https://HOST/fonts/varela-round-latin-400-normal.woff2   # long immutable Cache-Control
```
Check that the canonical is the page's own absolute URL, that hreflang `en`, `he` and `x-default` (`/`) are absolute and reciprocal, and that `sitemap-0.xml` lists both languages with alternates.

## Integrating this project into the existing Daphi repository

This project has not been merged, pushed or deployed by anyone: nothing in the existing repository is known to this project. Do not copy files over it blindly. Work on a branch.

**Files most likely to conflict, and what to do**

| File or folder | Reconcile by |
| --- | --- |
| `package.json` | Merge by hand: keep the existing name, license and unrelated scripts; add this project's scripts (all of them, `build` chains four steps) and dependencies (`astro`, `@astrojs/sitemap`, `@astrojs/check`, `@fontsource/*`, `typescript`); set `engines.node` to `>=22.22.0`. |
| `package-lock.json` | Never merge by hand. Delete it after merging `package.json`, run `npm install`, commit the new lockfile, then check `npm ci` works from clean. |
| `astro.config.*` | See the config table. Keep one file; the sitemap, `site`, `trailingSlash`, `build.format` settings must survive. |
| `tsconfig.json`, `wrangler.jsonc`, `.nvmrc`, `.gitignore`, `public/_headers`, `public/favicon.svg` | See the config table. |
| `src/layouts`, `src/pages`, `src/components`, `src/styles`, `src/i18n` | Name clashes are likely. If the old site is being replaced, move the old pages out of `src/pages` first (old routes would otherwise be built too and break `check:routes`). If both must coexist, expect real design work: this project assumes the `/{lang}/…` routes, `BaseLayout`, and its token CSS. |
| `src/pages/robots.txt.ts` vs `public/robots.txt` | Delete any `public/robots.txt`; two sources for the same URL conflict. |
| `scripts/` | Add as a whole; the validators import `src/config/*.mjs` and `src/data/*.mjs` by relative path. |
| `LICENSE`, `CONTENT-AND-DATA-LICENSE.md`, `TRADEMARKS.md` | Keep the existing repository's versions. This project has no `TRADEMARKS.md`, which the License section below links to. |
| `HANDOFF.md`, `ISSUES.md`, `HEBREW_REVIEW.md`, `FINAL-REPORT.md`, this `README.md` | Keep as documentation; merge the README by hand. Do not copy the `.git` folder. |

**Order of steps**
1. Branch the existing repository; read `HANDOFF.md`, `ISSUES.md` and `FINAL-REPORT.md` first.
2. Compare Node and Astro versions of the existing repo with this project's (Astro 7.4, Node 22.22+); decide whether to upgrade the old project or take this one as the base.
3. Reconcile the config files (table below), starting with `package.json`, then regenerate the lockfile.
4. Copy `src/`, `public/`, `scripts/` and the docs; resolve name clashes one file at a time.
5. `npm ci`, then `npm run build`, `npm run check`, `npm run validate`.
6. Run `npm run check:quality -- --require-dist` on the real `dist/`. If it is clean, add it to the `build` script after `check-links` (it was deliberately left out because it had never run on real output; ISSUES BLD-03).
7. Set `siteUrl` temporarily (for example `https://example.test`), build, inspect the sitemap, `robots.txt`, canonical and hreflang, then revert and rebuild.
8. Manual checks in browsers: both languages, RTL, mobile menu, citation popovers, 404, with and without JavaScript.

**How to verify afterwards**: all commands in step 5 and 6 exit 0; `npm run list:placeholders` shows only the items you expect; `dist/` contains `/en/`, `/he/`, `404.html`, `robots.txt`, and no routes from the old site; no `dist/` or `node_modules` is committed.

### Config files to reconcile

| File | What this project needs | What to check in the existing repo |
| --- | --- | --- |
| `package.json` / `package-lock.json` | Scripts as in the Commands table; `type: "module"`; `engines.node >=22.22.0`; deps `astro ^7.4.0`, `@astrojs/sitemap ^3.7.4`; dev deps `@astrojs/check`, `@fontsource/secular-one`, `@fontsource/varela-round`, `typescript ^5.9`. | Existing Astro major version; conflicting scripts named `build`/`check`/`validate`; packages used only by the old site; regenerate the lockfile after merging. |
| `astro.config.mjs` | `site` from `siteConfig.siteUrl` via `normalizeSiteUrl` (undefined when unset); `output: 'static'`; `trailingSlash: 'always'`; `build.format: 'directory'`; `@astrojs/sitemap` **only when `site` is set**, with `i18n: { defaultLocale: DEFAULT_LANG, locales: { en: 'en', he: 'he' } }`. Imports `src/config/*.mjs`. | Existing `site`, `base` (a `base` breaks the root-absolute `/fonts/...` URLs, ISSUES CSS-02), adapter (this project needs none), other integrations, redirects, a different `trailingSlash`. |
| `tsconfig.json` | Extends `astro/tsconfigs/strict`; includes `.astro/types.d.ts`, `src/**/*`, `scripts/**/*`; `allowJs`, `allowImportingTsExtensions`, `noEmit`. | Path aliases or `include` entries of the old project; `astro check` must still pass. |
| `wrangler.jsonc` | `assets.directory: "./dist"`, `not_found_handling: "404-page"`, name, `compatibility_date`, observability block. | Existing worker name, bindings, routes/custom domains, `compatibility_date`; whether the project deploys via Pages instead (then this file may be unnecessary). |
| `.nvmrc` / Node version | `22.22.0`; Astro 7 needs Node 22.22+. | CI configuration, Cloudflare build Node setting, any other version pin. |
| `.gitignore` | Ignores `dist/`, `.astro/`, `.wrangler/`, `node_modules/`, logs, `.env*`, OS/editor files. | Entries of the old project that must stay; `dist/` must be ignored. |
| `public/_headers` | CSP, `nosniff`, referrer and permissions headers on `/*`; immutable caching on `/fonts/*` and `/_astro/*`. | Existing headers, redirects, other static-asset caching; the CSP must not block anything the old site needs (or the reverse). |
| `public/favicon.svg` | A neutral temporary ring, not a Daphi logo. | Replace with the official favicon if one exists. |
| `src/pages/robots.txt.ts` | Generates `/robots.txt` (`Allow: /`, plus `Sitemap:` only when `siteUrl` is set). Replaces `public/robots.txt`. | Delete any `public/robots.txt`; carry over any disallow rules the old file had. |
| `src/config/site.config.mjs` | Email, `siteUrl` (unset), asset paths, `futurePlatformDocUrl`, `app`, `showPlaceholderMarkers`. | Whether an existing config already holds the email/domain; keep one source of truth. |
| `src/config/site-url.mjs` | `normalizeSiteUrl()`: unset gives `''`; accepts a bare http(s) origin; throws on a typo. Imported by the Astro config, `SeoHead`, `robots.txt.ts` and scripts. | Nothing to merge unless another file computes the site URL. |
| `src/config/routes.mjs` | `LANGS`, `DEFAULT_LANG` (only for the sitemap `i18n` option; ISSUES SEO-02), `DIRS`, `ROUTES`, `SECTION_IDS`, `SECTION_PAGES`. | Old routes that must keep working (add redirects); every new section id needs entries in `SECTION_IDS` and `SECTION_PAGES`. |

## Outstanding inputs checklist

Nothing below blocks the build. Run `npm run list:placeholders` for the live list. Tick the boxes as items are supplied.

**Owner decisions**
- [ ] **Production domain.** Goes in `siteUrl` (`src/config/site.config.mjs`). Turns on canonical, hreflang/`x-default`, `og:url`, sitemap and the `Sitemap:` line (ISSUES SEO-01).
- [ ] **Default language** (ISSUES SEO-02). Today `x-default` is the language entry page `/` and `DEFAULT_LANG = 'en'` only configures the sitemap. If a default language is chosen, `x-default` and the entry-page behaviour may need a code change.
- [ ] **Amuta question** (HEB-01): is Daphi a registered amuta? If yes, `עמותה` can replace `יוזמה ללא מטרות רווח` in `src/i18n/he.ts` (see `HEBREW_REVIEW.md`, Stage 6 entries). Also decide the legal form wording in English; none is stated anywhere in the site.
- [ ] **Timeline: keep or delete the planned data-platform item** (TL-01) in `src/data/timeline.mjs`.
- [ ] **Application availability.** Set `app.state: 'available'` and `app.url` (https) in `site.config.mjs`; until both are set the gateway shows "Coming soon" with the email contact.
- [ ] **Optional later:** JSON-LD limited to organisation name and URL (SEO-04); analytics (none exists; would need CSP, quality-check and privacy-notice work).

**Content**
- [ ] **Real references** replacing the six placeholders in `src/data/references.mjs` (keep each `id`; status `needs-verification` or `verified`). Resources, popovers and backlinks update automatically. See "Replace a placeholder with a real source".
- [ ] **Fact-checked statistics** for the four statistic placeholders (`src/data/stat-placeholders.mjs`, each tied to a citation). Expect to adjust `scripts/check-no-figures.mjs` and the validator rule that rejects digits in statistic descriptions, which currently fail on any number in visible text.
- [ ] **About text**: `our-story` and `how-we-work` paragraphs, `about` block of `src/i18n/en.ts` and `he.ts` (lines marked `[PLACEHOLDER]`).
- [ ] **Dated timeline history** in `src/data/timeline.mjs`: three undated placeholder items; add `date: { label, iso }` only with confirmed dates.
- [ ] **Acknowledgment names, photos and links** in `src/data/acknowledgments.mjs` (three placeholder records); pictures in `public/assets/people/`.
- [ ] **Sensor details** (purpose, technical approach, intended application, development stage) in `src/data/sensor.mjs`: drop `[PLACEHOLDER]`, set `status: 'confirmed'`.
- [ ] **Partnerships details**: model, eligibility, terms, getting started (four placeholder cards in the `partnerships` block of `src/i18n/en.ts` and `he.ts`).
- [ ] **FLW Prevention: Daphi's own approach** (placeholder in the `prevention` block of the dictionaries).
- [ ] **Future platform document URL** in `futurePlatformDocUrl` (https). The Data page then shows the link instead of the editorial placeholder.

**Assets**
- [ ] **Raster Open Graph image** at `public/assets/brand/og-image.png|jpg|webp`, ideally 1200x630 (ISSUES SEO-03). Emitted as `og:image` / `twitter:image` only when `siteUrl` is also set.
- [ ] **Official favicon** replacing `public/favicon.svg`.
- [ ] **Prevention-process infographic** at `public/assets/brand/flw-prevention-infographic.(svg|png|webp|jpg)`, and update `prevention.process.infographic.alt` in both dictionaries (A11Y-02).
- [ ] Optional: `public/assets/brand/sensor-project.*`; acknowledgment pictures (above).

**Config values** (`src/config/site.config.mjs`)
- [ ] `siteUrl`, `futurePlatformDocUrl`, `app.url`/`app.state` (above).
- [ ] **`showPlaceholderMarkers: false`** only when all content is final (`npm run list:placeholders -- --strict` should then exit 0).

**Review**
- [ ] **Hebrew native review** of all copy: `HEBREW_REVIEW.md` (all stages, including the entry-page title pairing, SEO-06, and the Latin text in the Hebrew placeholder, HEB-02).
- [ ] Browser, screen-reader, Safari/Firefox and real-touch checks that never ran (ISSUES QA-02, A11Y-01, A11Y-02).
- [ ] First real run of `npm run build`, `npm run check`, `npm run validate` and `npm run check:quality -- --require-dist` (ISSUES BLD-01..03).

## Still to be supplied

See the "Outstanding inputs checklist" above; the longer history is in `HANDOFF.md` section 6 and the status of every known issue in `ISSUES.md`. The final project report is `FINAL-REPORT.md`.

## License
* The *software* is under AGPL-3.0.
* For *trademarks*, *logos*, *graphics*, *articles*, *data*, and all other forms of content and brand material and identity, see [TRADEMARKS.md](/TRADEMARKS.md) and [CONTENT-AND-DATA-LICENSE.md](/CONTENT-AND-DATA-LICENSE.md).
