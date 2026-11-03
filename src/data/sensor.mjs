// @ts-check
/**
 * SHARED SENSOR-PROJECT CONTENT: the single source for the sensor-development text and the two
 * funding appeals. Used by the Home page now and by the About page (Stage 5), so the project
 * description can never drift between pages.
 *
 * What is CONFIRMED (status 'confirmed'): Daphi is currently developing a sensor, as part of its
 * mission to prevent food loss and waste, and is looking for funding for it. NOTHING ELSE is known:
 * no specification, capability, result, stage, date or budget may be added here until verified.
 * Everything else is an explicit placeholder (status 'placeholder', text starting "[PLACEHOLDER]");
 * `npm run list:placeholders` lists it.
 *
 * To fill in a detail: replace the text, drop the "[PLACEHOLDER]" prefix and set status: 'confirmed'.
 * Any text may be a string (both languages) or { en, he }.
 *
 * @typedef {string | { en: string, he: string }} Localized
 * @typedef {{ status: 'confirmed' | 'placeholder', text: Localized }} SensorText
 * @typedef {{ key: string, label: Localized, status: 'confirmed' | 'placeholder', text: Localized }} SensorDetail
 * @typedef {{ heading: Localized, text: Localized, cta: Localized, mail: { subject: Localized, body: Localized } }} SensorFunding
 */

