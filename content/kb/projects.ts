import { todo } from "@/lib/content";

export type Project = {
  id: string;
  title: string;
  status: string;
  summary: string;
  /** Proof the fit check may cite. Empty until Aswin supplies it; a project without proof is left out. */
  evidence: string[];
  label: string;
  href: string;
  /** Search tags for kb.search (SPEC §6), not claims. Taken from how the design maps requirements to this entry. */
  tags?: string[];
};

export const projects: Project[] = [
  {
    id: "cloudeagle",
    title: "CloudEagle.ai — AI integration builder",
    status: "CONCEPT",
    summary: "Safeguards as the centrepiece. A small sandbox lets you try to break it.",
    evidence: [todo("[evidence]")], // TODO(aswin)
    label: "Case study · CloudEagle concept",
    href: "/work/cloudeagle",
    tags: ["ai agent", "guardrails", "safeguards", "integrations", "evals"],
  },
  {
    id: "job-search-agent",
    title: "Job-search agent",
    status: "IN USE · RECORDED RUN",
    summary: "A multi-step agent that never applies to a job without my approval.",
    // From the master resume and the public CV (Projects).
    evidence: [
      "Designed an agent workflow with Claude, integrated with Google Drive, Docs, Sheets and the browser, that searches and scores LinkedIn jobs, maps resumes to job requirements and tracks applications.",
      "Orchestrated four agents (fit scoring, ideal resume, tailored resume, application after approval), with human approval gates before any application is submitted.",
      "Wrote a custom Claude Skill for job-fit scoring and resume tailoring; connected Google Drive and Chrome through existing MCP connectors.",
      "Used to prepare 20+ applications; fit scores were checked against LinkedIn's match score.",
    ],
    label: "Case study · Job-search agent",
    href: "/work/job-search-agent",
    tags: ["ai agent", "human-in-the-loop", "approval", "workflows"],
  },
  {
    id: "dhees-instagram-agent",
    title: "Dhee's Instagram competitor agent",
    status: "IN USE · RECORDED RUN",
    summary: "What competitors post, what performs, and what Dhee’s should make next.",
    evidence: [todo("[evidence]")], // TODO(aswin)
    label: "Case study · Dhee's agent",
    href: "/work/dhees-instagram-agent",
    tags: ["ai agent", "business stakeholders", "adoption"],
  },
  {
    id: "platform-api-work",
    title: "Platform & API work",
    status: todo("PRE-AI · [STATUS]"), // TODO(aswin)
    summary: todo("Why integrations experience is agent experience. [Project to be chosen]"), // TODO(aswin)
    evidence: [todo("[evidence]")], // TODO(aswin)
    label: "Case study · Platform & API work",
    href: "/work/platform-api-work",
  },

  // Resume-backed entries (from the master resume and the public CV, Nov 2026). They give the fit check
  // and Ask my work the detail behind each About role. Only claims the public CV also makes, with the
  // master resume's caveats kept ("prototype, not shipped"). Its internal notes and DO NOT USE items are left out.
  {
    id: "zelthy-core-platform",
    title: "Zelthy core platform: access control, authentication, workflow engine, data models",
    status: "SHIPPED · 2020–2024",
    summary:
      "Owned the product lifecycle, vision and roadmap for the core platform of a multi-tenant B2B low-code SaaS platform (100+ tenants, 25,000 users, 1M API calls/day at peak) with healthcare and pharma clients.",
    evidence: [
      "Designed core capabilities (RBAC, authentication, workflow engine, data models, app lifecycle management, audit trails, messaging) as independent, customizable packages; the workflow engine ran condition-based rules and multi-level approvals routed by role.",
      "Delivered RBAC with attribute-based access control (row and column filters) so tenant admins across 100+ tenants self-manage users, roles and permissions, plus an approval-based user provisioning workflow.",
      "Delivered SAML SSO with Azure AD for 10+ enterprise clients; specified OTP login, MFA, password policies, a 1-hour session timeout and single-session login; audit trails logged every login, action and view.",
      "Resolved a multi-tenant trade-off (data duplication versus per-app field flexibility) by proposing a shared directory app and persuading the CEO and CTO to build it; it powers about 15 apps.",
      "Let tenants and app builders define custom fields, foreign keys and one-to-many child tables; owned app lifecycle management (versioning, promotion from dev to staging to production, rollback).",
    ],
    label: "Role · About",
    href: "/about",
    tags: ["platform", "multi-tenant", "saas", "b2b", "low-code", "iam", "rbac", "abac", "sso", "authentication", "workflow", "data models", "custom objects"],
  },
  {
    id: "zelthy-integrations",
    title: "Zelthy APIs and integrations",
    status: "SHIPPED · 2020–2024",
    summary: "Owned how the platform exposed and consumed APIs, and its third-party and client-system integrations.",
    evidence: [
      "Ran API design reviews with engineers on REST endpoints, webhooks, authentication (API keys, OAuth) and request and response formats; tested APIs hands-on in Postman.",
      "Led integration of 10+ third-party services (Zoom, Twilio, DocuSign, SAP, Power BI, Azure AD) and client EHR systems, including inbound webhooks.",
      "Built a connector framework of reusable connectors enabled and configured from one dashboard, replacing one-off per-app integrations; used across 50+ tenants.",
      "Led a daily two-way batch data sync over client SOAP APIs handling millions of rows, with reconciliation and alerts for failed transfers; caught a missed item-update path in a SKU sync and had it implemented.",
      "Evaluated HL7 and FHIR for interoperability and chose a FHIR converter per package (design stage, not released).",
    ],
    label: "Role · About",
    href: "/about",
    tags: ["api", "rest", "webhooks", "integrations", "connectors", "oauth", "soap", "data sync", "ehr", "fhir", "hl7", "public api", "partner integrations"],
  },
  {
    id: "zelthy-healthcare-compliance",
    title: "Zelthy healthcare and pharma: compliance, privacy and data",
    status: "SHIPPED · 2020–2024",
    summary: "Security, privacy and regulatory requirements for healthcare and pharma clients across Southeast Asia and Australia.",
    evidence: [
      "Specified security, privacy and regulatory requirements to meet GDPR, HIPAA and SOC2 with 100% compliance; wrote IQ, OQ and PQ validation documents for a pharma client; checked vendors against HIPAA.",
      "Met data residency requirements by hosting client data in Singapore and Australia.",
      "Migrated client master data (HCPs, hospitals, clinics) from Excel into apps, de-duplicating and sequencing imports by foreign-key dependencies, with data validation rules.",
      "Advised against sending patient data to LLMs because of security and privacy risks.",
    ],
    label: "Role · About",
    href: "/about",
    tags: ["healthcare", "hospital", "pharma", "hipaa", "gdpr", "soc2", "compliance", "security", "privacy", "validated systems", "data residency", "data migration", "regulated"],
  },
  {
    id: "zelthy-delivery",
    title: "Zelthy platform packages, roadmap and releases",
    status: "SHIPPED · 2020–2024",
    summary: "Roadmap, delivery, release and reliability work on the platform and its packages.",
    evidence: [
      "Delivered 17 software packages in 8 months (CRM, Appointment Scheduling, Messaging, CMS for Patient Education Programs); 95% of new apps adopted them and time to deploy fell 80%.",
      "Updated the product vision and new-features roadmap, contributing to 125% growth in B2B product revenue over 3 years.",
      "Prioritized the backlog with RICE, client input and adoption, defect and time-to-deploy metrics across 3 teams with quarterly planning; delivered 80% of roadmap commitments on time; wrote 150+ user stories per quarter.",
      "Defined the path to production: release criteria, release gates and staged releases across dev, staging and production with client UAT sign-off.",
      "Defined support SLAs in contracts with a 99.5% uptime commitment, measured and met; monitored API errors with Sentry and wrote incident post-mortems for clients.",
      "Ran 30+ customer interviews, 5+ competitor analyses and 10+ vendor evaluations; discovery drove the move to code-based development (platform v3).",
      "Largest program: 4 engineers, 2 countries, 2 years, delivered on the committed date; launched a client program in 3 countries and rolled out a template in 5 countries.",
    ],
    label: "Role · About",
    href: "/about",
    tags: ["roadmap", "prioritization", "delivery", "releases", "release gates", "sla", "reliability", "uptime", "metrics", "adoption", "discovery", "customer research", "launch"],
  },
  {
    id: "zelthy-ai-ml",
    title: "Zelthy ML-based OCR, platform v3 and LLM prototypes",
    status: "OCR SHIPPED · LLM PROTOTYPES NOT SHIPPED",
    summary: "The ML feature he shipped at work, the AI-ready platform rebuild, and LLM prototypes that did not ship.",
    evidence: [
      "Wrote requirements for ML-based OCR of patient prescriptions and bills, shipped to production: evaluated vendors on price and accuracy with about 100 labelled documents; results under 90% confidence go to human review (about 10%); accuracy held at 95%, saving about 5 minutes per document on 20+ documents a day.",
      "Ideated and launched platform v3, moving from UI-based configuration to code-based development built for AI coding, cutting internal development time from 2 months to as little as 2 weeks (up to 75%). v3's AI features were released after he left.",
      "Prototyped LLM features, none shipped: ChatGPT-generated app configurations as JSON (about 70% worked without fixes after fixing wrong-field-type failures with GPT-4, prompts with good and bad examples, and a JSON schema); a chat-to-app proof of concept with LangChain; a RAG assistant over product documentation.",
      "Built batch pipelines from apps into a data lake and delivered 10+ Power BI dashboards over millions of records.",
    ],
    label: "Role · About",
    href: "/about",
    tags: ["ai", "ml", "ocr", "human", "evals", "prompts", "json schema", "rag", "langchain", "data", "analytics", "dashboards"],
  },
  {
    id: "zelthy-commercial",
    title: "Zelthy pricing, go-to-market and developer adoption",
    status: "SHIPPED · 2020–2024",
    summary: "Pricing, presales, beta programs and developer adoption for the platform.",
    evidence: [
      "Initiated the shift from seat-based to usage-based pricing, designed the meters and tiers, and persuaded sales leadership to adopt it; adopted in 2 key enterprise deals and multiple RFPs.",
      "Supported CEO-led sales with presales, sales decks, pricing and RFP security and compliance sections; contributed to 2 enterprise RFP wins averaging about USD 100K.",
      "Piloted configurable app templates as a beta with about 20 client business users; 6 apps deployed, saving clients USD 150K+ and adding USD 200K+ in revenue.",
      "Managed 20+ enterprise solution projects valued at USD 500K+ across India and Southeast Asia.",
      "Built an open-source developer community on Discord (50+ members) after the platform core was open-sourced as Zango; authored the product documentation every team used, saving 500 hours of developer time.",
    ],
    label: "Role · About",
    href: "/about",
    tags: ["pricing", "usage-based", "go-to-market", "gtm", "sales", "presales", "rfp", "beta", "pilot", "open source", "developer", "documentation", "revenue"],
  },
  {
    id: "zelthy-leadership",
    title: "Zelthy team leadership and client engagement",
    status: "2020–2024",
    summary: "Led the PM team and managed enterprise client engagements across Singapore, Malaysia, Vietnam, Hong Kong and Australia.",
    evidence: [
      "Led and mentored 5 product managers and 2 interns; hired 3 of the PMs; 1:1s and feedback reviews drove 4 promotions.",
      "Ran the PM operating rhythm (weekly product reviews, PRD reviews, quarterly roadmap reviews) and quarterly resource planning, improving utilization by 20%.",
      "Engagement manager for 8+ global enterprise clients, working with executives up to VP level; ran up to 5 client projects in parallel with monthly steering meetings.",
      "Headed project teams of 20+ BAs, PMs, engineers, designers and QAs; 80% of projects completed on time and within budget.",
      "Established Agile Scrum delivery on Jira, reducing scope creep by 80%+ and cutting turnaround time by 30%.",
      "Coached the PMs to use ChatGPT for PRDs and product documentation.",
    ],
    label: "Role · About",
    href: "/about",
    tags: ["leadership", "people management", "hiring", "mentoring", "stakeholder", "cross-functional", "product teams", "engineering", "client", "enterprise", "executive", "distributed teams", "agile", "scrum"],
  },
  {
    id: "dhees-business",
    title: "Dhee's: product, operations and go-to-market",
    status: "FOUNDER · 2024–2026",
    summary: "Founded and ran a made-to-order fresh dog food business; built its product, operating systems and go-to-market from zero.",
    evidence: [
      "Owned 5 SKUs, recipes, marketing and sales for a recurring-revenue business serving about 20 customers and 20 orders per month; iterated pricing twice using margin, competitor pricing and customer input.",
      "Estimated the market size for fresh dog food in Chennai and wrote a market requirements document that set the target segment and positioning.",
      "Implemented ERPNext, extended its data model with custom DocTypes and scripted it in Python and JavaScript to generate production plans automatically from sales orders, removing about 1 hour of manual planning per day.",
      "Integrated a label and barcode printer with ERPNext on Linux with no vendor driver.",
      "Built the company website with Cursor and v0 on Astro and reached the first page of search results for fresh dog food in Chennai.",
    ],
    label: "Role · About",
    href: "/about",
    tags: ["founder", "0-to-1", "d2c", "direct to consumer", "pricing", "erp", "operations", "marketing", "seo", "market sizing"],
  },
  {
    id: "solar-labs",
    title: "The Solar Labs: B2B SaaS solar design software",
    status: "CO-FOUNDER · 2017–2020",
    summary: "Co-founded and led product and technical development of solar design software for solar installers and EPC firms.",
    evidence: [
      "Generated INR 50L+ in revenue.",
      "Built 3D modelling software that used satellite imagery to model roofs, place and optimize solar panels and estimate generation; wrote production frontend and Python backend code for about 3 years; integrated the Google Maps Geocoding API.",
      "Built 50+ ease-of-use features, reducing proposal creation time by 90%.",
      "Ran user research, demos, onboarding and support for 400+ customers; created personas and journey maps.",
      "Recruited, mentored and led a team of 8 developers.",
    ],
    label: "Resume (PDF)",
    href: "/resume.pdf",
    tags: ["founder", "co-founder", "0-to-1", "startup", "saas", "b2b", "developer", "engineering", "user research", "onboarding"],
  },
];
