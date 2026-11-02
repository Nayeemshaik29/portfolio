// Single source of truth for personal details (from resume + LinkedIn).
export const profile = {
  name: 'Shaik Nayeem Basha',
  shortName: 'Nayeem',
  role: 'Java Backend Engineer',
  focus: ['Spring Boot', 'Microservices', 'Kafka', 'Secure APIs'],
  pitch:
    'I build backend systems that stay correct under failure — retries, duplicate messages, slow dependencies and race conditions.',
  location: 'Hyderabad, India',
  email: 'bashanayeem79@gmail.com',
  // WhatsApp in international format, digits only (country code + number).
  whatsapp: '918688343878',
  links: {
    github: 'https://github.com/Nayeemshaik29',
    linkedin: 'https://www.linkedin.com/in/nayeem-shaik29/',
    leetcode: 'https://leetcode.com/u/ShaikNayeemBasha/',
  },
  about: [
    "I'm an Associate Software Engineer at LTM in Hyderabad, building backend features with Java and Spring Boot — REST APIs, SQL and production debugging, day in and day out.",
    'Outside work I design and ship complete microservice systems end to end: a banking platform that moves money safely with sagas and a transactional outbox, a dating backend with Kafka-driven notifications, and a LinkedIn-style network with tracing and centralized logging.',
    'With a CEH v12 background, I care about security from the first line of code: JWT at the edge, no identity spoofing between services, and least-privilege everywhere.',
  ],
  stats: [
    { value: '3', label: 'end-to-end microservice platforms' },
    { value: '40', label: 'public repositories' },
    { value: '8.85', label: 'B.Tech CGPA' },
  ],
  experience: [
    {
      role: 'Associate Software Engineer',
      company: 'LTM',
      period: 'Feb 2026 — Present',
      location: 'Hyderabad',
      points: [
        'Develop and maintain backend features using Java and Spring Boot, including REST API development and maintenance.',
        'Write SQL queries, debug application issues, analyze logs and troubleshoot production behaviour.',
        'Use Git and Postman daily; take part in code reviews, stand-ups and sprint work.',
      ],
    },
    {
      role: 'Java Full Stack Trainee',
      company: 'Student Tribe',
      period: 'Jan 2025 — Oct 2025',
      location: 'Hyderabad',
      points: [
        'Built backend modules with Java, Spring Boot, Spring Data JPA, Hibernate and MySQL — from design through deployment.',
        'Developed and tested REST APIs for authentication, exception handling and validation.',
        'Worked with microservices fundamentals: service discovery, API gateway and inter-service communication.',
      ],
    },
  ],
  education: {
    degree: 'B.Tech, Computer Science',
    school: 'KL University',
    period: '2021 — 2025',
    detail: 'CGPA 8.85',
  },
  certifications: [
    { name: 'Claude Code 101', issuer: 'Anthropic', date: 'Issued Oct 2026', id: '' },
    { name: 'Microsoft Certified: AI Business Professional', issuer: 'Microsoft', date: 'Issued Sep 2026 · Expires Sep 2027', id: '4DD68AF6586462AB' },
    { name: 'Microsoft Certified: Security Operations Analyst Associate', issuer: 'Microsoft', date: 'Issued Jun 2026 · Expires Jun 2027', id: 'BEE1D7E2172B4273' },
    { name: 'Microsoft Certified: Security, Compliance, and Identity Fundamentals', issuer: 'Microsoft', date: 'Issued Mar 2026 · Expires Apr 2027', id: 'B5610124D11F7746' },
    { name: 'Certified Ethical Hacker (CEH v12)', issuer: 'EC-Council', date: 'Issued Mar 2024 · Expires Mar 2027', id: 'ECC4207613589' },
    { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '', id: '' },
    { name: 'Red Hat Certified Enterprise Application Developer', issuer: 'Red Hat', date: 'Issued Sep 2023 · Expired Sep 2026', id: '' },
    { name: 'Become a Django Developer', issuer: 'LinkedIn Learning', date: 'Issued Sep 2022', id: '' },
  ],
  skills: [
    { group: 'Backend', items: ['Java', 'Spring Boot', 'Spring Cloud', 'Spring Security', 'JPA / Hibernate', 'REST APIs'] },
    { group: 'Messaging & Resilience', items: ['Apache Kafka', 'Resilience4j', 'Eureka', 'API Gateway', 'OpenFeign'] },
    { group: 'Data', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis'] },
    { group: 'DevOps & Observability', items: ['Docker', 'GitHub Actions', 'AWS EC2', 'Zipkin', 'ELK Stack'] },
    { group: 'Testing & Tools', items: ['JUnit', 'Mockito', 'Maven', 'Postman', 'Git'] },
    { group: 'Frontend', items: ['React', 'Angular', 'JavaScript'] },
  ],
} as const;

export const moreRepos = [
  'Database-Optimization',
  'Design_Patterns',
  'Interview-DSA-Playbook',
  'CredResolve-Assignment',
  'SpringSecurityAdvanced',
  'object-oriented-programming',
  'ManageX',
  'react-fundamentals',
  'CodegnanConnect',
];
