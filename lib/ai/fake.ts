import { MockLanguageModelV4 } from "ai/test";
import { WORK_ATTACKS, WORK_SAFE } from "@/content/case-studies/cloudeagle-attacks";
import { ASK_QUESTIONS } from "@/lib/ask/copy";
import { ASK_ANSWERS } from "@/lib/ask/fixtures";
import { HERO_SAMPLES, PASTED_ROLE } from "@/lib/fit-check/copy";
import { BREAK_REPLIES, HERO_BAD, HERO_FIT } from "@/lib/fit-check/fixtures";
import type { AskOutput, EvidenceCard, JdParse, SandboxOutput } from "./schemas";
import { ASK_SYSTEM, EVIDENCE_MAP_SYSTEM, JD_PARSE_SYSTEM, SANDBOX_SYSTEM } from "./prompts";

/**
 * AI_FAKE=1 only (tests and e2e; refused in production): a deterministic stand-in for Claude that
 * replays the design's sample outputs (HERO_FIT / HERO_BAD, ASK_ANSWERS, the Break my AI replies,
 * WORK_ATTACKS) through the real pipeline, guards and route. It bills nothing, so its runs show
 * a real, measured cost of $0 and the model "Fake · test model (AI_FAKE)".
 *
 * Test markers anywhere in the visitor's text:
 *   [[fake:error]]     every model call fails (the retry fails too → error fallback)
 *   [[fake:fail-once]] the first call with this prompt fails, the retry succeeds (retries = 1)
 * Route-level hooks ([[fake:limited]], [[fake:budget]], [[fake:hold]]) live in lib/run/hooks.ts.
 */

export class FakeModelError extends Error {}

const failedOnce = new Set<string>();

type Prompt = Parameters<MockLanguageModelV4["doGenerate"]>[0]["prompt"];

function textOf(prompt: Prompt): { system: string; user: string } {
  let system = "";
  let user = "";
  for (const m of prompt) {
    if (m.role === "system") system += m.content + "\n";
    else if (m.role === "user") for (const p of m.content) if (p.type === "text") user += p.text + "\n";
  }
  return { system, user };
}

function between(s: string, tag: string): string {
  const m = s.match(new RegExp(`<${tag}>\\n([\\s\\S]*?)\\n</${tag}>`));
  return m ? m[1] : "";
}

function sampleFor(jd: string) {
  return HERO_SAMPLES.find((s) => jd.includes(s.jd));
}

function jdParse(user: string): JdParse {
  const jd = between(user, "job_description");
  const sample = sampleFor(jd);
  const body = sample?.bad ? HERO_BAD : HERO_FIT;
  return {
    role: sample?.role ?? PASTED_ROLE,
    requirements: [...body.matches.map((m) => m.req), ...body.gaps.map((g) => g.req)],
  };
}

/** Fixture hrefs → KB ids (content/kb). */
const SOURCE_IDS: Record<string, string> = {
  "/about": "platform-api",
  "/work/cloudeagle": "cloudeagle",
  "/work/job-search-agent": "job-search-agent",
  "/work/dhees-instagram-agent": "dhees-instagram-agent",
};
const NOT_DONE_IDS: Record<string, string> = {
  "Hardware roadmaps from prototype to mass production": "hardware-roadmaps",
  "Contract manufacturers and supply chain": "contract-manufacturing",
  "Retail channel P&L": "retail-channel-pl",
  "10+ years of consumer hardware launches": "consumer-hardware-launches",
};

function evidenceMap(user: string): { cards: EvidenceCard[] } {
  const reqs = between(user, "requirements")
    .split("\n")
    .map((l) => l.replace(/^\d+\.\s*/, ""));
  const all = [...HERO_FIT.matches, ...HERO_BAD.matches];
  const gaps = [...HERO_FIT.gaps, ...HERO_BAD.gaps];
  return {
    cards: reqs.map((req): EvidenceCard => {
      const m = all.find((x) => x.req === req);
      if (m) return { type: "match", req, evidence: m.evidence, sourceId: SOURCE_IDS[m.href] ?? "unknown-source" };
      const g = gaps.find((x) => x.req === req);
      return {
        type: "gap",
        req,
        closest: g?.closest ?? "Not something Aswin has done.",
        close: g?.close ?? "",
        notDoneId: NOT_DONE_IDS[req] ?? null,
      };
    }),
  };
}

