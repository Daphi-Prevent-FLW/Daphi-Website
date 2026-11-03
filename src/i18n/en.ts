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
    /** Headings of sections other pages already link to (Stage 3); their content arrives in Stage 4. */
    sections: {
      workingWithDaphi: 'Working with Daphi',
      exploreData: 'Explore FLW granular data',
      requestMeasurement: 'Request FLW data measurement',
      shareData: 'Share existing FLW data',
    },
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
    /** Suffix for repeated citations in the same section, e.g. "FLW Prevention: The scale of food loss and waste (2)". */
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
      hero: 'Introduction',
      scale: 'The scale of food loss and waste',
      process: 'How prevention works',
    },
  },

  /** Home page (Stage 3). Sensor content lives in src/data/sensor.mjs (shared with the About page). */
  home: {
    /** Hero paragraph: four sentences, the first three followed by a citation marker. */
    hero: {
      a: 'Food takes land, water, energy and work to produce, yet a significant amount of it is lost or wasted before anyone eats it.',
      b: 'Some is lost on the way to market and some is wasted in shops, kitchens and homes, and the two are addressed differently.',
      c: 'Either way, the resources behind that food are lost with it, with consequences for the environment.',
      d: 'Daphi is a nonprofit working to eliminate food loss and waste, starting with prevention in food businesses.',
    },
    intent: {
      heading: 'I want to:',
      tiles: {
        reduce: {
          title: 'Reduce food waste in my organization',
          text: 'How food businesses can prevent food loss and waste, and how Daphi can help.',
        },
        opportunities: {
          title: 'Develop new business opportunities',
          text: 'For technology providers, consultants and other professionals who help food businesses.',
        },
        data: {
          title: 'Use granular FLW data for research',
          text: 'Explore our planned data platform, ask for measurements, or share data you hold.',
        },
      },
    },
    app: {
      badge: 'Coming soon',
      heading: 'Our application',
      text: 'We hope to release an application in the future. It is not available yet.',
      link: 'Email us about the application',
      mailSubject: 'Interest in the Daphi application',
      mailBody:
        'Hello Daphi,\n\nI am interested in the Daphi application and would like to hear more when there is news.\n\nThank you.',
      availableHeading: 'Our application',
      availableText: 'The Daphi application is available.',
      availableLink: 'Open the application',
    },
  },

  /** FLW Prevention page (Stage 3). */
  prevention: {
    scale: {
      heading: 'The scale of food loss and waste',
      intro:
        'Food loss and waste (FLW) arises at every stage of the food system, from farms to kitchens, and in every kind of food business. How large the problem looks depends on what is counted, where, and how, so figures from different sources are not always comparable.',
      termsHeading: 'Food loss and food waste',
      loss: { term: 'Food loss', text: 'Food that is lost earlier in the supply chain, for example during production, harvest, storage and transport.' },
      waste: { term: 'Food waste', text: 'Food that is discarded later, for example in shops, restaurants, canteens and homes.' },
      termsNote:
        'Definitions vary between organizations and studies, and the dividing line is not the same everywhere. Numbers from different sources should not be compared without checking which definition each one uses.',
      chain: {
        label: 'Stages of the food supply chain, from farm to home',
        caption: 'A simplified view. Where one term ends and the other begins differs between organizations and studies.',
        stages: {
          farms: 'Farms and harvest',
          storage: 'Storage and transport',
          processing: 'Processing and manufacturing',
          retail: 'Wholesale and retail',
          foodService: 'Food service',
          households: 'Households',
        },
        tags: { loss: 'Usually called loss', boundary: 'Depends on the definition', waste: 'Usually called waste' },
      },
      readHeading: 'Reading a figure',
      readIntro:
        'Every figure answers a narrow question. Before using one, check what it describes. The cards below show the questions to ask, and where a fact-checked figure will go.',
      cards: {
        global: {
          title: 'Global or local?',
          text: 'A global estimate describes the world as a whole. It does not describe a particular country, sector or business, and it should not be applied directly to yours.',
        },
        stage: {
          title: 'Which stage of the supply chain?',
          text: 'Food is lost or wasted at different rates at different stages, and different stages call for different solutions.',
        },
        business: {
          title: 'Businesses or households?',
          text: 'Food businesses and households waste food in different places and for different reasons. Daphi works with food businesses; waste in homes is a separate question.',
        },
        impact: {
          title: 'What is the impact?',
          text: 'Lost and wasted food carries environmental consequences. How they are counted depends on the method, the scope and the assumptions made.',
        },
      },
      measuredHeading: 'Measured, estimated or projected?',
      measuredIntro: 'The same number can mean very different things depending on how it was obtained.',
      measured: {
        measured: { term: 'Measured', text: 'Counted directly, for example by weighing or recording food in a defined place and period.' },
        estimated: { term: 'Estimated', text: 'Calculated from samples, models or assumptions, so it carries uncertainty.' },
        projected: { term: 'Projected', text: 'A forecast of what may happen in the future if certain assumptions hold.' },
      },
      closing:
        'No figure on this page applies automatically to a particular business. To know the numbers for your own operation, they have to be measured.',
    },
    process: {
      heading: 'How prevention works',
      intro:
        'Prevention means stopping food from becoming loss or waste in the first place, instead of dealing with it afterwards. It is generally regarded as preferable to recovering or recycling food that has already been lost.',
      generalNote: 'This is the general idea of prevention, not a fixed Daphi method.',
      stepsLabel: 'The general cycle of prevention',
      steps: {
        measure: {
          title: 'Measure',
          text: 'Find out how much food is lost or wasted, where in the operation, and why. What is not measured is hard to improve.',
        },
        understand: {
          title: 'Understand the causes',
          text: 'Typical causes include ordering and forecasting, storage and handling, processing and preparation, portion sizes and product specifications. They differ from one business to another.',
        },
        act: {
          title: 'Act on the causes',
          text: 'Change what causes the loss or waste: practices, equipment, planning, training or tools. Technology providers, consultants, chefs and food technologists can help.',
        },
        check: {
          title: 'Check and continue',
          text: 'Measure again to see what changed, and keep adjusting. Prevention is an ongoing process rather than a one-time fix.',
        },
      },
      daphiPlaceholder:
        '[PLACEHOLDER] Daphi’s own approach, services and examples will be described here once they are confirmed.',
      infographic: {
        alt: 'Infographic: how food loss and waste can be prevented in a food business',
        caption: 'How food loss and waste can be prevented.',
        placeholderTitle: 'Infographic coming',
        placeholderText:
          '[PLACEHOLDER] The FLW-prevention infographic will be shown here. Add the file public/assets/brand/flw-prevention-infographic (svg, png, webp or jpg) and it appears automatically.',
      },
    },
    cta: {
      heading: 'Do you run a food business?',
      text: 'If you want to explore how to reduce food loss and waste in your business, get in touch. Tell us about your business and what you would like to achieve.',
      note: 'Writing to us starts a conversation. It does not commit you to anything, and we cannot promise specific results in advance.',
      link: 'Contact Daphi about your business',
      mailSubject: 'Food business inquiry: preventing food loss and waste',
      mailBody:
        'Hello Daphi,\n\nI would like to explore how my food business can prevent food loss and waste.\n\nBusiness name and type:\nLocation:\nWhat we would like to achieve:\n\nThank you.',
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
      lead: 'How big the problem of food loss and waste is, and what preventing it involves.',
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
