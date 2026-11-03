# Hebrew review notes

All Hebrew copy was written by the model and needs review by a native Hebrew speaker. Strings live in `src/i18n/he.ts`.
This file is a skeleton that grows with each stage. Sections: (A) terms with more than one reasonable translation,
(B) scientific terms needing expert check, (C) phrases whose tone is uncertain, (D) strings where the English was awkward to translate.

## Stage 1 entries

### A. Terms with more than one reasonable translation
| Where (key) | Current Hebrew | English | Alternatives / question |
| --- | --- | --- | --- |
| `meta.siteName`, `meta.fallbackWordmark` | דפי | Daphi | Transliteration of the name. Confirm the official Hebrew spelling (also used as the **temporary text wordmark** until the official Hebrew logo is added). |
| `nav.acknowledgments` | תודות | Acknowledgments | הוקרה, הכרת תודה, תודות והוקרה |
| `nav.resources` | מקורות | Resources | מקורות והפניות (used as the page heading), משאבים (reads as "resources" in the sense of assets) |
| `nav.partnerships` | שותפויות | Partnerships | שיתופי פעולה |
| `nav.home` | דף הבית | Home | (not shown in the nav; used for the logo link label) |
| `ui.placeholderBadge` | טקסט זמני | Placeholder | מציין מקום, טיוטה |
| `ui.emailLinkLabel` | שליחת דוא״ל אל דפי | Email Daphi | שליחת מייל, כתבו לנו |

### B. Scientific terms needing expert check
| Where (key) | Current Hebrew | English | Question |
| --- | --- | --- | --- |
| `nav.flwPrevention`, `pages.flwPrevention.title` | מניעת אובדן ובזבוז מזון | FLW Prevention | "Food loss and waste" is rendered as אובדן ובזבוז מזון (loss, אובדן, and waste, בזבוז). Confirm this matches the terminology used by Israeli researchers/policy bodies. The English abbreviation "FLW" is not used in Hebrew navigation; consider whether it should appear. |
| `pages.home.description`, `meta.defaultDescription` | מיגור אובדן ובזבוז מזון | eliminate food loss and waste | "מיגור" (eradication) is strong; alternative: צמצום (reduction), מניעה. The English says "eliminate", so מיגור was kept. |
| `pages.data.title` | נתונים | Data | The later "granular data" will need a settled term (נתונים מפורטים / נתונים ברמת פירוט גבוהה / נתונים גרנולריים). |

### C. Phrases whose tone is uncertain
| Where (key) | Current Hebrew | Note |
| --- | --- | --- |
| `pages.home.title` | אנחנו מונעים בזבוז מזון. | English is "We prevent food waste." Is "אנחנו מונעים" the right register? Alternative: "אנו מונעים בזבוז מזון." (more formal). The trailing period was kept to match the English heading. |
| `pages.home.description` | כך אנחנו עוזרים לעסקי מזון למנוע אותם. | "אותם" refers to loss and waste; check that it reads smoothly. |
| `notFound.*` | העמוד שחיפשתם אינו קיים או שהועבר למקום אחר. | Plural-you form (שחיפשתם) used for a neutral audience. |

### D. Strings where the English was awkward to translate
| Where (key) | Note |
| --- | --- |
| `ui.fallbackLogoTitle` | Tooltip for the temporary text logo; wording is technical. |
| `stub.notice` | Temporary build-stage notice, will be removed. |
| `pages.*.lead` (Stage 1 stubs) | Short stub leads; replaced by real copy in later stages. |

Mixed-language handling: the email address is wrapped in `<bdi dir="ltr">`; keep Latin terms (e.g. FLW) isolated the same way when they are added.

## Stage 2 entries (citation system and Resources page)

