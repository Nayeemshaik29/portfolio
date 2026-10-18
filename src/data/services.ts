// Freelance offerings shown on /services. Prices are "starting from" — edit freely.
export const services = [
  {
    icon: 'server',
    title: 'MVP Backend & REST APIs',
    blurb: 'A production-ready Spring Boot backend for your web or mobile app — auth, database, docs and deployment included.',
    price: { inr: '₹25,000', usd: '$350' },
    timeline: '2–4 weeks',
    includes: [
      'REST API with JWT auth and role-based access',
      'PostgreSQL / MySQL schema, migrations and seed data',
      'Swagger / OpenAPI docs your frontend team can use',
      'Validation, error handling and unit tests',
      'Dockerized and deployed to AWS or a VPS',
    ],
    proof: { label: 'SentinelBank', href: '/projects/sentinelbank' },
    featured: true,
  },
  {
    icon: 'bot',
    title: 'AI Assistant for Your Business',
    blurb: 'A chatbot that answers from your own documents, FAQs or database — with guardrails so it never leaks data or makes things up.',
    price: { inr: '₹30,000', usd: '$400' },
    timeline: '2–3 weeks',
    includes: [
      'RAG over your PDFs, docs or website content',
      'Spring AI with OpenAI, Claude or a private local model',
      'PII masking and read-only tools for safety',
      'Chat widget for your website or an API endpoint',
      'Handover guide to add new documents yourself',
    ],
    proof: { label: 'SentinelBank AI assistant', href: '/projects/sentinelbank' },
    featured: false,
  },
  {
    icon: 'rocket',
    title: 'Dockerize + CI/CD Setup',
    blurb: 'Stop deploying by hand. I containerize your app and set up a pipeline that tests and ships every push.',
    price: { inr: '₹8,000', usd: '$120' },
    timeline: '3–7 days',
    includes: [
      'Dockerfile and one-command Docker Compose',
      'GitHub Actions: build, test, deploy',
      'Deployment to AWS EC2 or your server',
      'Environment and secrets set up properly',
      'README so anyone on your team can run it',
    ],
    proof: { label: 'CI/CD Playground', href: '/projects/ci-cd-playground' },
    featured: false,
  },
  {
    icon: 'layout',
    title: 'Portfolio & Business Websites',
    blurb: 'A fast, mobile-first website that looks sharp, ranks on Google and costs nothing to host.',
    price: { inr: '₹10,000', usd: '$150' },
    timeline: '1–2 weeks',
    includes: [
      'Responsive design with light / dark mode',
      'SEO basics: meta tags, sitemap, social previews',
      'Blog or project pages you can edit in Markdown',
      'Contact form and Google Analytics',
      'Free hosting on Vercel with your domain',
    ],
    proof: { label: 'This website', href: '/' },
    featured: false,
  },
] as const;

export const process = [
  { title: 'Free 20-min call', note: 'You explain the problem; I ask questions and suggest the simplest thing that works.' },
  { title: 'Fixed quote', note: 'Clear scope, timeline and price in writing — no surprise invoices.' },
  { title: 'Build in milestones', note: 'Weekly demos and a shared repo, so you see progress, not promises.' },
  { title: 'Handover & support', note: 'Docs, deployment and 2 weeks of free bug fixes after launch.' },
] as const;

export const faqs = [
  {
    q: 'How do payments work?',
    a: '50% upfront to start, 50% on delivery. For larger projects we split it into milestones. I accept UPI and bank transfer in India, and Upwork / PayPal / Wise internationally.',
  },
  {
    q: 'Do I own the code?',
    a: 'Yes. Once the final payment is made, the code, repository and all accounts are fully yours.',
  },
  {
    q: 'What if I need changes later?',
    a: 'Bug fixes are free for 2 weeks after launch. New features or ongoing maintenance can be done hourly or on a small monthly retainer.',
  },
  {
    q: 'My project is not listed here — can you still help?',
    a: "Probably. If it involves Java, Spring Boot, APIs, databases, Kafka, Docker or AI integration, send me a message and I'll tell you honestly whether I'm a good fit.",
  },
  {
    q: 'When are you available?',
    a: 'I take on a small number of projects at a time and reply to every message within 24 hours, including weekends.',
  },
] as const;
