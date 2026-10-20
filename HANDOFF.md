# HANDOFF

Read this first when continuing in a new session (see the continuation protocol in the master prompt, Part B.3).

## 1. Stages completed
- **Stage 1: Foundation and architecture**: completed 2026-10-18.

## 2. Next stage
- **Stage 2: Citation system and Resources page.** Nothing from Stage 2 has been started.
- Partially done work: none.

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
- Placeholder convention (to be completed in Stage 2): source text prefixed `[PLACEHOLDER]` / `[STAT PLACEHOLDER: …]`, data flagged `status: "placeholder"`.
- Scripts: `scripts/check-routes.mjs` (post-build, part of `npm run build`), `check-contrast.mjs`, `test-mailto.mjs` (uses Node's TS stripping), `sync-fonts.mjs`.

## 4. Commands run (all in the delivery environment, Node 22.22.0 / npm 10.9.4)
| Command | Result |
| --- | --- |
| `npm install` | passed (0 vulnerabilities) |
| `npm run build` (astro build + route check) | passed: 16 pages (14 localized + root + 404) |
| `npm run check` (astro check) | passed: 0 errors, 0 warnings, 0 hints |
| `npm run check:contrast` | passed (all pairs) |
| `npm run test:mailto` | passed |

## 5. Known issues and unverified items
- **No browser was available**, so nothing was rendered or visually inspected: layout, RTL appearance, header wrapping at the 70em breakpoint with long Hebrew labels,
  mobile menu behaviour and focus handling are **unverified in a real browser** (only static analysis and build checks). Do a visual pass in Stage 6 (or sooner locally).
- Tab order on mobile while the menu is open: the nav links come before the language switcher in the DOM, but the switcher is visually in the top row. Review in Stage 6.
- `hreflang`/OG URLs are root-relative while `siteUrl` is unset (valid locally; search engines want absolute URLs, so set `siteUrl` for production).
- No sitemap is generated until `siteUrl` is set (the sitemap integration needs absolute URLs); `robots.txt` has no Sitemap line yet.
- CSP in `public/_headers` allows inline scripts; can be tightened later.
- `fonts.css` uses root-absolute `/fonts/...` URLs: fine for deployment at the domain root; revisit if a `base` path is ever configured.
- Stub notice text contains the `[PLACEHOLDER]` source prefix as visible text next to the badge (intentional until Stage 2 formalizes rendering).

## 6. Outstanding inputs (do not block on these)
Official EN/HE logos and email icon; official favicon; production domain; Google Doc URL for the future platform; application URL; fact-checked statistics and real references (supplied by the owner);
verified sensor details and stage; About text; real acknowledgment names/photos/links; prevention-process infographic; native-speaker review of Hebrew.
