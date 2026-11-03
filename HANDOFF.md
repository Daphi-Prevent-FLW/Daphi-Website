# HANDOFF

Read this first when continuing in a new session (see the continuation protocol in the master prompt, Part B.3).

## 1. Stages completed
- **Stage 1: Foundation and architecture**: completed 2026-10-18.
- **Stage 2: Citation system and Resources page**: completed 2026-10-22.
- **Stage 3: Homepage and FLW Prevention**: completed 2026-10-25.

## 2. Next stage
- **Stage 4: Partnerships and Data.** Nothing from Stage 4 has been started (stages may be merged with 5).
- Partially done work: none. Pointers for Stage 4:
  - `partnerships.astro` and `data.astro` still render `StubPage`. The stub already renders the anchors other pages link to (`#working-with-daphi`, `#explore-data`, `#request-measurement`, `#share-data`, ids from `SECTION_IDS`);
    keep those ids on the real sections and remove the `sections` prop and the `stub.sections` dictionary block when done.
  - `IntentTiles.astro` is reusable for the two Partnerships tiles ("Acquire more clients" -> own section; "Monetize my granular FLW data" -> `/{lang}/data/#share-data`).
  - Mailto texts for Stage 4 go in the dictionaries (see `prevention.cta` as the pattern) and are built with `buildMailto`.
  - The Stage 4 internal link/fragment validation script is still to be written (`check-routes.mjs` already checks fragments of root-relative links).
  - `check-no-figures.mjs` skips About/Acknowledgments only; Partnerships/Data must stay free of digits too (or extend its allow-list deliberately).

## 3. Key architectural decisions and file locations
- **Astro 7.4, static output**, `trailingSlash: 'always'`, `build.format: 'directory'`. No Cloudflare adapter (static assets served from `dist/`).
- Config: `src/config/site.config.mjs` (email, siteUrl [unset], asset paths, `futurePlatformDocUrl` [unset], `app` gateway state, `showPlaceholderMarkers`).
  Plain `.mjs` so `astro.config.mjs` and Node scripts can import it.
- Routes/langs: `src/config/routes.mjs` (`LANGS`, `DIRS`, `ROUTES`, `SECTION_IDS`). Helpers: `src/lib/routes.ts` (`routePath(lang, id, hash?)`, `withBase`).
  Slugs are identical across languages, so the language switcher maps pages one-to-one.
- i18n: `src/i18n/en.ts` (defines the `Dictionary` type), `src/i18n/he.ts` (must match), `src/i18n/index.ts` (`getDictionary`, `getDir`, `langStaticPaths`).
  Each page has `pages[routeId] = { title (h1), metaTitle, description, lead }`; nav labels in `nav`; shared UI strings in `ui`.
- Pages: `src/pages/[lang]/{index,flw-prevention,partnerships,data,about,resources,acknowledgments}.astro` (currently render `StubPage`),
  `src/pages/index.astro` (language entry), `src/pages/404.astro` (bilingual).
- Layout/components: `src/layouts/BaseLayout.astro`; `src/components/` `Header`, `Footer`, `SeoHead`, `LanguageSwitcher`, `BrandLogo`, `EmailLink`,
  `PlaceholderMark`, `PageHeading`, `StubPage` (still used by Partnerships, Data, About, Acknowledgments; takes an optional `sections` prop that renders link-target anchors).
- Brand assets: `src/lib/brand.ts` `resolveBrandAsset()` does the build-time existence check (extension auto-detect, SVG viewBox for dimensions). Folder `public/assets/brand/` (+ its README).
- Mailto: `src/lib/mailto.ts` `buildMailto({ to?, subject?, body? })`. Use it for ALL mailto links (never hand-build).
- Styles: `src/styles/tokens.css` (only place for colours/fonts/spacing), `global.css`, `fonts.css`. Logical properties only.
- Header: DOM order is logo, menu toggle, nav, language switcher. The mobile menu is collapsed only when JS is active (`js` class on `<html>`), so no-JS users see the nav.
  Inline script also keeps `#fragment` on language-switch links.
