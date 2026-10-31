// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// SITE_URL is set on Vercel; the fallback is the expected production URL.
const site = process.env.SITE_URL ?? 'https://nayeem-shaik.vercel.app';

export default defineConfig({
  site,
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/admin') })],
  vite: { plugins: [tailwindcss()] },
  // Freelancing has its own section now; keep the old URL working.
  redirects: { '/services': '/freelance' },
  markdown: {
    shikiConfig: { theme: 'github-dark-default', wrap: false },
  },
});
