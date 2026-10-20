// @ts-check
/**
 * CENTRAL SITE CONFIGURATION: the one place to change site-wide settings.
 * (Plain .mjs so that astro.config.mjs and Node scripts can import it too.)
 *
 * Localized copy lives in src/i18n/*, not here.
 */
export const siteConfig = {
  /**
   * Production URL, e.g. 'https://example.org'. LEFT EMPTY until the domain is confirmed.
   * While empty: no canonical URLs, no sitemap, relative hreflang/OG URLs.
   */
  siteUrl: '',

  /** Central contact address. Every mailto: link is built from this value (see src/lib/mailto.ts). */
  email: 'daphi.dnw@gmail.com',

  /**
   * Brand assets, as paths inside /public (no leading slash).
   * Give a path WITHOUT extension (recommended) to auto-detect .svg/.png/.webp/.jpg/.jpeg,
   * or WITH an extension to require that exact file.
   * If a file does not exist at build time, the site shows a clearly styled fallback instead.
   * Set a value to '' to disable the asset deliberately.
   */
  assets: {
    logo: {
      en: 'assets/brand/daphi-logo-en',
      he: 'assets/brand/daphi-logo-he',
    },
    emailIcon: 'assets/brand/email-icon',
    /** FLW-prevention process infographic (used from Stage 3). */
    preventionInfographic: 'assets/brand/flw-prevention-infographic',
    /** Optional sensor-project imagery (used from Stage 3). */
    sensorImage: 'assets/brand/sensor-project',
    /** Optional Open Graph share image (1200x630). Omitted from metadata when missing. */
    ogImage: 'assets/brand/og-image',
  },

  /**
   * Google Doc about the future data platform. NOT SUPPLIED YET: leave '' (the Data page,
   * from Stage 4, then shows a clearly labelled editorial placeholder, not a link).
   */
  futurePlatformDocUrl: '',

  /**
   * Future application gateway (used from Stage 3). Not deployed.
   * state: 'coming-soon' | 'available'. 'available' only takes effect when url is also set.
   */
  app: {
    state: 'coming-soon',
    url: '',
  },

  /** Show visible [placeholder] markers in the rendered site. Switch to false when content is final. */
  showPlaceholderMarkers: true,
};
