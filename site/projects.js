// =============================================================================
// PROJECTS — the only file you need to edit to add, change or remove projects.
//
// Every project gets a card on the home page and its own detail page at
//   project.html?id=<id>
//
// Fields (only id, title, category and summary are required):
//
//   id            unique, URL-safe slug: lowercase letters, numbers, hyphens
//   title         project name
//   subtitle      one-line label shown above the title on featured cards
//   category      a key from window.PROJECT_CATEGORIES below (drives the filters)
//   featured      true -> also shown large in "Featured work" on the home page
//   status        'completed' | 'in-progress' | 'archived'  (omit to hide the badge)
//   date          'YYYY-MM' when the work started; places it on the timeline.
//                 Dates below are the GitHub repository creation month.
//   summary       one or two sentences for cards
//   description   array of paragraphs for the detail page
//   stack         array of technologies (rendered as tags)
//   repo          GitHub repository URL
//   live          optional live demo URL
//   screenshots   0–3 images: { src, alt, caption }. src is relative to site/,
//                 e.g. 'images/<id>/01-overview.webp'. See README.md.
//   problem       paragraph: what problem the project solves
//   solution      paragraph: the approach taken
//   implementation  array of bullet points: notable technical details
//   results       array of bullet points: actual, verifiable outcomes only
//
// Any optional field can be left out; its section is hidden automatically.
// Content below was taken from each repository's README / description.
// =============================================================================

window.PROJECT_CATEGORIES = {
  fullstack: 'Full-stack & web',
  backend: 'Backend & APIs',
  data: 'Data & analytics',
  go: 'Go',
};

const GH = 'https://github.com/Manoty/';

