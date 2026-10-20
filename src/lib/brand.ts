import fs from 'node:fs';
import path from 'node:path';
import { withBase } from './routes';

export interface BrandAsset {
  /** Root-relative URL (base-aware). */
  src: string;
  /** Intrinsic size when it can be read (SVG viewBox / width+height), to avoid layout shift. */
  width?: number;
  height?: number;
}

const EXTENSIONS = ['.svg', '.png', '.webp', '.jpg', '.jpeg'];
const publicDir = path.resolve(process.cwd(), 'public');

function readSvgSize(file: string): { width?: number; height?: number } {
  try {
    const head = fs.readFileSync(file, 'utf8').slice(0, 2000);
    const vb = head.match(/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
    if (vb) return { width: parseFloat(vb[1]), height: parseFloat(vb[2]) };
    const w = head.match(/<svg[^>]*\swidth\s*=\s*["']([\d.]+)(?:px)?["']/i);
    const h = head.match(/<svg[^>]*\sheight\s*=\s*["']([\d.]+)(?:px)?["']/i);
    if (w && h) return { width: parseFloat(w[1]), height: parseFloat(h[1]) };
  } catch {
    /* unreadable: no intrinsic size */
  }
  return {};
}

/**
 * BUILD-TIME existence check for a brand asset configured in site.config.mjs.
 * Returns null when the asset is not configured or the file does not exist, so callers
 * can render their fallback and never emit a broken URL.
 *
 * `configured` may omit the extension (then .svg/.png/.webp/.jpg/.jpeg are tried in that order).
 */
export function resolveBrandAsset(configured: string | null | undefined): BrandAsset | null {
  if (!configured) return null;
  const rel = configured.replace(/^\/+/, '');
  const candidates = path.extname(rel) ? [rel] : EXTENSIONS.map((ext) => rel + ext);
  for (const candidate of candidates) {
    const abs = path.resolve(publicDir, candidate);
    if (!abs.startsWith(publicDir + path.sep)) continue; // never leave /public
    if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
      const size = abs.endsWith('.svg') ? readSvgSize(abs) : {};
      return { src: withBase(candidate), ...size };
    }
  }
  return null;
}
