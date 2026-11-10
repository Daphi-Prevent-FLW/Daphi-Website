# HANDOFF

Read this first when continuing in a new session (see the continuation protocol in the master prompt, Part B.3).

## 1. Stages completed
- **Stage 1: Foundation and architecture**: completed 2026-10-18.
- **Stage 2: Citation system and Resources page**: completed 2026-10-22.
- **Stage 3: Homepage and FLW Prevention**: completed 2026-10-25.
- **Stage 4: Partnerships and Data**: completed 2026-10-26.
- **Stage 5: About and Acknowledgments**: implemented 2026-10-29, **but NOT build-verified** (the Stage 5 session had no network, so `npm ci`/`astro build`/`astro check` could not run; see sections 4 and 5).

- **Stage 6a: Hebrew polish, accessibility, responsive/CSS fixes**: implemented 2026-11-03 (static edits only; **not build-verified**, see sections 4 and 5).
- **Stage 6b: SEO fixes, `check-quality`, issues list**: implemented 2026-11-05 (**not build-verified**; see section 4 and `ISSUES.md`). Deliverable `daphi-website-stage6.zip`.
- **Stage 7: README integration guide, outstanding-inputs checklist, Cloudflare notes, `FINAL-REPORT.md`**: completed 2026-11-09 (documentation only; **not build-verified**). Deliverable `daphi-website-stage7.zip`.

## 2. Next stage
- **No further stage is planned.** Stage 7 was the last. What remains is verification and owner inputs: run `npm ci && npm run build && npm run check && npm run validate && npm run check:quality -- --require-dist` on a machine with network; fix only what breaks; then add `check:quality` to `build`. See `FINAL-REPORT.md`, `ISSUES.md` and the README checklist. The rest of this section is historical.
- **Plan change (overrides Part B for the remaining work).** Because of a limited usage budget, the former Stage 6 is split into three shorter stages, each with its own zip:

  | Stage | Focus | Deliverable |
  | --- | --- | --- |
  | **6a (DONE)** | Hebrew polish, accessibility fixes, responsive/CSS fixes | `daphi-website-stage6a.zip` |
  | **6b (DONE)** | SEO fixes (`x-default`, sitemap config, Open Graph), a new `scripts/check-quality.mjs` for `dist/` with tests, issues list | `daphi-website-stage6.zip` |
  | **7 (DONE)** | README with the integration guide, outstanding-inputs checklist, config files to reconcile, Cloudflare notes, final report (Part A, section 27) | `daphi-website-stage7.zip` |

