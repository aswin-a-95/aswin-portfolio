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
    summary: "Owned the core platform, APIs and integrations, including EHR systems, for healthcare and pharma clients",
    label: "Role · About",
    href: "/about",
    // Hero.dc.html cites this role for public APIs, partner integrations and leading cross-functional teams.
    // One Zelthy row on About (Aswin, Nov 2026); the design's separate healthcare role is the "healthcare-integrations" KB project.
    tags: ["platform", "public api", "partner integrations", "cross-functional", "product teams", "engineering"],
  },
  {
    id: "dhees",
    title: "Founder and Product Lead",
    company: "Dhee's",
    years: "2024 – 2026",
    summary: "Ran a fresh dog-food brand, direct to consumer", // Design copy changed to past tense (Aswin, Nov 2026: Dhee's has ended)
    label: "Role · About",
    href: "/about",
  },
];
