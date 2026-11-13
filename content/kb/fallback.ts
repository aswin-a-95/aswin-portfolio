export type FallbackMatch = { role: string; summary: string; source: string; href: string };

/** The 3 precomputed role-type matches (HERO_FALLBACK in Hero.dc.html), word for word. */
export const fallback: FallbackMatch[] = [
  {
    role: "Platform PM · APIs & integrations",
    summary: "Strongest fit. Platform and integrations roles, plus agent projects built on the same plumbing.",
    source: "Role · About",
    href: "/about",
  },
  {
    role: "AI product PM · agents",
    summary: "Good fit on building agents with guardrails. Gap: no professional LLM role yet.",
    source: "Case studies",
    href: "/work",
  },
  {
    role: "Healthcare integrations PM",
    summary: "Strong on integrations in healthcare and on safety-first design.",
    source: "Role · About",
    href: "/about",
  },
];
