// =============================================================================
// EXPERIENCE, EDUCATION and CERTIFICATIONS — shown under "Experience" and
// "Education" on the home page. Edit the lists below; no other file changes.
//
// ---- window.EXPERIENCE: professional work history (kept separate from projects)
//
// Fields (title, organization and start are required):
//
//   title             job title
//   organization      employer or client name
//   url               optional link to the organisation's website
//   location          e.g. 'Nairobi, Kenya' or 'Remote'   (omit to hide)
//   type              e.g. 'Full-time', 'Contract', 'Internship'   (omit to hide)
//   start             'YYYY-MM'
//   end               'YYYY-MM', or null for a current role ("Present")
//   description       optional short paragraph
//   responsibilities  array of bullet points: what the role involved
//   achievements      array of bullet points: measurable outcomes you can back up
//   stack             array of technologies used (rendered as tags)
//
// Entries are sorted newest first automatically.
// =============================================================================

window.EXPERIENCE = [
  {
    title: 'Full-Stack Developer',
    organization: 'Payd HQ',
    start: '2026-07',
    end: null,
    responsibilities: [
      'Develop and maintain frontend and backend application functionality.',
      'Implement features, API integrations, and data workflows.',
      'Investigate software defects and resolve technical issues.',
      'Support backend services and integrations with external systems.',
      'Contribute to maintainable code, documentation, and application quality.',
      'Work with application components in a fintech environment involving payment and transaction workflows.',
    ],
  },
  {
    title: 'IT & Network Support Engineer Intern',
    organization: 'Safaricom PLC',
    type: 'Internship',
    start: '2025-05',
    end: '2025-12',
    responsibilities: [
      'Developed automation scripts and tools to streamline operational workflows.',
      'Monitored enterprise systems and analyzed performance information for troubleshooting.',
      'Investigated technical issues and collaborated with engineering teams on solutions.',
      'Supported deployment, maintenance, and troubleshooting of internal technology solutions.',
    ],
  },
  {
    title: 'Web Development, QA & Customer Support',
    organization: 'Payd HQ',
    start: '2024-01',
    end: '2024-05',
    responsibilities: [
      'Tested backend APIs and application functionality against requirements.',
      'Designed and executed test cases to identify functional and integration defects.',
      'Reproduced, documented, and tracked defects for resolution.',
      'Collaborated with developers to improve application quality and reliability.',
    ],
  },
  {
    title: 'Web Developer & Customer Support Intern',
    organization: 'Pragma',
    type: 'Internship',
    start: '2023-05',
    end: '2023-06',
    responsibilities: [
      'Supported web application development using Python, PHP, and MySQL.',
      'Investigated application defects and database-related issues.',
      'Assisted with integrations and application enhancements.',
      'Documented technical issues and collaborated on troubleshooting.',
    ],
    stack: ['Python', 'PHP', 'MySQL'],
  },
];

// ---- window.EDUCATION: degrees and diplomas. Fields: degree, institution, year.
window.EDUCATION = [
  {
    degree: 'Bachelor of Science in Environment Planning and Management',
    institution: 'Kenyatta University',
    year: '2025',
  },
];

// ---- window.CERTIFICATIONS: Fields: name, issuer, year, url (optional link to the credential).
window.CERTIFICATIONS = [
  { name: 'Certificate in Software Engineering', issuer: 'Power Learn Project', year: '2024' },
  { name: 'Certificate in Computer Software Engineering', issuer: 'W3Schools', year: '2024' },
  { name: 'Web Development', issuer: 'Coursera', year: '2023' },
];
