// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL is set on Vercel; the fallback is the expected production URL.
const site = process.env.SITE_URL ?? 'https://nayeem-shaik.vercel.app';

export default defineConfig({
  site,
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      wrap: false,
    },
  },
});
