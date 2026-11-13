import type { ComponentType } from "react";
import { published } from "@/lib/content";
import { CaseStudySchema, type CaseStudy } from "@/lib/schemas/content";

export const CASE_STUDY_SLUGS = ["cloudeagle", "job-search-agent", "dhees-instagram-agent", "platform-api-work"] as const;

type MdxModule = { default: ComponentType; meta: unknown };

export async function loadCaseStudy(slug: string): Promise<CaseStudy> {
  const mod = (await import(`@/content/case-studies/${slug}.mdx`)) as MdxModule;
  return CaseStudySchema.parse(mod.meta);
}

/** All case studies in order, minus unproven ones in production. */
export async function caseStudies(): Promise<CaseStudy[]> {
  const all = await Promise.all(CASE_STUDY_SLUGS.map(loadCaseStudy));
  return published(all.sort((a, b) => a.num.localeCompare(b.num)));
}
