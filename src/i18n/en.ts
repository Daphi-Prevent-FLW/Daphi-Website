/**
 * ENGLISH strings. The shape of this object defines the `Dictionary` type that he.ts must match.
 * Page copy for later stages is added here (and in he.ts), never scattered across components.
 */
const en = {
  lang: {
    code: 'en',
    ogLocale: 'en_US',
    /** Name of this language in itself (shown in the language switcher). */
    nativeName: 'English',
  },

  meta: {
    siteName: 'Daphi',
    defaultDescription: 'Daphi is a nonprofit working to eliminate food loss and waste.',
    /** Text-only wordmark shown while the official logo file is missing. */
    fallbackWordmark: 'Daphi',
  },

  nav: {
    home: 'Home',
    flwPrevention: 'FLW Prevention',
    partnerships: 'Partnerships',
    data: 'Data',
    about: 'About',
    resources: 'Resources',
    acknowledgments: 'Acknowledgments',
  },

  ui: {
    skipToContent: 'Skip to main content',
    homeLinkLabel: 'Daphi, home page',
    primaryNavLabel: 'Main navigation',
    footerNavLabel: 'Footer navigation',
    menu: 'Menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    languageSwitcherLabel: 'Language',
    /** Accessible label for the link that switches TO the given language. */
    switchToLanguage: { en: 'Switch to English', he: 'Switch to Hebrew' },
    contactHeading: 'Contact',
    emailLinkLabel: 'Email Daphi',
    copyright: '© Daphi',
    placeholderBadge: 'Placeholder',
    placeholderBadgeStat: 'Statistic placeholder',
    placeholderBadgeRef: 'Reference placeholder',
    fallbackLogoTitle: 'Fallback wordmark: the official logo file has not been added yet',
  },

  stub: {
    notice: '[PLACEHOLDER] The content of this page will be added in a later build stage.',
  },

  /** References, citation markers and the Resources page (Stage 2). */
  refs: {
    /** Visually hidden word read before a citation number, e.g. "Reference [1]". */
    referenceWord: 'Reference',
    listHeading: 'References',
    intro:
      'Factual claims on this website should be traceable to a source listed here. Numbers in square brackets in the text link to the matching entry, and each entry links back to every place where it is cited.',
    placeholderNotice:
      'Every entry below is an editorial placeholder. None of them is a real publication, and no title, author, date or link here should be read as a verified source. They will be replaced with verified sources.',
    status: {
      placeholder: 'Editorial placeholder: not a real publication',
      'needs-verification': 'Source added but not yet verified',
      verified: 'Verified source',
    },
    fields: {
      organization: 'Author or organization',
      year: 'Year',
      publisher: 'Publisher or journal',
      doi: 'DOI',
      url: 'Link',
      locator: 'Location in the source',
    },
    citedIn: 'Cited in',
    notCited: 'Not cited anywhere yet.',
    /** Suffix for repeated citations in the same section, e.g. "Home: Citation demonstration (2)". */
    citationNumber: 'citation',
    viewFull: 'View full reference',
    pageReferencesHeading: 'References on this page',
    mistake: {
      text: 'Found any mistake?',
      link: 'Let us know!',
      subject: 'Website correction',
      body: 'Hello Daphi,\n\nI found a possible mistake on your website.\n\nPage or address:\nClaim or reference (a number such as [1] is enough):\nWhat seems to be wrong, and a source if you have one:\n\nThank you.',
    },
    /** Human labels for the `section` keys in src/data/citations.mjs (used in backlinks). Add a key per cited section. */
    sections: {
      demo: 'Citation demonstration',
    },
  },

  /** Stage 2 demonstration of the citation system on the Home and FLW Prevention stubs (removed in Stage 3). */
  demo: {
    heading: 'Citation demonstration',
    note: '[PLACEHOLDER] This block only demonstrates citation markers, popovers and backlinks. It is replaced by real page content in a later build stage.',
    home: {
      a: 'Food that is produced but never eaten is a concern for food businesses and for the environment.',
      b: 'Losses in businesses and waste in households are different things and are described separately.',
      c: 'The same source can be cited again wherever it is needed.',
    },
    prevention: {
      a: 'Food can be lost at different stages of the supply chain.',
      b: 'Global estimates should not be applied directly to a single business.',
      c: 'Wasted food has environmental consequences.',
      d: 'Measurement methods differ between studies.',
      e: 'Several approaches to prevention exist.',
      statLead: 'Globally, an estimated',
      statTail: 'of food is lost or wasted.',
    },
  },

  pages: {
    home: {
      title: 'We prevent food waste.',
      metaTitle: 'Daphi | We prevent food waste',
      description:
        'Daphi is a nonprofit working to eliminate food loss and waste. Learn how we help food businesses prevent it.',
      lead: 'Daphi is a nonprofit working to eliminate food loss and waste.',
    },
    flwPrevention: {
      title: 'FLW Prevention',
      metaTitle: 'FLW Prevention | Daphi',
      description: 'How food businesses can prevent food loss and waste, and how Daphi can help.',
      lead: 'Preventing food loss and waste in food businesses.',
    },
    partnerships: {
      title: 'Partnerships',
      metaTitle: 'Partnerships | Daphi',
      description:
        'Ways for technology providers, consultants and other professionals to work with Daphi to help food businesses.',
      lead: 'Working with professionals and organizations that help food businesses.',
    },
    data: {
      title: 'Data',
      metaTitle: 'Data | Daphi',
      description:
        'Granular food loss and waste data: our planned data platform, measurement requests, and sharing existing datasets.',
      lead: 'Granular food loss and waste data.',
    },
    about: {
      title: 'About',
      metaTitle: 'About | Daphi',
      description: 'About Daphi: our story, how we work, and our project timeline.',
      lead: 'Our story, how we work, and our projects.',
    },
    resources: {
      title: 'Resources & References',
      metaTitle: 'Resources & References | Daphi',
      description: 'The sources and references behind the claims made on this website.',
      lead: 'The sources behind the claims on this website.',
    },
    acknowledgments: {
      title: 'Acknowledgments',
      metaTitle: 'Acknowledgments | Daphi',
      description: 'The people who have contributed to Daphi.',
      lead: 'The people who have contributed to Daphi.',
    },
  },

  notFound: {
    title: 'Page not found',
    body: 'The page you are looking for does not exist or has moved.',
    homeLink: 'Go to the home page',
  },
};

export default en;
export type Dictionary = typeof en;
