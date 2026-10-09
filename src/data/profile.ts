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
    { name: 'Certified Ethical Hacker (CEH v12)', issuer: 'EC-Council' },
    { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services' },
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
