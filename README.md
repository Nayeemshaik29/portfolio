# Shaik Nayeem Basha — Portfolio

Personal portfolio and blog of **Shaik Nayeem Basha**, Java Backend Engineer (Spring Boot · Microservices · Kafka).

**Live:** https://nayeem-shaik.vercel.app

Built with [Astro](https://astro.build) — static, fast, no client-side framework. Light/dark themes, mobile-first layout, RSS feed, sitemap and Open Graph images.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # serve the production build
```

## Edit content

| What | Where |
|---|---|
| Name, bio, experience, skills, links | `src/data/profile.ts` |
| Project case studies | `src/content/projects/*.md` |
| Blog posts | `src/content/blog/*.md` (set `draft: true` to hide) |
| "More on GitHub" repos | `src/data/repos.json` + `moreRepos` in `profile.ts` |
| Resume | `public/resume.pdf` |

## Deploy

Every push to `main` is deployed automatically by Vercel (framework preset: Astro).
