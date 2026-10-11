// @ts-check
import { defineConfig } from 'astro/config';

// Static output (the default) is what Cloudflare Pages serves from `dist/`.
export default defineConfig({
  output: 'static',
});
