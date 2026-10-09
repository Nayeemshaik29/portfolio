import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    project: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    summary: z.string(),
    order: z.number(),
    stack: z.array(z.string()),
    repo: z.string().url(),
    status: z.string(),
    highlights: z.array(z.string()),
    flow: z.array(z.object({ label: z.string(), note: z.string() })).default([]),
    category: z.enum(['Microservices', 'Backend', 'DevOps']),
  }),
});

export const collections = { blog, projects };
