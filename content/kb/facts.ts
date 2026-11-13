import { siteMeta } from "@/content/site-meta";

/** Canonical bio facts used in answers. Statements below are taken from the design copy. */
export const facts = {
  title: "Senior Product Manager",
  focus: "platforms, APIs and integrations, including in healthcare",
  yearsOfExperience: siteMeta.yearsOfExperience,
  aiWork: "Builds AI agents: a job-search agent, an Instagram competitor agent for Dhee's, and this site's fit check.",
  llmExperience: "No professional LLM role yet. AI work is agents built and shipped on his own projects.",
  // TODO(aswin): add facts as the knowledge base grows (biggest measured platform win, healthcare systems and outcome).
} as const;
