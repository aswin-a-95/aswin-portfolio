import { siteMeta } from "@/content/site-meta";

/** "Under the hood" cards from Main.dc.html. `live` cards turn X-ray on and jump to the hero. */
export type HoodCard = { name: string; status: string; proof: string; cta: string; live?: boolean; href?: string };

export const hood: HoodCard[] = [
  { name: "agents", status: "case study", proof: "Job-search agent: a multi-step agent that waits for approval before it applies.", cta: "Job-search agent", href: "/work/job-search-agent" },
  { name: "tools", status: "live here", proof: "The fit check calls fetch_url, jd.parse and kb.search. Watch each call as it runs.", cta: "See it in X-ray", live: true },
  { name: "orchestration", status: "live here", proof: "A fixed pipeline with one branch and one retry. Model-chosen tools live in the job-search agent.", cta: "See it in X-ray", live: true },
  { name: "memory", status: "live here", proof: "Your fit result carries into Ask my work for this session. Nothing is stored after it.", cta: "See it in X-ray", live: true },
  { name: "evals", status: "GitHub", proof: `${siteMeta.evalCaseCount} test JDs and red-team cases, run before every change goes live.`, cta: "Eval set", href: siteMeta.evalSetLink },
  { name: "guardrails", status: "live here", proof: "Cited claims, stated gaps, injections refused. Try Break my AI.", cta: "See it in X-ray", live: true },
  { name: "integrations", status: "case study", proof: "An AI integration builder concept with safeguards as the centrepiece.", cta: "CloudEagle concept", href: "/work/cloudeagle" },
  { name: "production", status: "live here", proof: "Rate limit, budget cap and a precomputed fallback. Run a failure drill.", cta: "See it in X-ray", live: true },
];