### A. Terms with more than one reasonable translation
| Where (key) | Current Hebrew | English | Alternatives / question |
| --- | --- | --- | --- |
| `refs.listHeading`, `refs.referenceWord` | מקורות / מקור | References / Reference | הפניות, ביבליוגרפיה. The page heading is "מקורות והפניות" (Resources & References). |
| `ui.placeholderBadgeStat` | נתון זמני | Statistic placeholder | מציין מקום לנתון, נתון להשלמה |
| `ui.placeholderBadgeRef` | מקור זמני | Reference placeholder | מקור להשלמה |
| `refs.fields.publisher` | מוציא לאור או כתב עת | Publisher or journal | מו״ל |
| `refs.fields.locator` | מיקום במקור | Location in the source | עמוד/פרק/טבלה/איור (Page, section, table, figure) |
| `refs.citedIn` | מצוטט במקומות הבאים | Cited in | מופיע ב… |
| `refs.citationNumber` | ציטוט | citation (used as the "(2)" suffix for repeated citations in one place) | (currently the number is shown without the word) |

### B. Scientific terms needing expert check
| Where (key) | Current Hebrew | Question |
| --- | --- | --- |
| `references.mjs` titles (`flw-*-01`) | סטטיסטיקות גלובליות על אובדן ובזבוז מזון; אובדן מזון לאורך שרשראות האספקה; בזבוז מזון בעסקי מזון; השפעות סביבתיות של בזבוז מזון; שיטות למדידת אובדן ובזבוז מזון; גישות למניעת בזבוז מזון | Editorial placeholders only; confirm terminology (e.g. שרשראות האספקה vs שרשרת האספקה; "ברמת העסק"). |
| `stat-placeholders.mjs` description | הערכה גלובלית לכמות המזון שאבדה או בוזבזה; יש לציין שנה, היקף והאם הנתון נמדד או מוערך | Measured vs estimated: נמדד / מוערך. |

### C. Phrases whose tone is uncertain
| Where (key) | Current Hebrew | Note |
| --- | --- | --- |
| `refs.mistake.text/link` | מצאתם טעות? / ספרו לנו! | English: "Found any mistake? / Let us know!". Plural-you, friendly register. |
| `refs.mistake.body` | שלום דפי, … מצאתי טעות אפשרית באתר שלכם. | Prefilled email body in the first person singular; check register. Visitors write to "Daphi" (דפי) as a group (שלכם). |
| `refs.placeholderNotice` | כל הפריטים להלן הם מקומות שמורים לעריכה… | Long, explanatory; check that it is clear to a general reader. |
| `refs.intro` | כל טענה עובדתית באתר צריכה להיות ניתנת לאיתור… | Slightly formal. |

### D. Strings where the English was awkward to translate / mixed-direction notes
| Where | Note |
| --- | --- |
| Reference titles `[PLACEHOLDER] …` | The Latin prefix `[PLACEHOLDER]` is kept in Hebrew titles on purpose (it is the machine-findable source marker). In RTL text it renders at the start of the title; confirm it reads acceptably or whether it should be hidden in Hebrew when the badge is shown. |
| Citation numbers `[1]` | Wrapped in `<bdi dir="ltr">` so the brackets do not flip in RTL. A visually hidden word (מקור) is read before the number by screen readers. |
| `refs.sections.*` | Every new cited section needs a Hebrew label here (Stage 3: hero, scale, process). |

## Stage 3 entries (Home, FLW Prevention, sensor content)

### A. Terms with more than one reasonable translation
| Where (key) | Current Hebrew | English | Alternatives / question |
| --- | --- | --- | --- |
| `home.app.*` | אפליקציה | application | יישום, תוכנה |
| `home.intent.tiles.opportunities.title` | לפתח הזדמנויות עסקיות חדשות | Develop new business opportunities | The English label was kept as supplied; the added line below it clarifies who it is for. |
| `prevention.scale.measured.projected.term` | צפוי (תחזית) | Projected | תחזית, הקרנה |
| `prevention.scale.loss/waste` | אובדן מזון / בזבוז מזון | Food loss / food waste | Confirm against Israeli research and policy usage. |
| `prevention.process.steps.*` | למדוד / להבין את הסיבות / לפעול על הסיבות / לבדוק ולהמשיך | Measure / Understand / Act / Check | Imperative infinitives chosen for a neutral register. |
| `sensor.mjs` `details[*].label` | מטרה, גישה טכנית, יישום מיועד, שלב הפיתוח | Purpose, Technical approach, Intended application, Development stage | |

