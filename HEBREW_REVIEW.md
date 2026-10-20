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
