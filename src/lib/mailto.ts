import { siteConfig } from '../config/site.config.mjs';

/** encodeURIComponent plus the few characters it leaves alone but that are unsafe in mailto: URLs. */
function encodeComponent(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase(),
  );
}

const EMAIL_RE = /^[^\s@<>"',;:]+@[^\s@<>"',;:]+\.[^\s@<>"',;:]+$/;

export interface MailtoOptions {
  /** Recipient. Defaults to the central address in site.config. */
  to?: string;
  subject?: string;
  /** Plain-text body. Line breaks (\n) are converted to CRLF as RFC 6068 recommends. */
  body?: string;
}

/**
 * THE shared helper for every mailto: link on the site.
 * Subject and body are percent-encoded (spaces as %20, never '+'), so Hebrew text and
 * apostrophes survive on desktop and mobile mail clients.
 */
export function buildMailto({ to = siteConfig.email, subject, body }: MailtoOptions = {}): string {
  if (!EMAIL_RE.test(to)) {
    throw new Error(`buildMailto: invalid email address "${to}"`);
  }
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeComponent(subject)}`);
  if (body) params.push(`body=${encodeComponent(body.replace(/\r?\n/g, '\r\n'))}`);
  return `mailto:${to}${params.length ? '?' + params.join('&') : ''}`;
}
