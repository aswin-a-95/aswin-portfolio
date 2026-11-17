export type Role = {
  id: string;
  title: string;
  company: string;
  years: string;
  summary: string;
  label: string;
  href: string;
  /** Search tags for kb.search (SPEC §6), not claims. Taken from how the design maps requirements to this entry. */
  tags?: string[];
};

/**
 * Roles the fit check and Ask my work may cite. The shape and the Dhee's summary come from the design;
 * titles, companies, years and the other summaries come from Aswin's master resume (Nov 2026).
 */
export const roles: Role[] = [
  {
    id: "platform-api",
    title: "Senior Product Manager",
    company: "Zelthy",
    years: "2020 – 2024",
    summary: "Owned the core platform, APIs and 10+ third-party integrations of a multi-tenant SaaS platform (100+ tenants, 1M API calls/day at peak)",
    label: "Role · About",
    href: "/about",
    // Hero.dc.html cites this role for public APIs, partner integrations and leading cross-functional teams.
    tags: ["platform", "public api", "partner integrations", "cross-functional", "product teams", "engineering"],
  },
  {
    id: "healthcare-integrations",
    title: "Senior Product Manager",
    company: "Zelthy",
    years: "2020 – 2024",
    summary: "Client EHR integrations and daily two-way SOAP syncs of millions of rows for healthcare and pharma clients, meeting GDPR, HIPAA and SOC2",
    label: "Role · About",
    href: "/about",
    tags: ["healthcare", "hospital", "integrations", "platform reliability"],
  },
  {
    id: "dhees",
    title: "Founder and Product Lead",
    company: "Dhee's",
    years: "2024 – 2026",
    summary: "Runs a fresh dog-food brand, direct to consumer",
    label: "Role · About",
    href: "/about",
  },
];
