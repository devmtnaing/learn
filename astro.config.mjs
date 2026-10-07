// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

// The site is fully static: every page is prerendered at build time and served
// from a CDN. Nothing here runs per-request, which is why there is no adapter.
// Preact renders the few interactive islands of the AI Engineer section.
export default defineConfig({
  site: 'https://learn.devmtnaing.com',
  // Pages build as /leetcode/two-sum.html and are linked without a slash, so
  // Cloudflare serves /leetcode/two-sum directly instead of redirecting to
  // /leetcode/two-sum/ on every click.
  build: { format: 'file' },
  trailingSlash: 'never',
  integrations: [preact()],
});
