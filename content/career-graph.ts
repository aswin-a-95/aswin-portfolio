import { roles } from "@/content/kb/roles";

/** "Career as a dependency graph" on /about (About.dc.html). */
export type Dep = { id: string; label: string; meta: string };
export type GraphProject = { id: string; label: string; meta: string; edges: [string, string][] };

const roleMeta = (id: string) => {
  const r = roles.find((x) => x.id === id);
  return r ? `${r.title} · ${r.company}` : "";
};

export const deps: Dep[] = [
  { id: "api", label: "APIs & integrations platform", meta: roleMeta("platform-api") },
  { id: "health", label: "Healthcare integrations", meta: roleMeta("platform-api") },
  { id: "stake", label: "Platform stakeholder work", meta: "engineering, partners, business teams" },
  { id: "dhees", label: "Running Dhee's", meta: "fresh dog-food brand, direct to consumer" },
];

export const graphProjects: GraphProject[] = [
  { id: "ce", label: "AI integration builder", meta: "CloudEagle.ai take-home concept", edges: [["api", "connectors, auth and scopes are the whole job"], ["health", "safety-first design where mistakes are costly"]] },
  { id: "js", label: "Job-search agent", meta: "multi-step, approval before applying", edges: [["api", "workflows that span several tools"], ["stake", "an approval gate before anything irreversible"]] },
  { id: "ig", label: "Dhee's Instagram competitor agent", meta: "research agent for a business I ran · in progress", edges: [["dhees", "a real business question to answer"], ["api", "pulling structured data out of a platform"]] },
  { id: "site", label: "This site's fit check", meta: "one endpoint, one knowledge base", edges: [["api", "one shared endpoint behind two features"], ["health", "guardrails for claims that must be true"], ["stake", "stating trade-offs and gaps plainly"]] },
];