### B. Scientific terms needing expert check
| Where | Question |
| --- | --- |
| `prevention.scale.chain.*` | Stage names (חוות וקציר, אחסון והובלה, עיבוד וייצור, סיטונאות וקמעונאות, שירותי מזון, משקי בית) and the "usually loss / depends / usually waste" tags: confirm the terminology and the classification. |
| `prevention.scale.measured.*` | נמדד / מוערך / צפוי: confirm the definitions read correctly to a researcher. |
| `stat-placeholders.mjs` (4 records) | Descriptions of the figures still to be supplied. |

### C. Phrases whose tone is uncertain
| Where | Note |
| --- | --- |
| `home.hero.*` | One long paragraph; check flow, especially "וזה משפיע על הסביבה" and "והטיפול בכל אחד מהם שונה". |
| `prevention.cta.*` | Plural-you register. The prefilled mail body uses the slash form "מעוניין/ת", "מתעניין/ת"; consider whether a neutral phrasing is preferred. |
| `sensor.mjs` funding copy | "עזרו לנו לקדם את הפיתוח" / "עזרו לנו לפתח את החיישן" and the CTA labels. |
| `prevention.process.intro` | "בדרך כלל רואים בה אפשרות עדיפה על פני הצלה או מחזור" (the usual preference for prevention over recovery or recycling). |

### D. Mixed-direction / awkward strings
| Where | Note |
| --- | --- |
| `[PLACEHOLDER]` prefix | Stays Latin in source; stripped when rendered (a Hebrew badge is shown). |
| `prevention.process.infographic.placeholderText` | Contains a Latin file path inside Hebrew text; check it renders readably in RTL. |
| FLW abbreviation | Deliberately not used in Hebrew body text (the Hebrew home tile says "נתוני אובדן ובזבוז מזון מפורטים"). |

## Stage 4 entries (Partnerships, Data)

### A. Terms with more than one reasonable translation
| Where (key) | Current Hebrew | English | Alternatives / question |
| --- | --- | --- | --- |
| `partnerships.intent.tiles.clients.title` | להשיג עוד לקוחות | Acquire more clients | להרחיב את מעגל הלקוחות |
| `partnerships.intent.tiles.data.title` | לייצר הכנסה מנתוני אובדן ובזבוז מזון מפורטים שבידי | Monetize my granular FLW data | להפיק ערך כלכלי מ..., לממש את הערך של... |
| `partnerships.working.roles.chefs/foodTech` | שפים מומחים / טכנולוגי מזון | Specialized chefs / food technologists | טכנולוגים של מזון |
| `partnerships.working.rolesHeading` | נשמח לשמוע מ (followed by the list) | We would like to hear from | The dangling prefix מ before a list reads awkwardly; consider "נשמח לשמוע מ..." as a sentence |
| `data.explore.status` | הפלטפורמה עדיין לא הושקה | The platform is not deployed yet | לא פועלת, לא זמינה |
| `data.share.*` | חשיפה סטטיסטית; הכנסה פסיבית | statistical disclosure; passive income | Confirm "אמצעי חשיפה סטטיסטית" is the accepted term (statistical disclosure control: בקרת חשיפה סטטיסטית?) |
| `data.explore.notify.label` | תודיעו לי כשהיא תהיה זמינה | Let me know when it's available | Imperative plural addressed to Daphi; check register |

### B. Scientific terms needing expert check
`data.share.explanation` and `data.share.caveat` (statistical disclosure measures, anonymity): confirm the statistical term and that the caveat is accurate.