export const sensor = {
  heading: {
    en: 'Developing technology to prevent food waste',
    he: 'מפתחים טכנולוגיה למניעת בזבוז מזון',
  },

  /** Short paragraphs: confirmed statements only. */
  paragraphs: /** @type {SensorText[]} */ ([
    {
      status: 'confirmed',
      text: {
        en: 'Daphi is currently developing a sensor. It is part of our broader mission to prevent food loss and waste.',
        he: 'דפי מפתחת כעת חיישן. הפרויקט הוא חלק מהמשימה הרחבה שלנו למנוע אובדן ובזבוז מזון.',
      },
    },
    {
      status: 'confirmed',
      text: {
        en: 'Alongside our work with food businesses, technology is one of the ways we hope to contribute to that mission. The sensor is a technology development project, and it is still in progress.',
        he: 'לצד העבודה עם עסקי מזון, טכנולוגיה היא אחת הדרכים שבהן אנחנו מקווים לתרום למשימה הזו. החיישן הוא פרויקט פיתוח טכנולוגי, והוא עדיין בתהליך.',
      },
    },
    {
      status: 'confirmed',
      text: {
        en: 'We will add more about the sensor’s purpose, technical approach, intended application and development stage as verified details become available. Until then, we are not publishing specifications, results or timelines.',
        he: 'נוסיף מידע על מטרת החיישן, על הגישה הטכנית, על היישום המיועד ועל שלב הפיתוח ככל שיהיו בידינו פרטים מאומתים. עד אז איננו מפרסמים מפרטים טכניים, תוצאות או לוחות זמנים.',
      },
    },
  ]),

  detailsHeading: { en: 'Project details', he: 'פרטי הפרויקט' },

  /** Details still to be supplied: shown with a placeholder badge. */
  details: /** @type {SensorDetail[]} */ ([
    {
      key: 'purpose',
      label: { en: 'Purpose', he: 'מטרה' },
      status: 'placeholder',
      text: {
        en: '[PLACEHOLDER] A short description of what the sensor is meant to do.',
        he: '[PLACEHOLDER] תיאור קצר של מה שהחיישן נועד לעשות.',
      },
    },
    {
      key: 'approach',
      label: { en: 'Technical approach', he: 'גישה טכנית' },
      status: 'placeholder',
      text: {
        en: '[PLACEHOLDER] A short, verified description of how the sensor works.',
        he: '[PLACEHOLDER] תיאור קצר ומאומת של אופן הפעולה של החיישן.',
      },
    },
    {
      key: 'application',
      label: { en: 'Intended application', he: 'יישום מיועד' },
      status: 'placeholder',
      text: {
        en: '[PLACEHOLDER] Where, and by whom, the sensor is intended to be used.',
        he: '[PLACEHOLDER] היכן ועל ידי מי החיישן מיועד לשמש.',
      },
    },
    {
      key: 'stage',
      label: { en: 'Development stage', he: 'שלב הפיתוח' },
      status: 'placeholder',
      text: {
        en: '[PLACEHOLDER] The current stage of development, once confirmed.',
        he: '[PLACEHOLDER] שלב הפיתוח הנוכחי, לאחר אישורו.',
      },
    },
  ]),

  /** Optional project image: alt text used only when public/assets/brand/sensor-project.* exists. Update it to describe the real image. */
  imageAlt: { en: 'The sensor development project', he: 'פרויקט פיתוח החיישן' },

  /** Funding appeals. `home` ends the Home sensor section; `about` is used on the About page (Stage 5). */
  funding: {
    home: /** @type {SensorFunding} */ ({
      heading: { en: 'Help us bring this development forward', he: 'עזרו לנו לקדם את הפיתוח' },
      text: {
        en: 'We are looking for funding to support the continued development of our sensor. If your organization is interested in supporting this project, we’d love to hear from you.',
        he: 'אנחנו מחפשים מימון כדי להמשיך לפתח את החיישן שלנו. אם הארגון שלכם מעוניין לתמוך בפרויקט, נשמח לשמוע מכם.',
      },
      cta: { en: 'Support sensor development', he: 'תמיכה בפיתוח החיישן' },
      mail: {
        subject: {
          en: "Funding support for Daphi's sensor development",
          he: 'תמיכה במימון פיתוח החיישן של דפי',
        },
        body: {
          en: 'Hello Daphi,\n\nI am writing on behalf of my organization about supporting the development of your sensor.\n\nOrganization:\nHow we would like to be involved:\n\nI look forward to hearing from you.',
          he: 'שלום דפי,\n\nאני פונה בשם הארגון שלי בנוגע לתמיכה בפיתוח החיישן שלכם.\n\nשם הארגון:\nכיצד היינו רוצים להיות מעורבים:\n\nאשמח לשמוע מכם.',
        },
      },
    }),
    about: /** @type {SensorFunding} */ ({
      heading: { en: 'Help us develop the sensor', he: 'עזרו לנו לפתח את החיישן' },
      text: {
        en: 'We are looking for funding to support the development of our sensor and advance this project. If you represent a funding organization, NGO, public institution, or private funder interested in supporting this work, please get in touch.',
        he: 'אנחנו מחפשים מימון לפיתוח החיישן שלנו ולקידום הפרויקט. אם אתם מייצגים ארגון מממן, ארגון לא־ממשלתי, מוסד ציבורי או גוף פרטי המעוניין לתמוך בעבודה הזו, אנא צרו קשר.',
      },
      cta: { en: 'Discuss funding opportunities', he: 'לדיון על אפשרויות מימון' },
      mail: {
        subject: {
          en: "Funding opportunities for Daphi's sensor development",
          he: 'אפשרויות מימון לפיתוח החיישן של דפי',
        },
        body: {
          en: 'Hello Daphi,\n\nI represent an organization that may be interested in funding the development of your sensor, and I would like to discuss the options.\n\nOrganization and type (funder, NGO, public institution, private):\nWhat we have in mind:\n\nI look forward to hearing from you.',
          he: 'שלום דפי,\n\nאני מייצג/ת ארגון שעשוי להיות מעוניין לממן את פיתוח החיישן שלכם, ואשמח לדון באפשרויות.\n\nהארגון וסוגו (גוף מממן, ארגון לא־ממשלתי, מוסד ציבורי, גוף פרטי):\nמה אנחנו שוקלים:\n\nאשמח לשמוע מכם.',
        },
      },
    }),
  },
};
