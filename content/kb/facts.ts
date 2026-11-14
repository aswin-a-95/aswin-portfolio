import { siteMeta } from "@/content/site-meta";

export type Fact = { id: string; text: string; label: string; href: string };

/**
 * Canonical bio facts used in answers (SPEC §6). Statements below are taken from the design copy.
 * Labels are the source chips Ask my work shows (Ask.dc.html: "About · career", "Case studies").
 */
export const facts: Fact[] = [
  { id: "fact-title", text: "Senior Product Manager.", label: "About · career", href: "/about" },
  {
    id: "fact-focus",
    text: "Works on platforms, APIs and integrations, including in healthcare.",
    label: "About · career",
    href: "/about",
  },
  {
    id: "fact-years",
    text: `${siteMeta.yearsOfExperience} years as a product manager.`,
    label: "About · career",
    href: "/about",
  },
  {
    id: "fact-ai-work",
    text: "Builds AI agents: a job-search agent, an Instagram competitor agent for Dhee's, and this site's fit check.",
    label: "Case studies",
    href: "/work",
  },
  {
    id: "fact-llm-experience",
    text: "No professional LLM role yet. His AI work is agents he built and shipped on his own projects.",
    label: "About · career",
    href: "/about",
  },
  // TODO(aswin): add facts as the knowledge base grows (biggest measured platform win, healthcare systems and outcome).
];