### C. Phrases whose tone is uncertain
| Where | Note |
| --- | --- |
| `partnerships.working.note`, `data.measurement.note` | The "no guarantee" wording; check it is firm but not cold. |
| Mail bodies (`*.mailBody`) | Slash forms (מעוניין/ת, מבקש/ת, משתמש/ת) as in Stage 3; consider neutral phrasing. |
| `data.measurement.text` | "ואנחנו נחזור אליכם ונגיד אם אפשר לבצע מדידה" is a soft commitment to reply; confirm Daphi is comfortable with it (same in English). |

### D. Mixed-direction / awkward strings
| Where | Note |
| --- | --- |
| `data.explore.doc.missing` | Contains the Latin identifier `futurePlatformDocUrl` and a file path inside Hebrew text (editorial note, disappears once the URL is set). Check bidi order. |
| Page `title` for the measurement heading | Long heading (copied from the required wording); check line breaks on phones. |

## Stage 5 entries (About and Acknowledgments)

### A. Terms with more than one reasonable translation
| Where (key) | Current Hebrew | English | Alternatives / question |
| --- | --- | --- | --- |
| `about.jump.how`, `about.how.heading` | כך אנחנו עובדים | How we work | דרך העבודה שלנו, שיטת העבודה שלנו |
| `about.timeline.heading` | ציר הזמן של הפרויקטים | Project timeline | אבני דרך, ציר זמן |
| `about.contact.heading`, `about.jump.contact` | צרו קשר | Contact us | (the footer uses יצירת קשר, a noun heading; check whether both forms should match) |
| `timeline.mjs` current milestone title (via `sensor.milestone.title`) | מפתחים חיישן | Developing a sensor | דפי מפתחת חיישן; the Home heading uses a similar "מפתחים…" form |
| `timeline.mjs` date labels | כעת / מתוכנן | Now / Planned | עכשיו, בימים אלה / בתכנון |
| `acknowledgments.listHeading` | תורמים | Contributors | תורמות ותורמים, אנשים שתרמו |
| `acknowledgments.email` | דוא״ל | Email | אימייל, מייל (the rest of the site uses דוא״ל) |
| `acknowledgments.linkedin` | פרופיל בלינקדאין | LinkedIn profile | פרופיל LinkedIn (Latin brand name inside Hebrew text; would need `<bdi>`) |
| `timeline.mjs` placeholder name | [PLACEHOLDER] שם התורם/ת | Contributor name | Slash form for gender neutrality; consider neutral phrasing (e.g. שם) |

### B. Scientific terms needing expert check
`timeline.mjs` `future-data-platform`: פלטפורמת נתונים עתידית על אובדן ובזבוז מזון / נתונים מפורטים על אובדן ובזבוז מזון. "Granular" is rendered as מפורטים here (as on the Data page); the settled term is still open (see Stage 1, section B).

### C. Phrases whose tone is uncertain
| Where | Note |
| --- | --- |
| `about.story.paragraphs`, `about.how.paragraphs` | Editorial notes addressed to Daphi ("יש להשלים על ידי דפי") are visible placeholder text. They disappear when the real text replaces them. |
| `about.timeline.intro` | "הם אינם אירועים אמיתיים" is blunt on purpose (placeholders must not read as history); check the tone. |
| `timeline.mjs` placeholder items | "יש להחליף באירוע מאומת ובתאריך, או למחוק את הפריט" is an instruction to the editor, shown only while the placeholder markers are on. |
| `sensor.milestone.description` | New Hebrew sentence (also used on About only): "דפי מפתחת כעת חיישן כחלק מפעילותה למניעת אובדן ובזבוז מזון…". |
| `acknowledgments.notice` | "הרשומות להלן הן טקסט זמני": check "רשומות" vs "פריטים". |

### D. Mixed-direction / awkward strings
| Where | Note |
| --- | --- |
| Acknowledgment names | Rendered inside `<bdi>`, so a Latin name inside Hebrew text keeps its order. Check with real names. |
| Icon links' `aria-label` | Built as "{label}: {name} {newTab}" (e.g. `אתר אינטרנט: … (נפתח בלשונית חדשה)`); check how a Hebrew screen reader reads it. |