/** KB ids for the design's Ask source chips, by label then href (see content/kb/facts.ts). */
const ASK_SOURCE_IDS: Record<string, string> = {
  "About · career": "fact-focus",
  "Case studies": "fact-ai-work",
  "Case study · CloudEagle concept": "cloudeagle",
  "Case study · Safeguards": "cloudeagle",
  "Case study · v2 & lessons": "cloudeagle",
  "Case study · Platform & API work": "platform-api-work",
  "Your fit check": "memory",
};

function ask(user: string): AskOutput {
  const q = between(user, "question").trim();
  const attack = BREAK_REPLIES[q];
  if (attack) return { kind: attack.kind, text: attack.text, sourceIds: attack.kind === "none" ? ["fact-focus"] : attack.kind === "conflict" ? ["fact-llm-experience"] : [], guard: attack.guard as AskOutput["guard"] };
  const id = (Object.keys(ASK_QUESTIONS) as (keyof typeof ASK_QUESTIONS)[]).find((k) => ASK_QUESTIONS[k] === q);
  if (!id) {
    if (/<session_memory>/.test(user)) {
      return { kind: "fit", text: "Ask how he would ramp up on the gaps from your fit check.", sourceIds: ["memory"], guard: "none" };
    }
    return { kind: "unknown", text: ASK_ANSWERS.unknown.text, sourceIds: [], guard: "none" };
  }
  const f = ASK_ANSWERS[id];
  const guard = (f.guard ?? (f.kind === "gap" ? "guard.gap_stated" : "none")) as AskOutput["guard"];
  const sourceIds = [...new Set(f.sources.map((s) => ASK_SOURCE_IDS[s.label]).filter((x): x is string => !!x))];
  return { kind: f.kind, text: f.text, sourceIds, guard };
}

function sandbox(user: string): SandboxOutput {
  const a = between(user, "attempt").trim();
  const hit = WORK_ATTACKS.find((w) => w.text === a);
  return hit ? { verdict: hit.verdict, reason: hit.reason, guard: hit.guard } : { ...WORK_SAFE };
}

export function fakeModel(): MockLanguageModelV4 {
  return new MockLanguageModelV4({
    provider: "fake",
    modelId: "fake",
    doGenerate: async (options) => {
      const { system, user } = textOf(options.prompt);
      if (user.includes("[[fake:error]]")) throw new FakeModelError("fake: forced error");
      const key = system.slice(0, 40) + user;
      if (user.includes("[[fake:fail-once]]") && !failedOnce.has(key)) {
        failedOnce.add(key);
        throw new FakeModelError("fake: forced first failure");
      }
      let out: unknown;
      if (system.startsWith(JD_PARSE_SYSTEM.slice(0, 40))) out = jdParse(user);
      else if (system.startsWith(EVIDENCE_MAP_SYSTEM.slice(0, 40))) out = evidenceMap(user);
      else if (system.startsWith(ASK_SYSTEM.slice(0, 40))) out = ask(user);
      else if (system.startsWith(SANDBOX_SYSTEM.slice(0, 40))) out = sandbox(user);
      else throw new FakeModelError("fake: unknown prompt");
      const text = JSON.stringify(out);
      return {
        content: [{ type: "text", text }],
        finishReason: { unified: "stop", raw: "end_turn" },
        usage: {
          inputTokens: { total: 0, noCache: 0, cacheRead: 0, cacheWrite: 0 },
          outputTokens: { total: 0, text: 0, reasoning: 0 },
        },
        warnings: [],
      };
    },
  });
}

