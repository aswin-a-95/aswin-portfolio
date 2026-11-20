import type { ComponentType } from "react";
import { published } from "@/lib/content";
import { CaseStudySchema, type CaseStudy } from "@/lib/schemas/content";

// Page order for the "Next" card. `fit-check` is new in design update 4; `platform-api-work` is no
// longer a home product and stays until Aswin decides (SPEC §4).
export const CASE_STUDY_SLUGS = ["cloudeagle", "job-search-agent", "fit-check", "dhees-instagram-agent", "platform-api-work"] as const;

type MdxModule = { default: ComponentType; meta: unknown };

export async function loadCaseStudy(slug: string): Promise<CaseStudy> {
  const mod = (await import(`@/content/case-studies/${slug}.mdx`)) as MdxModule;
  return CaseStudySchema.parse(mod.meta);
}

/** All case studies in order, minus unproven ones in production. */
export async function caseStudies(): Promise<CaseStudy[]> {
  const all = await Promise.all(CASE_STUDY_SLUGS.map(loadCaseStudy));
  return published(all);
}
