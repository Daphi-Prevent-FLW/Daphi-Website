import { sensor as sensorData } from '../data/sensor.mjs';
import { localized, type Localized } from './references';
import { buildMailto } from './mailto';
import type { Lang } from '../i18n';

export interface SensorText {
  status: 'confirmed' | 'placeholder';
  text: Localized;
}
export interface SensorDetail extends SensorText {
  key: string;
  label: Localized;
}
export interface SensorFunding {
  heading: Localized;
  text: Localized;
  cta: Localized;
  mail: { subject: Localized; body: Localized };
}
export type FundingKind = 'home' | 'about';

export const sensor = sensorData as unknown as {
  heading: Localized;
  paragraphs: SensorText[];
  detailsHeading: Localized;
  details: SensorDetail[];
  imageAlt: Localized;
  milestone: { title: Localized; description: Localized };
  funding: Record<FundingKind, SensorFunding>;
};

/** Localized heading, copy, button label and ready-to-use mailto link of a funding appeal. */
export function fundingContent(kind: FundingKind, lang: Lang) {
  const f = sensor.funding[kind];
  return {
    heading: localized(f.heading, lang),
    text: localized(f.text, lang),
    cta: localized(f.cta, lang),
    href: buildMailto({ subject: localized(f.mail.subject, lang), body: localized(f.mail.body, lang) }),
  };
}
