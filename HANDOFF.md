# HANDOFF

Read this first when continuing in a new session (see the continuation protocol in the master prompt, Part B.3).

## 1. Stages completed
- **Stage 1: Foundation and architecture**: completed 2026-10-18.
- **Stage 2: Citation system and Resources page**: completed 2026-10-22.

## 2. Next stage
- **Stage 3: Homepage and FLW Prevention.** Nothing from Stage 3 has been started. (Stages may be merged, e.g. 3+4, if budget allows.)
- Partially done work: none.
- Stage 3 must: replace the Home and FLW Prevention stubs with real content; **delete the Stage 2 demonstration** (`src/components/CitationDemo.astro`,
  the `<CitationDemo>` line in `StubPage.astro`, the `demo` block in both dictionaries, the `c-home-demo-*`, `c-prevention-demo-*` records in `src/data/citations.mjs`,
  and `stat-demo-global-estimate` in `src/data/stat-placeholders.mjs`) once real citations/statistic placeholders replace them, keeping every reference cited at least once
  (or `allowUncited: true`); use `<Cite>` / `<StatPlaceholder>` for all claims and numbers; add the `refs.sections` labels it needs in both dictionaries.

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
  `PlaceholderMark` (badge only; to be extended in Stage 2), `PageHeading`, `StubPage` (remove as pages get real content).
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
  `ReferenceEntry.astro`, `PlaceholderMark.astro` (extended), `CitationDemo.astro` (**temporary**, Home + FLW Prevention stubs).
- **Resources page** (`src/pages/[lang]/resources.astro`): intro, placeholder notice, all entries with backlinks, "Found any mistake? / Let us know!" mailto (`#report-mistake`).
- **i18n**: new `refs` and `demo` blocks (EN + HE); `ui.placeholderBadgeStat/Ref`. Backlink labels use `refs.sections[<section key>]`: add a key there for every new cited section.
- **Popover behaviour** (`Cite.astro` script): hover (120 ms open / 250 ms close, hoverable), focus opens, Escape closes, touch: first tap opens, second follows the link, tap outside closes; fixed positioning clamped to the viewport, RTL-aware via `inset-inline-start`.
- **Stage 1 fix**: `check-routes.mjs` now decodes `&amp;` in attribute values (it wrongly rejected multi-parameter mailto links, first exposed by the Resources mailto).

## 4. Commands run (all in the delivery environment, Node 22.22.0 / npm 10.9.4)
| Command | Result |
| --- | --- |
| `npm install` | passed (Stage 2 session: 282 packages) |
| `npm run build` (astro build + validate-refs + route check) | passed: 16 pages (14 localized + root + 404) |
| `npm run check` (astro check) | passed: 0 errors, 0 warnings, 0 hints (46 files) |
| `npm run check:contrast` | passed (all pairs) |
| `npm run test:mailto` | passed |
| `npm run validate:refs` | passed: 6 references, 9 markers, 1 statistic placeholder, 14 rendered pages |
| `npm run test:refs` | passed: 31 cases (20 data + 11 rendered-page mutations) |
| `npm run list:placeholders` | runs; reports 6 placeholder references, 1 statistic placeholder, 4 source lines |
| Playwright + Chromium (test script kept outside the project) | passed: hover, focus, Escape, hoverable popover, Enter navigation, backlinks, scroll offset under sticky header, phone-width touch (first tap opens, second follows, tap outside closes), popover inside viewport at 375 px, no horizontal overflow at 375 px, no-JS fallback; English and Hebrew (RTL) |

## 5. Known issues and unverified items
- **Browser checks (Stage 2)**: Chromium via Playwright was available in the Stage 2 session. It verified the citation system and looked at screenshots of the Resources and FLW Prevention
  pages in EN/HE (desktop, 375 px phone). **Still unverified in a real browser**: the mobile menu behaviour and focus handling, header wrapping near the 70em breakpoint with long Hebrew labels, Safari/Firefox,
  real touch devices (touch was emulated), screen-reader output (aria-describedby is in place but not tested with a screen reader).
- Popover enhancement needs JavaScript. Without JS the marker is a plain link and the popover never shows (the Resources entry holds the same information). The "dismissible with Escape" requirement therefore applies only with JS.
- Playwright's own `hover()`/`tap()` reported the `<a>` marker as obscured by its section (an actionability false alarm; real mouse/touch events at the element's coordinates work). If automated UI tests are written later, use coordinate-based events for markers.
- `StubPage` still shows the Stage 1 stub notice (with a badge) above the demo on Home and FLW Prevention.
- Tab order on mobile while the menu is open: the nav links come before the language switcher in the DOM, but the switcher is visually in the top row. Review in Stage 6.
- `hreflang`/OG URLs are root-relative while `siteUrl` is unset (valid locally; search engines want absolute URLs, so set `siteUrl` for production).
- No sitemap is generated until `siteUrl` is set (the sitemap integration needs absolute URLs); `robots.txt` has no Sitemap line yet.
- CSP in `public/_headers` allows inline scripts; can be tightened later.
- `fonts.css` uses root-absolute `/fonts/...` URLs: fine for deployment at the domain root; revisit if a `base` path is ever configured.
- Stub notice text contains the `[PLACEHOLDER]` source prefix as visible text next to the badge (intentional until Stage 2 formalizes rendering).

## 6. Outstanding inputs (do not block on these)
Official favicon (the EN/HE logos and email icon were added to `public/assets/brand/` by the owner before Stage 2; the site picks them up automatically); production domain; Google Doc URL for the future platform; application URL; fact-checked statistics and real references (supplied by the owner);
verified sensor details and stage; About text; real acknowledgment names/photos/links; prevention-process infographic; native-speaker review of Hebrew.
