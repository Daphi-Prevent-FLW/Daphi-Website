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
    fallbackLogoTitle: 'Fallback wordmark: the official logo file has not been added yet',
  },

  stub: {
    notice: '[PLACEHOLDER] The content of this page will be added in a later build stage.',
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
