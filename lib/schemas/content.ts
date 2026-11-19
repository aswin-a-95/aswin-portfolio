import { z } from "zod";

const Labelled = z.object({ label: z.string(), value: z.string() });
const Step = z.object({ text: z.string(), time: z.string() });

/** One case study, PRD template (Work.dc.html). Sections without data are not rendered. */
export const CaseStudySchema = z.object({
  slug: z.string(),
  num: z.string(),
  status: z.string(),
  // Home "Work" card
  cardLabel: z.string(),
  cardTitle: z.string(),
  angle: z.string(),
  built: z.string(),
  tags: z.array(z.string()),
  flow: z.array(z.object({ label: z.string(), approval: z.boolean() })).optional(),
  /** Phone home layout lists the study (Mobile.dc.html leaves Platform & API out). */
  onPhone: z.boolean(),
  // Page
  breadcrumb: z.string(),
  disclaimer: z.string().optional(),
  title: z.string(),
  lede: z.string(),
  facts: z.array(Labelled),
  demo: z.string().optional(),
  problem: z.object({ who: z.string(), problem: z.string(), whyAi: z.string() }).optional(),
  decisions: z.array(z.object({ topic: z.string(), chose: z.string(), over: z.string(), because: z.string() })).optional(),
  arch: z
    .object({
      note: z.string().optional(),
      steps: z.array(z.object({ label: z.string(), fn: z.string(), guard: z.boolean(), ms: z.string() })),
      runId: z.string(),
    })
    .optional(),
  builtMyself: z.string().optional(),
  usedOrReused: z.string().optional(),
  safeguards: z.array(z.object({ title: z.string(), stops: z.string(), userSees: z.string() })).optional(),
  sandbox: z
    .object({
      attacks: z.array(
        z.object({ type: z.string(), text: z.string(), verdict: z.string(), reason: z.string(), guard: z.string() }),
      ),
    })
    .optional(),
  metrics: z.array(z.object({ kind: z.string(), hint: z.string() })).optional(),
  perf: z
    .object({
      items: z.array(z.object({ source: z.enum(["LIVE USAGE", "OFFLINE EVAL"]), name: z.string(), value: z.string() })),
      evalCount: z.string(),
      evals: z.array(z.object({ case: z.string(), expected: z.string(), result: z.string() })),
      failedFirst: z.string(),
    })
    .optional(),
  beforeAfter: z
    .object({
      agentTitle: z.string(),
      manual: z.array(Step),
      agent: z.array(Step),
      manualTotal: z.string(),
      agentTotal: z.string(),
    })
    .optional(),
  v2: z.string().optional(),
  learned: z.string().optional(),
  questions: z.array(z.string()).optional(),
  repo: z.string(),
  relatedPost: z.string().optional(),
});
export type CaseStudy = z.infer<typeof CaseStudySchema>;

export const PostSchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.enum(["build", "teardown", "essay", "til"]),
  tag: z.string(),
  date: z.string(),
  readTime: z.string(),
  summary: z.string(),
  study: z.object({ label: z.string(), slug: z.string() }),
});
export type Post = z.infer<typeof PostSchema>;