- Contrast decisions: `#478F74` fails 4.5:1 on cream (3.56:1) → borders/icons/large text only; derived `--color-accent-text #2F6B55` for small secondary text; `--color-strong #066466` panels for body text on dark.
- Fonts: both families have only weight 400. Headings use `font-synthesis: none`. Metric-adjusted fallbacks measured against Arial.
- Hebrew wordmark fallback "דפי" and all Hebrew copy were written by the model → `HEBREW_REVIEW.md`.
- Placeholder convention (complete as of Stage 2): source text prefixed `[PLACEHOLDER]` / `[STAT PLACEHOLDER: …]`, data flagged `status: "placeholder"`; rendered via `PlaceholderMark`
  (kinds `text` | `statistic` | `reference`) with the prefix stripped by `src/lib/placeholder.ts`. `showPlaceholderMarkers` hides the badges only (text/status wording stays; the validator warns if off while placeholders remain).
- Scripts: `scripts/check-routes.mjs` (post-build, part of `npm run build`), `check-contrast.mjs`, `test-mailto.mjs` (uses Node's TS stripping), `sync-fonts.mjs`,
  **Stage 2:** `validate-refs.mjs` (+ `lib/refs-core.mjs`, pure logic), `test-validate-refs.mjs` (31 test cases, most of them negative), `list-placeholders.mjs`.

### Stage 2 additions (citation system)
- **Registry**: `src/data/references.mjs` (6 placeholder records, one per topic in 13.2; ids like `flw-global-overview-01`; status `placeholder|needs-verification|verified`; fields optional; text may be string or `{en,he}`).
  Display number = position in the array (documented; same on every page). Identity = `id`.
- **Citation instances**: `src/data/citations.mjs` (`{id, ref, page, section}`; instance id is the DOM id of the marker and the backlink target). **Statistic placeholders**: `src/data/stat-placeholders.mjs` (each tied to a citation instance).
- **Typed access**: `src/lib/references.ts` (`getReference`, `referenceNumber`, `citationsOfReference`, `referencesOfPage`, `referenceHref`, `localized`, ...).
- **Components**: `Cite.astro` (marker + popover + small bundled script; progressive enhancement), `StatPlaceholder.astro`, `PageReferences.astro` (auto-rendered by `BaseLayout` on every page except Resources),
  `ReferenceEntry.astro`, `PlaceholderMark.astro` (extended). The Stage 2 demonstration (`CitationDemo`, `demo` strings, `c-*-demo-*` records) was **removed in Stage 3**.
- **Resources page** (`src/pages/[lang]/resources.astro`): intro, placeholder notice, all entries with backlinks, "Found any mistake? / Let us know!" mailto (`#report-mistake`).
- **i18n**: new `refs` and `demo` blocks (EN + HE); `ui.placeholderBadgeStat/Ref`. Backlink labels use `refs.sections[<section key>]`: add a key there for every new cited section (Stage 3 keys: `hero`, `scale`, `process`).
- **Popover behaviour** (`Cite.astro` script): hover (120 ms open / 250 ms close, hoverable), focus opens, Escape closes, touch: first tap opens, second follows the link, tap outside closes; fixed positioning clamped to the viewport, RTL-aware via `inset-inline-start`.
- **Stage 1 fix**: `check-routes.mjs` now decodes `&amp;` in attribute values (it wrongly rejected multi-parameter mailto links, first exposed by the Resources mailto).

### Stage 3 additions
- **Home** (`src/pages/[lang]/index.astro`): hero with cited intro (`c-home-hero-1..3`), `IntentTiles`, `AppGateway`, `SensorSection` (ends with `FundingCta kind="home"`).
- **FLW Prevention** (`src/pages/[lang]/flw-prevention.astro`): `#scale` (terms, `SupplyChain` strip, four "reading a figure" cards each with a `StatPlaceholder`, measured/estimated/projected), `#prevention-process` (general 4-step cycle, `InfographicSlot`, Daphi-approach placeholder), `#work-with-us` (mailto CTA).
  Copy: `home` and `prevention` blocks in `src/i18n/en.ts` / `he.ts`.
- **Shared sensor content**: `src/data/sensor.mjs` + `src/lib/sensor.ts` (`fundingContent(kind, lang)`). `funding.about` is defined and unused until Stage 5 (About reuses `<FundingCta kind="about" level={2}>`).
- **Data**: 8 citation instances for FLW Prevention, 3 for Home; 4 statistic placeholders (`stat-global-estimate`, `stat-supply-chain-stage`, `stat-business-level`, `stat-environmental-impact`). All six references are cited.
- **New components**: `IntentTiles`, `AppGateway`, `FundingCta`, `SensorSection`, `InfographicSlot`, `SupplyChain`. New CSS in `global.css`: `.section`, `.section__heading`, `.button`.
- **New script**: `scripts/check-no-figures.mjs` (`npm run check:figures`, part of `npm run validate`).
- Display numbers are registry positions, so a page can show [1], [2], [4] (e.g. Home skips [3]); this is by design (same number everywhere).

## 4. Commands run (Node 22.23.4 / npm 10.9, delivery environment)
| Command | Result |
| --- | --- |
| `npm ci` (from the Stage 2 zip, before any change) and `npm run build` | passed (baseline) |
| `npm run build` (astro build + validate-refs + route check) | passed: 16 pages |
| `npm run check` (astro check) | passed: 0 errors, 0 warnings, 0 hints (54 files) |
| `npm run validate` (contrast, mailto, 31 validator tests, refs, routes, figures) | passed |
| `npm run check:figures` | passed; also proven to fail when a figure ("30%") is injected into a built page |
| `npm run list:placeholders` | runs; see output for the remaining items |
| Playwright + Chromium (script kept outside the project) | Home and FLW Prevention, EN + HE, 1280 px and 375 px: no horizontal overflow, no console errors; screenshots inspected; citation popover opens on hover; tile destinations; Partnerships tile lands on `#working-with-daphi`; mailto links (EN/HE) read back correctly |

## 5. Known issues and unverified items
- **Browser checks (Stage 2)**: Chromium via Playwright was available in the Stage 2 session. It verified the citation system and looked at screenshots of the Resources and FLW Prevention
  pages in EN/HE (desktop, 375 px phone). **Still unverified in a real browser**: the mobile menu behaviour and focus handling, header wrapping near the 70em breakpoint with long Hebrew labels, Safari/Firefox,
  real touch devices (touch was emulated), screen-reader output (aria-describedby is in place but not tested with a screen reader).
- Popover enhancement needs JavaScript. Without JS the marker is a plain link and the popover never shows (the Resources entry holds the same information). The "dismissible with Escape" requirement therefore applies only with JS.
- Playwright's own `hover()`/`tap()` reported the `<a>` marker as obscured by its section (an actionability false alarm; real mouse/touch events at the element's coordinates work). If automated UI tests are written later, use coordinate-based events for markers.
- Home and FLW Prevention no longer use `StubPage`. Stage 3 browser checks did NOT cover: keyboard walk-through of the tiles, the mobile menu, screen readers, Safari/Firefox, real touch devices.
- The `infographic.alt` text is generic (the image is not known yet); update it when the infographic is added.
- The Hebrew copy of both pages is new and unreviewed (see `HEBREW_REVIEW.md`, Stage 3 entries).
- Tab order on mobile while the menu is open: the nav links come before the language switcher in the DOM, but the switcher is visually in the top row. Review in Stage 6.
- `hreflang`/OG URLs are root-relative while `siteUrl` is unset (valid locally; search engines want absolute URLs, so set `siteUrl` for production).
- No sitemap is generated until `siteUrl` is set (the sitemap integration needs absolute URLs); `robots.txt` has no Sitemap line yet.
- CSP in `public/_headers` allows inline scripts; can be tightened later.
- `fonts.css` uses root-absolute `/fonts/...` URLs: fine for deployment at the domain root; revisit if a `base` path is ever configured.
- Stub notice text contains the `[PLACEHOLDER]` source prefix as visible text next to the badge (intentional until Stage 2 formalizes rendering).

## 6. Outstanding inputs (do not block on these)
Official favicon (the EN/HE logos and email icon were added to `public/assets/brand/` by the owner before Stage 2; the site picks them up automatically); production domain; Google Doc URL for the future platform; application URL; fact-checked statistics and real references (supplied by the owner);
verified sensor details and stage; About text; real acknowledgment names/photos/links; prevention-process infographic; native-speaker review of Hebrew.