window.PROJECTS = [
  // ---------------------------------------------------------------- featured
  {
    id: 'paysync',
    title: 'PaySync',
    subtitle: 'Payment orchestration API',
    category: 'backend',
    featured: true,
    date: '2026-04',
    summary:
      'One payment layer over Safaricom M-Pesa (Daraja STK Push) shared by several apps. Consumer systems only ever see pending, success or failed.',
    description: [
      'PaySync wraps the Safaricom M-Pesa Daraja API in a single, centralised payment service. It was built to serve Tixora (ticket payments) and Scott (delivery payments), so neither application has to talk to M-Pesa directly.',
      'It handles STK Push initiation, callback processing, retries and status normalisation, and keeps a full audit trail of every attempt and raw callback.',
    ],
    stack: ['Python', 'Django', 'Django REST Framework', 'PostgreSQL', 'M-Pesa Daraja'],
    repo: GH + 'PaySync-Payment-Orchestration-API',
    problem:
      'Without a central payment layer, every system that accepts M-Pesa has to implement STK Push, callbacks and retries on its own. That duplicates logic, multiplies bugs and scatters the audit trail.',
    solution:
      'A single API that consumer systems call with an API key. PaySync validates the request, checks idempotency, fires the STK Push, records the callback and returns a normalised status. Consumers never see M-Pesa result codes.',
    implementation: [
      'Data model of Payment → PaymentAttempt → CallbackLog; every raw callback is stored before it is processed',
      'Idempotency check on payment initiation',
      'Retry processor with backoff (2, 5 and 10 minutes); permanent failures such as a cancelled request or wrong PIN are not retried',
      'M-Pesa result codes mapped to pending / success / failed through a pluggable status-normaliser factory',
      'API keys stored SHA-256 hashed and bound to a source system; per-client sliding-window rate limiting',
      'Callback endpoint protected by an IP allowlist of Safaricom ranges; phone and amount validation',
      'Structured JSON logging to rotating files, plus a health-check endpoint',
    ],
    // screenshots: [
    //   { src: 'images/paysync/01-api.webp', alt: 'Describe the image', caption: 'Short caption' },
    // ],
  },
  {
    id: 'portfolio-platform',
    title: 'Portfolio Platform',
    subtitle: 'Full-stack CMS · Django + React',
    category: 'fullstack',
    featured: true,
    date: '2026-06',
    summary:
      'A full-stack portfolio CMS: a Django REST API with JWT auth and an admin dashboard, plus a React and TypeScript frontend built with Vite.',
    description: [
      'A self-hosted portfolio platform with a public site and a private admin area. The Django backend is split into apps for accounts, portfolio projects, blog, resume, contact messages, testimonials, site settings and page-view analytics. The React frontend renders the public pages and an admin dashboard for managing all of that content.',
    ],
    stack: ['Python', 'Django', 'Django REST Framework', 'PostgreSQL', 'React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Docker'],
    repo: GH + 'Portfolio-platform',
    implementation: [
      'Django REST Framework API with JWT authentication (Simple JWT) and CORS configuration',
      'Separate Django apps for accounts, portfolio, blog, resume, contact, testimonials, settings and analytics',
      'GitHub import: a service that pulls repositories from the GitHub API into portfolio projects',
      'React + TypeScript frontend with React Router, Zustand state, Axios and Tailwind CSS',
      'Rich-text blog editor (Tiptap) and analytics charts (Recharts) in the admin dashboard',
      'pytest + factory_boy tests; Docker Compose and Render deployment configuration',
    ],
  },
  {
    id: 'speech-to-text',
    title: 'Speech-to-Text Platform',
    subtitle: 'Async transcription API',
    category: 'backend',
    featured: true,
    date: '2026-05',
    summary:
      'Upload audio and get back word-level transcripts. Processing runs in background workers and progress is pushed live over WebSockets.',
    description: [
      'An asynchronous transcription API built with FastAPI, PostgreSQL, Redis, Celery and faster-whisper. Audio is uploaded to S3-compatible storage, queued, transcribed by workers, and made searchable and exportable.',
    ],
    stack: ['Python', 'FastAPI', 'Celery', 'Redis', 'PostgreSQL', 'faster-whisper', 'MinIO / S3', 'Docker', 'Nginx'],
    repo: GH + 'Speech-to-Text-API-platform',
    problem:
      'Transcription is slow and CPU-heavy. Running it inside the request cycle, or in in-process background tasks, loses jobs when the process restarts and cannot scale.',
    solution:
      'A modular monolith where the API only accepts uploads and creates jobs. Celery workers backed by Redis run faster-whisper locally, so no audio leaves the infrastructure, and clients follow progress over WebSockets or signed webhooks.',
    implementation: [
      'JWT and API-key authentication',
      'faster-whisper on Celery workers with word-level timestamps; re-transcription with a different model and version history',
      'SRT, VTT and TXT export',
      'PostgreSQL full-text search (tsvector with a GIN index) instead of a separate search service',
      'HMAC-signed webhook callbacks and WebSocket live job updates',
      'Rate limiting, usage quotas, organisations (multi-tenancy), audit logging and Prometheus metrics',
      'Alembic migrations; Docker and Nginx production configuration; pytest and Locust test setup',
    ],
  },
  {
    id: 'whatsapp-chat-api',
    title: 'WhatsApp Chat Integration API',
    subtitle: 'Multi-tenant messaging backend',
    category: 'backend',
    featured: true,
    date: '2026-05',
    summary:
      'Receives WhatsApp messages from Twilio or Meta by webhook, keeps the conversation history, auto-replies, and pushes live events to agent dashboards.',
    description: [
      'A WhatsApp messaging backend built with Django and Django REST Framework. It receives inbound messages by webhook, stores full conversation history, sends automated replies, assigns conversations to agents and pushes real-time events to dashboards over WebSockets.',
      'A mock mode simulates sends without calling the real API, which keeps local development free.',
    ],
    stack: ['Python', 'Django', 'Django REST Framework', 'Django Channels', 'Celery', 'Redis', 'PostgreSQL', 'Twilio', 'Meta WhatsApp API'],
    repo: GH + 'WhatsApp-Chat-Integration-API',
    problem:
      'Businesses handling customer conversations on WhatsApp need inbound messages stored, routed to the right agent and answered quickly, with each business’s data kept separate.',
    solution:
      'A service layer that processes each inbound webhook once: store the message, detect its language, match auto-reply rules, assign an agent, notify external subscribers and push a WebSocket event. Sends, retries and scheduling run on Celery.',
    implementation: [
      'Multi-tenant data model with full isolation per business account',
      'Auto-reply rules engine with exact, contains and regex matching, scoped by detected language (offline detection with langdetect)',
      'Round-robin agent assignment with capacity limits; conversation labels for triage',
      'HMAC signature verification for Twilio and Meta webhooks; outbound webhooks signed the same way',
      'Database-backed API keys, SHA-256 hashed, with scopes, expiry, IP allowlist and rotation; per-endpoint rate limiting',
      'Text, media and approved-template messages; analytics on volume, response times and agents',
      'Structured JSON logging',
    ],
  },
  {
    id: 'flagr',
    title: 'Flagr',
    subtitle: 'Feature flag & experimentation API',
    category: 'backend',
    date: '2026-05',
    summary:
      'A self-hosted take on LaunchDarkly / Unleash: feature toggles, gradual percentage rollouts and A/B experiments.',
    description: [
      'A feature flag and experimentation API built with Django and Django REST Framework. It supports global toggles, percentage rollouts, weighted A/B experiments and impression / conversion tracking per variant.',
    ],
    stack: ['Python', 'Django', 'Django REST Framework', 'PostgreSQL', 'Redis'],
    repo: GH + 'Feature-flags-api',
    problem:
      'Shipping features gradually and running experiments needs every user to get the same answer for a flag on every request, without storing one assignment row per user.',
    solution:
      'Deterministic, hash-based bucketing: SHA-256 of the user ID plus the flag name, reduced to a bucket from 0 to 99. The same user always lands in the same bucket, and raising a rollout percentage never reassigns users already included.',
    implementation: [
      'Flags and experiments are bucketed independently, so one user’s buckets differ across flags',
      'Weighted variant assignment for A/B tests',
      'Impressions and conversions logged and aggregated per variant',
      'Cached flag evaluation (local memory in development, Redis in production)',
      'Database indexes, input validation and consistent error responses',
    ],
  },
  {
    id: 'lending-club-analytics',
    title: 'LendingClub Loan Analytics',
    subtitle: 'dbt + DuckDB credit-risk pipeline',
    category: 'data',
    featured: true,
    date: '2026-03',
    summary:
      'A dbt pipeline on DuckDB analysing 42,547 LendingClub loans from 2007–2011, with a five-page Streamlit dashboard on default risk and credit pricing.',
    description: [
      'Raw LendingClub data is loaded into DuckDB, modelled with dbt through staging, intermediate and mart layers, and explored in a Streamlit dashboard. The analysis asks whether interest rates priced the credit risk that borrowers actually carried.',
    ],
    stack: ['dbt', 'DuckDB', 'SQL', 'Python', 'Streamlit', 'Plotly', 'ReportLab'],
    repo: GH + 'Lending-Club-Loan-Data-Analytics',
    live: 'https://lending-club-loan-data-analytics-nwjb25pxpxcxvt4owtwjb9.streamlit.app/',
    problem:
      'A raw 390 MB loan export cannot say on its own whether each credit grade was priced to cover its losses. It needs cleaning, deduplication and cohort-level metrics first.',
    solution:
      'A layered dbt project: a staging view that renames, casts and parses dates; an enriched intermediate table with status categories, risk buckets and deduplication; and marts for default rate by grade and weighted average cost of capital.',
    implementation: [
      'stg_loans parses "Dec-2007"-style issue dates with strptime',
      'int_loans_enriched classifies loan status and risk bucket and deduplicates with ROW_NUMBER()',
      'mart_default_rate_by_grade and mart_wacc compute default rates and risk-adjusted return per grade and year',
      'dbt tests: unique and not_null on loan IDs, not_null on key mart columns',
      'The Streamlit app reads precomputed CSVs, so it deploys to Streamlit Cloud without the database file',
    ],
    results: [
      '42,547 loans and $454M funded analysed; overall default rate 15.86%',
      'Only 5 of 35 grade/year cohorts (all Grade A) produced a positive risk-adjusted return',
      'The interest-rate spread from Grade A to G was 11.79 percentage points, against a default-rate spread of 38.32 points',
    ],
  },
  {
    id: 'thelook-ecommerce',
    title: 'TheLook eCommerce Analytics',
    subtitle: 'dbt + DuckDB analytics pipeline',
    category: 'data',
    featured: true,
    date: '2026-02',
    summary:
      'Raw e-commerce data modelled with dbt on DuckDB into dimensions and facts, then published as an interactive Plotly dashboard.',
    description: [
      'A complete analytics engineering workflow, from raw CSVs to a published dashboard. Synthetic e-commerce data (users, products, orders, order items and events) is loaded into DuckDB, cleaned in staging models, and modelled into dimension and fact tables that feed SQL analyses and an HTML dashboard.',
    ],
    stack: ['dbt', 'DuckDB', 'SQL', 'Python', 'Plotly', 'HTML / CSS'],
    repo: GH + 'The-look-eCommerce',
    live: 'https://manoty.github.io/The-look-eCommerce-dashboard/',
    screenshots: [
      {
        src: 'images/thelook-ecommerce/01-overview.webp',
        alt: 'Dashboard header with four KPI tiles for total revenue, orders, average order value and margin, above a revenue-by-category bar chart and a top 10 products table',
        caption: 'KPI overview, revenue by category and top products',
      },
      {
        src: 'images/thelook-ecommerce/02-cohorts-funnel.webp',
        alt: 'Grouped bar chart of users and orders by account-age cohort next to a user journey funnel from page view to purchase',
        caption: 'User cohorts by account age and the event funnel',
      },
      {
        src: 'images/thelook-ecommerce/03-daily-revenue.webp',
        alt: 'Line chart of daily revenue over the last 30 days',
        caption: 'Daily revenue trend for the last 30 days',
      },
    ],
    problem:
      'Raw transactional and event data is not ready for business questions about revenue, product performance, cohorts and conversion.',
    solution:
      'Three layers: raw tables loaded as-is, staging models for type casting and derived columns, and an analytics layer of dimensions (users, products) and facts (order lines, events) used by the queries and the dashboard.',
    implementation: [
      '5 staging models, 2 dimensions and 2 fact tables',
      '7 automated dbt data-quality tests',
      'Auto-generated data dictionary',
      'Python script that renders the Plotly dashboard to static HTML, published on GitHub Pages',
    ],
    results: ['Dashboard published and publicly available on GitHub Pages'],
  },

  // ---------------------------------------------------------------- data
  {
    id: 'crypto-risk-analytics',
    title: 'Crypto Risk Analytics',
    subtitle: 'Quant dashboard on dbt + DuckDB',
    category: 'data',
    date: '2026-02',
    summary:
      'Dashboard of rolling volatility, Sharpe ratio, drawdowns and correlations, plus equal-weight portfolio risk. Data is modelled in dbt on DuckDB.',
    description: [
      'A quantitative crypto analytics dashboard built with Streamlit, DuckDB, Pandas and Plotly, backed by a DuckDB database built from a dbt pipeline with staging, intermediate and mart models.',
    ],
    stack: ['dbt', 'DuckDB', 'Python', 'Pandas', 'Streamlit', 'Plotly'],
    repo: GH + 'Ethereum-Blockchain',
    live: 'https://ethereum-blockchain-8xjnuwnmffppxl7nzflnpu.streamlit.app/',
    implementation: [
      'Daily, 7-day moving-average and cumulative returns',
      '30-day rolling annualised volatility and rolling Sharpe ratio',
      'Cross-asset correlation matrix and drawdown analysis',
      'Equal-weighted portfolio risk metrics',
      'Multi-asset selection, date-range filtering and dataset export',
    ],
  },
  {
    id: 'formula-1-analytics',
    title: 'Formula 1 Analytics',
    category: 'data',
    date: '2026-01',
    summary:
      'End-to-end ELT over the Ergast dataset using medallion-style dbt models, with window functions for running championship standings.',
    stack: ['dbt', 'DuckDB', 'SQL'],
    repo: GH + 'Formula-1-World-Championship-Analytics',
    implementation: [
      'Staging models clean raw CSVs, including non-standard \\N nulls, and enforce types',
      'Intermediate models join races, results and drivers, using window functions for cumulative points and race-by-race rankings',
      'Marts: fct_race_results and dim_drivers for BI tools',
    ],
  },
  {
    id: 'telco-churn',
    title: 'Telco Customer Churn',
    category: 'data',
    date: '2026-03',
    summary: 'Churn prediction and customer-behaviour analysis aimed at retention decisions.',
    stack: ['Python'],
    repo: GH + 'Telco-Customer-Churn-Analytics',
  },

  // ---------------------------------------------------------------- backend
  {
    id: 'tixora',
    title: 'Tixora',
    subtitle: 'Event ticketing platform',
    category: 'fullstack',
    date: '2026-04',
    summary:
      'Full-stack event ticketing and entry management: event creation, ticket sales, QR-based check-in and payment flows.',
    stack: ['Python'],
    repo: GH + 'Tixora',
  },
  {
    id: 'notiflow',
    title: 'Notiflow',
    category: 'fullstack',
    date: '2026-04',
    summary:
      'Notification service with a Django backend, client integrations for Tixora and Scott, and a separate dashboard frontend.',
    stack: ['Python', 'Django'],
    repo: GH + 'Notiflow',
  },
  {
    id: 'api-monitoring',
    title: 'API Monitoring Platform',
    category: 'backend',
    date: '2026-06',
    summary:
      'API monitoring service on FastAPI with async PostgreSQL, Celery and Redis workers and APScheduler.',
    stack: ['FastAPI', 'SQLAlchemy', 'asyncpg', 'Alembic', 'Celery', 'Redis', 'Docker'],
    repo: GH + 'API-Monitoring-Platform.',
  },
  {
    id: 'url-shortener',
    title: 'URL Shortener Platform',
    category: 'backend',
    date: '2026-06',
    summary: 'Async URL shortener on PostgreSQL with sortable ULID IDs, Alembic migrations and a pytest suite.',
    stack: ['FastAPI', 'SQLAlchemy', 'asyncpg', 'Alembic', 'pytest', 'Docker'],
    repo: GH + 'URL-Shortener-Platform',
  },
  {
    id: 'github-analytics',
    title: 'GitHub Analytics Platform',
    category: 'backend',
    date: '2026-06',
    summary:
      'Analyses GitHub repositories for engineering productivity, contribution patterns and repository health.',
    stack: ['Python'],
    repo: GH + 'GitHub-Analytics-Platform',
  },
  {
    id: 'linkedin-outreach',
    title: 'LinkedIn Outreach Generator',
    category: 'backend',
    date: '2026-06',
    summary:
      'Local app that turns pasted LinkedIn profile text into personalised outreach emails, DMs and subject lines.',
    stack: ['Python'],
    repo: GH + 'LinkedIn-AI-Powered-Outreach-Generator',
  },
  {
    id: 'bugzero',
    title: 'Bug Zero',
    category: 'fullstack',
    date: '2026-05',
    summary:
      'Booking platform for a pest-control business, with a quote calculator priced by property size, pest type and urgency.',
    stack: ['JavaScript'],
    repo: GH + 'Bugzero',
  },
  {
    id: 'pharmacy-erp',
    title: 'Pharmacy ERP Frontend',
    category: 'fullstack',
    date: '2025-08',
    summary: 'React frontend for a pharmacy ERP, deployed on Vercel and connected to a separate Python backend API.',
    stack: ['React', 'JavaScript', 'Vercel'],
    repo: GH + 'Pharmacy-erp-frontend',
    live: 'https://pharmacy-erp-frontend-neon.vercel.app',
  },

  // ---------------------------------------------------------------- go
  {
    id: 'hexagonal-architecture-go',
    title: 'Hexagonal Architecture in Go',
    category: 'go',
    date: '2025-03',
    summary: 'Go service structured as ports and adapters, keeping domain logic separate from transport and storage.',
    stack: ['Go'],
    repo: GH + 'hexagonal-architecture',
  },
  {
    id: 'soa-banking-go',
    title: 'SOA Banking System',
    category: 'go',
    date: '2025-03',
    summary:
      'Banking domain split into separate user and transaction services in Go; the user service is layered into domain, application, adapters and infrastructure.',
    stack: ['Go'],
    repo: GH + 'SOA-Banking-SYSTEM',
  },
  {
    id: 'ticket-pipeline-go',
    title: 'Ticket Processing Pipeline',
    category: 'go',
    date: '2025-03',
    summary: 'Ticket-processing pipeline written in Go.',
    stack: ['Go'],
    repo: GH + 'Ticketing-processing-system-pipeline',
  },
];
