# Daphi website

Bilingual (English / Hebrew, LTR / RTL) informational website for **Daphi**, a nonprofit working to eliminate food loss and waste (FLW).
Built with [Astro](https://astro.build) as a fully static site, deployable on Cloudflare.

> **Status: Stage 1 of 7 (foundation).** The site shell, routing, localization, header/footer, design tokens and seven stub pages
> per language exist. Page content, the citation system and the remaining sections arrive in later stages (see `HANDOFF.md`).
> This README is a skeleton that grows with each stage; sections marked *(later stage)* are not written yet.

## Requirements

- **Node.js 22.22.0 or newer** (Astro 7 requirement; `.nvmrc` pins 22.22.0) and npm 10+.
- No global dependencies, environment variables or external files are needed.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Production build to `dist/`, then runs the route/link check |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check` | Astro/TypeScript type check |
| `npm run validate` | Contrast check + mailto helper test + route/link check (run `npm run build` first) |
| `npm run check:routes` | Post-build check of every page, metadata, hreflang, links and `#fragments` |
| `npm run check:contrast` | WCAG contrast check of the design-token colour pairs |
| `npm run test:mailto` | Test of the shared mailto helper |
| `npm run sync:fonts` | Re-copy font files from `@fontsource` to `public/fonts` (already committed) |

*(Later stages add `validate:refs` and `list:placeholders`.)*

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

## Central configuration

`src/config/site.config.mjs` holds: site URL (**unset**), contact email, brand-asset paths, future-platform Google Doc URL (**unset**),
application gateway state, and `showPlaceholderMarkers`. Design tokens (colours, fonts, type scale, spacing) are in
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

The `Content-Security-Policy` in `_headers` currently allows inline scripts (the small menu/language scripts are inline); tighten it in a
later stage if desired.

## Integrating this project into the existing Daphi repository

*(Later stage: written in full in Stage 7.)* Do not copy files over the existing project blindly. Files most likely to conflict:
`package.json`, `package-lock.json`, `astro.config.*`, `tsconfig.json`, `wrangler.*`, `.gitignore`, `.nvmrc`, `public/` (`favicon.svg`,
`robots.txt`, `_headers`), and any existing `src/layouts`, `src/pages`, `src/styles`.

## Still to be supplied

Official logos (EN/HE) and email icon, production domain, Google Doc URL for the future platform, application URL, real references and
statistics, verified sensor details, About text, acknowledgment entries, prevention-process infographic, native review of Hebrew copy.
Full list: `HANDOFF.md`.

## License
* The *software* is under AGPL-3.0.
* For *trademarks*, *logos*, *graphics*, *articles*, *data*, and all other forms of content and brand material and identity, see [TRADEMARKS.md](/TRADEMARKS.md) and [CONTENT-AND_DATA-LICENSE.md](/CONTENT-AND_DATA-LICENSE.md).