- **Stage 7 must do:** (1) FIRST run `npm ci && npm run build && npm run check && npm run validate` with network and fix what breaks (nothing since Stage 4 has compiled; the owner's error output was NOT supplied for 6b); especially verify the 6b items in `ISSUES.md` BLD-02/BLD-03 and run `npm run check:quality -- --require-dist` on the real `dist/`; once it is green, add it to `npm run build`. (2) Write the README integration guide, outstanding-inputs checklist, config files to reconcile (now including `src/pages/robots.txt.ts`, `src/config/site-url.mjs`, the sitemap `i18n` option), Cloudflare notes, final report (Part A, section 27). (3) Keep `ISSUES.md` current. Do not change copy or design.
- **Stage 6b changes, for orientation:** `src/config/site-url.mjs` (`normalizeSiteUrl`: '' = unset, bare http(s) origin otherwise, throws on a typo); `SeoHead.astro` (siteUrl set: absolute canonical + hreflang en/he + `x-default` -> `/` + og:url + og:image only if a raster image exists; unset: **none** of those, because hreflang/OG URLs must be absolute and relative ones are invalid; always: title, description, og:type/site_name/title/description/locale/locale:alternate, twitter:card/title/description); `pages/index.astro` (entry page: same rules, `x-default` now `/` instead of `/en/`, OG tags added); `astro.config.mjs` (sitemap only when siteUrl is set, with `i18n` locales `en`/`he`); `public/robots.txt` **deleted** and replaced by the endpoint `src/pages/robots.txt.ts` (Sitemap line only when siteUrl is set); `scripts/check-quality.mjs` + `scripts/lib/quality-core.mjs` + `scripts/test-check-quality.mjs` (107 synthetic tests, `npm run check:quality` / `test:quality`, both in `validate`; NOT in `build` because it never ran on real output); `list-placeholders.mjs` reports the missing og image; `README.md` three small factual fixes. `x-default` = language entry page because Part A names no default language (decision recorded in `ISSUES.md` SEO-02). No JSON-LD (SEO-04). 404 already had `noindex`.
- **Before 6b (historical):** run `npm ci && npm run build && npm run check && npm run validate` on a machine with network access and fix whatever Stages 5 and 6a break (neither was built). Report errors to the next session.
- Stage 6a changes, for orientation: `Header.astro` (switcher `order: 5` on mobile and shown only inside the open menu when JS is on; `max-block-size: 100dvh; overflow-y: auto` while `.menu-open`; header `position: static` when `html:not(.js)` below 70em), `LanguageSwitcher.astro` (no `aria-label`; `ui.switchToLanguage` deleted from `en.ts`/`he.ts`),
  `global.css` (html `scroll-padding` removed, `main:focus { outline: none }`), `Cite.astro` (bigger hit area), component audit fixes (see section 5), Data page now uses `JumpNav`, Hebrew edits listed in `HEBREW_REVIEW.md` "Stage 6 entries".

## 2b. Older notes on the next stage (kept for reference)
- **FIRST, before any Stage 6 work:** run `npm ci && npm run build && npm run check && npm run validate` on a machine with network access and fix whatever the Stage 5 code breaks.
  Stage 5 added Astro components/pages that were written against the existing patterns but never compiled (see section 5). Expect small issues at most; do not redo Stage 5 beyond fixing them.
- **Stage 6: Hebrew polish, accessibility, responsive QA** (optionally merged with Stage 7). Nothing from Stage 6 has been started.
  - `check-no-figures.mjs` now covers every page; the only exemption is digits inside `<time>` on About (timeline dates).
  - New section ids other pages link to need entries in `SECTION_IDS` and `SECTION_PAGES` (the five About ids were added in Stage 5).
  - Native-speaker review: Stage 5 entries are in `HEBREW_REVIEW.md`.

## 3. Key architectural decisions and file locations
- **Astro 7.4, static output**, `trailingSlash: 'always'`, `build.format: 'directory'`. No Cloudflare adapter (static assets served from `dist/`).
- Config: `src/config/site.config.mjs` (email, siteUrl [unset], asset paths, `futurePlatformDocUrl` [unset], `app` gateway state, `showPlaceholderMarkers`).
  Plain `.mjs` so `astro.config.mjs` and Node scripts can import it.
- Routes/langs: `src/config/routes.mjs` (`LANGS`, `DIRS`, `ROUTES`, `SECTION_IDS`). Helpers: `src/lib/routes.ts` (`routePath(lang, id, hash?)`, `withBase`).
  Slugs are identical across languages, so the language switcher maps pages one-to-one.
- i18n: `src/i18n/en.ts` (defines the `Dictionary` type), `src/i18n/he.ts` (must match), `src/i18n/index.ts` (`getDictionary`, `getDir`, `langStaticPaths`).
  Each page has `pages[routeId] = { title (h1), metaTitle, description, lead }`; nav labels in `nav`; shared UI strings in `ui`.
- Pages: `src/pages/[lang]/{index,flw-prevention,partnerships,data,about,resources,acknowledgments}.astro` (all seven are real as of Stage 5),
  `src/pages/index.astro` (language entry), `src/pages/404.astro` (bilingual).
- Layout/components: `src/layouts/BaseLayout.astro`; `src/components/` `Header`, `Footer`, `SeoHead`, `LanguageSwitcher`, `BrandLogo`, `EmailLink`,
  `PlaceholderMark`, `PageHeading` (`StubPage` was removed in Stage 5).
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

### Stage 4 additions
- **Partnerships / Data pages** as described in the README section "Partnerships and Data (Stage 4)". Copy + mailtos: `partnerships` and `data` blocks in `src/i18n/{en,he}.ts`. `stub.sections` and `StubPage`'s `sections` prop were removed.
- **`src/lib/external.ts`** `configuredHttpsUrl()`: the platform doc link renders only for a valid https URL; otherwise `li[data-action="platform-doc"][data-state="missing"]` shows a marked placeholder (no link).
- **Link validator**: `scripts/check-links.mjs` (+ `lib/links-core.mjs` pure logic, `journeys.mjs`, `test-check-links.mjs` with 30 negative tests). Runs in `npm run build` and `npm run validate`.
  `SECTION_PAGES` added to `src/config/routes.mjs`. `.button--secondary` added to `global.css`. `list-placeholders` now also reports unset config values.
- No digits appear in Partnerships/Data copy (figure check passes without extending its allow-list).

### Stage 5 additions
- **About** (`src/pages/[lang]/about.astro`): `JumpNav`, `#our-story`, `#how-we-work` (placeholder paragraphs), `#timeline` (`Timeline` + `<FundingCta kind="about" level={3} id="sensor-funding-about">`), `#contact` (`EmailLink`).
  The funding appeal uses heading level **3** (it ends the timeline section), not the level 2 mentioned in the Stage 4 notes.
- **Timeline data**: `src/data/timeline.mjs` (typed access + validator `assertTimelineValid()` in `src/lib/timeline.ts`; called at build time by `Timeline.astro`). Items: three undated placeholders, `developing-sensor` (`current: true`, confirmed; title/description read from `sensor.milestone` in `src/data/sensor.mjs`), `future-data-platform` (`planned: true`, confirmed as a plan only, links to `/{lang}/data/#explore-data`).
  No dates exist anywhere yet (none are known); the date label is "Now" / "Planned" / "Date not yet confirmed". Dates added later render in `<time datetime>`.
- **Acknowledgments data**: `src/data/acknowledgments.mjs` (three placeholder records, no optional fields), `src/lib/acknowledgments.ts` (`entryLinks()` conditional-rendering rule, `assertAcknowledgmentsValid()`), `src/components/AcknowledgmentEntry.astro`. Pictures from `public/assets/people/` (README there).
- **New components**: `Timeline`, `AcknowledgmentEntry`, `JumpNav`. **Removed**: `StubPage` and the `stub` dictionary block (no page is a stub any more). `src/i18n/{en,he}.ts` gained `about` and `acknowledgments` blocks.
- **Routes**: `SECTION_IDS`/`SECTION_PAGES` gained `aboutStory`, `aboutHow`, `aboutTimeline`, `aboutFunding`, `aboutContact`. `scripts/journeys.mjs` gained five About journeys (jump links + timeline -> Data).
- **Scripts**: `scripts/test-acknowledgments.mjs` (`npm run test:stage5`, 35 checks, part of `npm run validate`). `check-no-figures.mjs` no longer skips About/Acknowledgments (see above). `list-placeholders.mjs` skips the two validator libs (they contain the literal markers in messages).
- Mailto on About: the funding CTA only (`funding.about`: subject "Funding opportunities for Daphi's sensor development" / Hebrew equivalent); the contact section is the plain address.
- Not done on purpose: no citations on About (no factual claims needing a source), so `refs.sections` got no new key.

## 4. Commands run
| Command | Result |
| --- | --- |
| **Stage 7 session (Node 22.23.4, NO WORKING NETWORK)** | |
| Owner's build-error paste | **not supplied again** (unfilled `[PASTE ...]` in the prompt), so no build fixes were made |
| `npm ci` (once) | **FAILED** (npm crashed with network errors); partial `node_modules` removed. `astro build`, `astro check`, `validate`, `check:quality` on real `dist/`, the test-`siteUrl` build: **not run** |
| `test:mailto`, `test:refs`, `test:links`, `test:stage5`, `test:quality` (107 synthetic), `check:contrast` | passed |
| `list:placeholders` | runs (6 refs, 4 stat placeholders, 4 unset config values); script unchanged |
| Edits | README rewritten (commands, Cloudflare, integration guide, config table, checklist), `FINAL-REPORT.md` added, `ISSUES.md` updated, comment fix in `site.config.mjs`. No code, copy or design change. `check:quality` NOT added to `build` (unverified) |
|  |  |
| **Stage 6b session (Node 22.23.4, NO WORKING NETWORK)** | |
| Owner's build-error paste | **not supplied** (the prompt still contained the unfilled "[PASTE ...]" placeholder), so no build fixes were made |
| **Owner's Cloudflare build log (after 6b)** | `npm ci` OK (282 packages), `astro build` OK (16 pages, `/robots.txt` emitted, so BLD-02 compile risk is resolved), `validate-refs` OK; **`check-routes` FAILED**: it still required hreflang on every page. Fixed after the log: it now requires hreflang/x-default only when `siteUrl` is set and rejects it when unset. `check-links` never ran (the build stopped); rerun is needed |
| `npm ci` (tried once, not retried) | **FAILED** (npm crashed with network errors; a partial `node_modules` without Astro was removed). `astro build`, `astro check`, `npm run build`, `npm run validate` and every check on a real `dist/` were **not run** |
| `check:contrast`, `test:mailto`, `test:refs`, `test:links`, `test:stage5`, `validate-refs.mjs` (registry only) | passed after the 6b edits |
| `npm run test:quality` | passed: 107 tests on SYNTHETIC fixtures (not the real build); it first caught two bugs in the new checker (canonical/alternate `<link>` flagged as external; `<script src>` invisible to the scanner), both fixed |
| `node scripts/check-quality.mjs` without `dist/` | skips with a message, exit 0; with `--require-dist` exit 1 (verified) |
| `node scripts/list-placeholders.mjs` | runs; reports siteUrl and og image as unset |
| `tsc` / `astro check` over the edited `.astro`/`.ts` files | **not run** (Astro not installed) |
| Browser / Playwright | **not done** |
|  |  |
| **Stage 6a session (Node-only, NO NETWORK)** | |
| `npm ci` (tried once, not retried) | **FAILED** (no network). `astro build`, `astro check`, `npm run build`, and everything that reads `dist/` were **not run** |
| `npm run test:mailto`, `test:refs` (31 cases), `test:links` (30 cases), `test:stage5` (35 checks), `check:contrast` | passed after the 6a edits (dist-dependent parts skipped: no `dist/`) |
| `tsc --noEmit` (global TypeScript, strict, temp config outside the project) over `src/i18n/{en,he,index}.ts` | passed: `he.ts` still matches the `Dictionary` type after the Hebrew edits and the removal of `ui.switchToLanguage`. `.astro` files are NOT covered |
| Browser / Playwright rendering | **not done** (no built site) |
|  |  |
| **Stage 5 session (Node 22.22.2 / npm 10.9.7, NO NETWORK)** | |
| `npm ci` | **FAILED**: `ENOTFOUND registry.npmjs.org`, no npm cache, Astro not installed anywhere. `astro build`, `astro check`, `npm run build` and everything that reads `dist/` could **not be run** |
| `node scripts/test-acknowledgments.mjs` (`npm run test:stage5`) | passed: 35 checks (conditional rendering incl. invalid values, data validators, timeline rules; most are negative) |
| `node scripts/check-contrast.mjs`, `test-mailto.mjs`, `test-validate-refs.mjs` (31 cases), `test-check-links.mjs` (30 cases), `validate-refs.mjs` (registry only) | passed (dist-dependent parts skipped: no `dist/`) |
| `tsc --noEmit` (global TypeScript, temp config outside the project, `strict`) over `src/i18n/*`, `src/lib/{timeline,acknowledgments,sensor,placeholder}.ts` | passed; negative control (deleted a Hebrew key) correctly failed, then restored. `.astro` files are NOT covered |
| `check-no-figures.mjs` against a synthetic `dist/` in a temp dir | passed for a year inside `<time>` on About; correctly failed for "30%" in About text and for a `<time>` on another page |
| `node scripts/list-placeholders.mjs` | runs; new timeline/acknowledgments/About items are listed |
| Colour contrast of the new combinations (computed) | accent-text on surface 5.33:1, accent-text on background 5.78:1, on-strong on strong 6.41:1 (all >= 4.5:1) |
| Browser / Playwright rendering | **not done** (no built site to render) |

Earlier sessions (kept for reference; the rows below are from the Stage 4 session, Node 22.23.4 / npm 10.9, with network access):

| Command | Result |
| --- | --- |
| `npm ci` (from the Stage 2 zip, before any change) and `npm run build` | passed (baseline) |
| `npm ci` + `npm run build` on the unmodified Stage 3 zip | passed (baseline) |
| `npm run build` (astro build + validate-refs + route check + link check) | passed: 16 pages |
| `npm run check` (astro check) | passed: 0 errors, 0 warnings, 0 hints (59 files) |
| `npm run validate` (contrast, mailto, 31 ref tests, 30 link tests, refs, routes, links, figures) | passed |
| Temporary `futurePlatformDocUrl = https://example.org/test-only` (reverted) + build | link rendered on EN and HE Data pages with `target=_blank rel="noopener noreferrer"`; link check passed; config restored to empty and rebuilt |
| `npm run check:figures` | passed; also proven to fail when a figure ("30%") is injected into a built page |
| `npm run list:placeholders` | runs; see output for the remaining items |
| Playwright + Chromium, Stage 4 (script outside the project) | Partnerships and Data, EN + HE, 1280 px and 375 px: no horizontal overflow, no console errors; screenshots inspected; tile destinations and fragments; jump links; all four Data mailtos read back (subject/body, EN and HE); platform doc shows missing state; Tab/focus outline present |
| Playwright + Chromium, Stage 3 | Home and FLW Prevention, EN + HE, 1280 px and 375 px: no horizontal overflow, no console errors; screenshots inspected; citation popover opens on hover; tile destinations; Partnerships tile lands on `#working-with-daphi`; mailto links (EN/HE) read back correctly |

## 5. Known issues and unverified items
- **Full list with ids: `ISSUES.md`.** The items below are the detailed notes it links to.
- **STAGE 6b IS NOT BUILD-VERIFIED** (see `ISSUES.md` BLD-01..03). Never compiled: `SeoHead.astro`, `pages/index.astro`, `pages/robots.txt.ts`, the `@astrojs/sitemap` `i18n` option. `check-quality` has only run against synthetic fixtures.
- **STAGE 6a IS NOT BUILD-VERIFIED** (nothing compiled or rendered). All 6a changes are static edits to `.astro`/CSS/TS/Hebrew strings. Still unverified: `astro build`, `astro check`, browser rendering (mobile menu order/scroll, switcher visibility with and without JS, header static without JS, citation hit area, timeline link colour), screen readers, Safari/Firefox, real touch devices.
- Stage 6a CSS details worth a visual check: (a) with JS on small screens the switcher appears below the nav only while the menu is open (JS-on desktop is unchanged); (b) with JS off below 70em the switcher is a full-width row below the wrapped nav and the header scrolls away; (c) `Cite` markers use `padding-inline: .5em; margin-inline: -.35em; padding-block: .6em` (the hover background is now taller); (d) `html` no longer has `scroll-padding`, only `[id]` has `scroll-margin` (check anchor offset on Data/About jump links).
- Stage 6a audit fixes (static review only): reduced-motion rule for the tile hover lift; dark-panel link colour for the current timeline item (it would have been dark-on-dark if a link were ever added); `minmax(0, …)` grid tracks in `SensorSection` and `ReferenceEntry` to prevent overflow at 320px; physical margin/padding shorthands replaced with logical properties in the audited components; `SupplyChain` radius made logical. Data page adopted `JumpNav`.
- Remaining symmetric physical shorthands outside the audit list (`margin: 0 0 x` / `x 0 0` in `flw-prevention.astro`, `padding: 0 x` in `PlaceholderMark.astro`): harmless in RTL (the horizontal values are 0 or symmetric) but not yet converted to logical longhands.
- Touch targets: language links and nav links are 44px; `Cite` marker is now larger but its visual size is still small (hit area enlarged only). Not measured in a browser.
- The Hebrew copy changed in 6a (עמותה → יוזמה ללא מטרות רווח etc.) is unreviewed; see `HEBREW_REVIEW.md` "Stage 6 entries" including the consolidated question list. If Daphi IS a registered amuta, עמותה can be restored.
- **STAGE 5 IS NOT BUILD-VERIFIED.** No `astro build`, `astro check`, route check, link check, figure check on real output, or browser render was possible. The new `.astro` files (`about.astro`, `acknowledgments.astro`, `Timeline.astro`,
  `AcknowledgmentEntry.astro`, `JumpNav.astro`) were written by following the existing components' patterns and re-read by hand; they have never been compiled. Likeliest failure points if something breaks:
  Astro/TS typing in `AcknowledgmentEntry.astro` / `Timeline.astro` (`astro check`), a scoped-CSS selector, or a link/id rule in `check-links.mjs` (all ids on About were checked by hand for collisions with Header/Footer).
  The fix is expected to be small; run the commands in section 2 first.
- Stage 5 visuals are unseen: timeline line/marker alignment in LTR and RTL, the current-milestone panel, acknowledgment rows (no real data to test pictures/links with: the logic is unit-tested, the rendering is not), jump links, phones.
- Timeline: all history is placeholder and undated; the only confirmed items are the current sensor milestone and the planned (not deployed) data platform. Adding the planned platform to the timeline was a judgement call (it states only what the brief says: planned, not deployed, no date); delete the item in `src/data/timeline.mjs` if Daphi prefers.
- Acknowledgment pictures use `alt=""` (decorative, name adjacent); icon links use `aria-label`. Not screen-reader tested.
- (Done in 6a) The Data page now uses `JumpNav` instead of its duplicated markup.
- **Stage 4 not verified**: keyboard walk-through beyond one Tab step, screen readers, Safari/Firefox, real touch devices; mail clients opening the mailto links (only the URL contents were read back). Hebrew copy of both pages is new and unreviewed (`HEBREW_REVIEW.md`, Stage 4 entries).
- The Hebrew missing-doc placeholder contains a Latin identifier and path inside RTL text; bidi order looked acceptable in a screenshot but is flagged for review.
- The link validator uses regex-based HTML parsing (tested, incl. unquoted attributes); it is not a full HTML parser.
- **Browser checks (Stage 2)**: Chromium via Playwright was available in the Stage 2 session. It verified the citation system and looked at screenshots of the Resources and FLW Prevention
  pages in EN/HE (desktop, 375 px phone). **Still unverified in a real browser**: the mobile menu behaviour and focus handling, header wrapping near the 70em breakpoint with long Hebrew labels, Safari/Firefox,
  real touch devices (touch was emulated), screen-reader output (aria-describedby is in place but not tested with a screen reader).
- Popover enhancement needs JavaScript. Without JS the marker is a plain link and the popover never shows (the Resources entry holds the same information). The "dismissible with Escape" requirement therefore applies only with JS.
- Playwright's own `hover()`/`tap()` reported the `<a>` marker as obscured by its section (an actionability false alarm; real mouse/touch events at the element's coordinates work). If automated UI tests are written later, use coordinate-based events for markers.
- Home and FLW Prevention no longer use `StubPage`. Stage 3 browser checks did NOT cover: keyboard walk-through of the tiles, the mobile menu, screen readers, Safari/Firefox, real touch devices.
- The `infographic.alt` text is generic (the image is not known yet); update it when the infographic is added.
- The Hebrew copy of both pages is new and unreviewed (see `HEBREW_REVIEW.md`, Stage 3 entries).
- (Fixed in 6a, pending browser check) Tab order on mobile: the language switcher now comes after the nav visually and in the DOM.
- (Changed in 6b) While `siteUrl` is unset the head emits no hreflang, canonical, og:url or og:image (previously root-relative); no sitemap and no `Sitemap:` line (`robots.txt` is generated by `src/pages/robots.txt.ts`). Set `siteUrl` for production.
- CSP in `public/_headers` allows inline scripts; can be tightened later.
- `fonts.css` uses root-absolute `/fonts/...` URLs: fine for deployment at the domain root; revisit if a `base` path is ever configured.
- Stub notice text contains the `[PLACEHOLDER]` source prefix as visible text next to the badge (intentional until Stage 2 formalizes rendering).

## 6. Outstanding inputs (do not block on these)
Raster Open Graph image (`public/assets/brand/og-image.png|jpg|webp`, 1200x630); confirmation of the default language (SEO-02); official favicon (the EN/HE logos and email icon were added to `public/assets/brand/` by the owner before Stage 2; the site picks them up automatically); production domain; Google Doc URL for the future platform; application URL; fact-checked statistics and real references (supplied by the owner);
verified sensor details and stage; About text (story, how we work) and real timeline history with dates; real acknowledgment names/photos/links; prevention-process infographic; native-speaker review of Hebrew.
