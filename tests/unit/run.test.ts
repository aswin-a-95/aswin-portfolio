import { beforeEach, describe, expect, it, vi } from "vitest";
import { WORK_ATTACKS } from "@/content/case-studies/cloudeagle-attacks";
import { ASK_QUESTIONS } from "@/lib/ask/copy";
import { HERO_ATTACKS, HERO_SAMPLES } from "@/lib/fit-check/copy";
import { FitEventSchema, FIT_TOOLS, type FitEvent } from "@/lib/fit-check/types";
import { resetMemoryBudget, addSpend } from "@/lib/server/budget";
import type { ServerEnv } from "@/lib/server/env";
import type { RunRow } from "@/lib/server/log-run";
import { resetMemoryLimits } from "@/lib/server/ratelimit";
import { handleRun, type HandleDeps } from "@/lib/run/handle";
import { ASK_UNKNOWN_TEXT } from "@/lib/run/guards";

const ENV: ServerEnv = {
  AI_FAKE: "1",
  FIT_CHECK_MODEL: "claude-sonnet-5-5",
  CHAT_MODEL: "claude-haiku-5-5",
  FIT_DAILY_LIMIT: 3,
  MONTHLY_BUDGET_USD: 20,
};

let rows: RunRow[];
let deps: HandleDeps;

beforeEach(() => {
  resetMemoryLimits();
  resetMemoryBudget();
  rows = [];
  deps = { env: ENV, logger: async (row) => void rows.push(row) };
});

function post(body: unknown, ip = "203.0.113.7") {
  return new Request("http://localhost/api/run", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify({ turnstileToken: "", ...(body as object) }),
  });
}

async function fit(body: object, d: HandleDeps = deps): Promise<FitEvent[]> {
  const res = await handleRun(post({ mode: "fit", ...body }), d);
  expect(res.headers.get("content-type")).toContain("application/x-ndjson");
  const text = await res.text();
  return text
    .trim()
    .split("\n")
    .map((l) => FitEventSchema.parse(JSON.parse(l)));
}

const terminal = (evs: FitEvent[]) => evs[evs.length - 1];

describe("/api/run · fit", () => {
  it("streams start, each tool running then done in order, then exactly one result", async () => {
    const evs = await fit({ jd: HERO_SAMPLES[0].jd });
    expect(evs[0]).toMatchObject({ type: "start", runId: expect.stringMatching(/^run_[0-9a-f]{12}$/) });
    const ended = evs.filter((e) => e.type === "step" && e.status !== "running").map((e) => (e.type === "step" ? e.tool : ""));
    expect(ended).toEqual([...FIT_TOOLS]);
    // Every step that ran carries its measured duration; the skipped fetch has none.
    for (const e of evs) if (e.type === "step" && e.status === "done") expect(typeof e.ms).toBe("number");
    expect(evs.filter((e) => e.type === "result" || e.type === "fallback")).toHaveLength(1);
    const r = terminal(evs);
    expect(r.type).toBe("result");
    if (r.type !== "result") return;
    expect(r.role).toBe(HERO_SAMPLES[0].role);
    // Matches stand only where kb.search found the cited source, so the count follows the KB.
    expect(r.verdict).toBe(`Strong on ${r.matches.length} of 6 requirements.`);
    expect(r.matches.length).toBeGreaterThanOrEqual(3);
    expect(r.retries).toBe(0);
    expect(r.trace).toMatchObject({ runId: (evs[0] as { runId: string }).runId, costUsd: 0, model: "Fake · test model (AI_FAKE)" });
    expect(r.matches.map((m) => m.source)).toContain("Case study · CloudEagle concept");
  });

  it("skips fetch_url for pasted text", async () => {
    const evs = await fit({ jd: HERO_SAMPLES[1].jd });
    expect(evs.find((e) => e.type === "step" && e.tool === "fetch_url" && e.status !== "running")).toMatchObject({ status: "skipped", detail: "skipped" });
  });

  it("the bad-fit sample: not-done topics are gaps, never matches, and the verdict is not strong", async () => {
    const r = terminal(await fit({ jd: HERO_SAMPLES[3].jd }));
    expect(r.type).toBe("result");
    if (r.type !== "result") return;
    // The match count depends on what proof the KB holds; the verdict is never "Strong".
    expect(r.verdict).toMatch(/^Not a strong fit: [01] of 5 requirements\.$/);
    expect(r.matches.some((m) => /hardware|manufactur|retail/i.test(m.req))).toBe(false);
    expect(r.note).toBe("Better you hear it from this site than in round two.");
    const hw = r.gaps.find((g) => g.req.startsWith("Hardware roadmaps"));
    expect(hw).toEqual({ req: "Hardware roadmaps from prototype to mass production", closest: "Not something Aswin has done.", close: "" });
  });

  it("uses its one retry and reports it", async () => {
    const r = terminal(await fit({ jd: `${HERO_SAMPLES[0].jd} [[fake:fail-once]]` }));
    expect(r).toMatchObject({ type: "result", retries: 1 });
  });

  it("ends in the error fallback when the retry fails too", async () => {
    const evs = await fit({ jd: "Some role [[fake:error]]" });
    expect(terminal(evs)).toMatchObject({ type: "fallback", reason: "error" });
    expect(rows).toHaveLength(1);
    expect(rows[0].retries).toBe(1);
  });

  it("kb drill: real jd.parse, kb.search times out twice, guard.no_sources, error fallback with a measured trace", async () => {
    const evs = await fit({ jd: HERO_SAMPLES[0].jd, drill: "kb" });
    const f = terminal(evs);
    expect(f).toMatchObject({ type: "fallback", reason: "error", drill: "kb" });
    if (f.type !== "fallback") return;
    expect(f.trace?.map((l) => l.text)).toEqual([
      "jd.parse(text) → 6 requirements",
      "kb.search(...) → timeout",
      "retry 1 of 1: kb.search(...) → timeout",
      "guard.no_sources → stop instead of answering",
      "fallback.precomputed(role_types=3)",
    ]);
    expect(f.trace?.[1].ms).toBeGreaterThanOrEqual(1400);
    expect(rows[0]).toMatchObject({ drill: "kb", retries: 1 });
    expect(rows[0].guard_fired).toContain("guard.no_sources");
  }, 10_000);

  it("rate drill: no model call, limited fallback with the trace, and the visitor's limit is untouched", async () => {
    for (let i = 0; i < 5; i++) {
      const f = terminal(await fit({ jd: HERO_SAMPLES[0].jd, drill: "rate" }));
      expect(f).toMatchObject({ type: "fallback", reason: "limited", drill: "rate" });
      if (f.type === "fallback") expect(f.trace?.[1].text).toBe("llm.call skipped · nothing billed");
    }
    expect(rows.every((r) => r.model === "none" && r.cost_usd === 0)).toBe(true);
    expect(terminal(await fit({ jd: HERO_SAMPLES[0].jd }))).toMatchObject({ type: "result" });
  });

  it("over FIT_DAILY_LIMIT → limited, no model call, not logged", async () => {
    for (let i = 0; i < 3; i++) expect(terminal(await fit({ jd: HERO_SAMPLES[0].jd }))).toMatchObject({ type: "result" });
    const evs = await fit({ jd: HERO_SAMPLES[0].jd });
    expect(evs).toEqual([{ type: "fallback", reason: "limited" }]);
    expect(rows).toHaveLength(3);
    // Another visitor is unaffected.
    const other = await handleRun(post({ mode: "fit", jd: HERO_SAMPLES[0].jd }, "198.51.100.9"), deps);
    expect(await other.text()).toContain('"type":"result"');
  });

  it("drills have their own bucket", async () => {
    for (let i = 0; i < 3; i++) await fit({ jd: HERO_SAMPLES[0].jd, drill: "kb" });
    expect(terminal(await fit({ jd: HERO_SAMPLES[0].jd, drill: "kb" }))).toEqual({ type: "fallback", reason: "limited" });
    expect(terminal(await fit({ jd: HERO_SAMPLES[0].jd }))).toMatchObject({ type: "result" });
  }, 20_000);

  it("monthly budget spent → budget fallback for every mode", async () => {
    await addSpend(25, ENV);
    expect(await fit({ jd: HERO_SAMPLES[0].jd })).toEqual([{ type: "fallback", reason: "budget" }]);
    const ask = await handleRun(post({ mode: "ask", question: ASK_QUESTIONS.apis }), deps);
    expect(await ask.json()).toEqual({ status: "budget" });
    const sb = await handleRun(post({ mode: "sandbox", attempt: WORK_ATTACKS[0].text }), deps);
    expect(await sb.json()).toEqual({ status: "budget" });
  });

  it("never logs the visitor's text", async () => {
    const secret = "Unique-JD-marker-7f3a requirements for a role";
    await fit({ jd: secret });
    await handleRun(post({ mode: "ask", question: "secret-question-9c1d?" }), deps);
    const logged = JSON.stringify(rows);
    expect(logged).not.toContain("7f3a");
    expect(logged).not.toContain("9c1d");
  });
});

describe("/api/run · validation and Turnstile", () => {
  it("rejects a JD over 12,000 characters", async () => {
    const res = await handleRun(post({ mode: "fit", jd: "x".repeat(12_001) }), deps);
    expect(res.status).toBe(400);
  });

  it("rejects a question over 1,000 characters", async () => {
    const res = await handleRun(post({ mode: "ask", question: "x".repeat(1001) }), deps);
    expect(res.status).toBe(400);
  });

  it("refuses a failed Turnstile check before any model call", async () => {
    const verify = vi.fn(async () => ({ ok: false as const, reason: "invalid" as const }));
    const res = await handleRun(post({ mode: "fit", jd: HERO_SAMPLES[0].jd }), { ...deps, verify });
    expect(res.status).toBe(403);
    expect(rows).toHaveLength(0);
  });

  it("requires a Turnstile secret outside AI_FAKE", async () => {
    const env = { ...ENV, AI_FAKE: undefined, ANTHROPIC_API_KEY: "sk-test" };
    const res = await handleRun(post({ mode: "ask", question: "Has he worked on APIs?" }), { ...deps, env });
    expect(res.status).toBe(403);
  });

  it("AI_FAKE is refused in production", async () => {
    const env = { ...ENV, VERCEL_ENV: "production", TURNSTILE_SECRET_KEY: undefined };
    const res = await handleRun(post({ mode: "ask", question: "Has he worked on APIs?" }), { ...deps, env });
    expect(res.status).toBe(403);
  });
});

describe("/api/run · ask", () => {
  async function ask(question: string, memory: unknown = null) {
    const res = await handleRun(post({ mode: "ask", question, memory }), deps);
    return res.json();
  }

  it("answers from the KB with cited sources, the guard line and a live trace", async () => {
    const r = await ask(ASK_QUESTIONS.apis);
    expect(r.status).toBe("ok");
    expect(r.answer.kind).toBe("fit");
    expect(r.answer.sources.length).toBeGreaterThan(0);
    expect(r.answer.guard).toBe("none · answered from the knowledge base");
    expect(r.answer.trace.runId).toMatch(/^run_/);
    expect(rows).toHaveLength(1);
  });

  it("the Break my AI attacks get the design's kinds and guards", async () => {
    const expected = ["guard.prompt_injection", "guard.not_done", "guard.conflicting_info", "guard.ambiguous_ask"];
    for (const [i, a] of HERO_ATTACKS.entries()) expect((await ask(a.text)).answer.guard).toBe(expected[i]);
  });

  it("anything the KB doesn't cover is unknown, with the SPEC copy and the Contact chip", async () => {
    const r = await ask("What's the weather?");
    expect(r.answer).toMatchObject({ kind: "unknown", text: ASK_UNKNOWN_TEXT, sources: [{ label: "Contact", href: "/#contact" }] });
  });

  it("a failed attempt is an error and isn't logged", async () => {
    const r = await ask("Has he worked on APIs? [[fake:error]]");
    expect(r).toEqual({ status: "error" });
    expect(rows).toHaveLength(0);
  });

  it("is limited at 30 an hour, shared with the sandbox", async () => {
    for (let i = 0; i < 15; i++) await ask(ASK_QUESTIONS.apis);
    for (let i = 0; i < 15; i++) await handleRun(post({ mode: "sandbox", attempt: WORK_ATTACKS[0].text }), deps);
    expect(await ask(ASK_QUESTIONS.apis)).toEqual({ status: "limited" });
  });
});

describe("/api/run · sandbox", () => {
  it("returns the WORK_ATTACKS verdicts", async () => {
    for (const a of WORK_ATTACKS) {
      const r = await (await handleRun(post({ mode: "sandbox", attempt: a.text }), deps)).json();
      expect(r.reply).toMatchObject({ verdict: a.verdict, reason: a.reason, guard: a.guard });
    }
  });

  it("drafts a safe request for review", async () => {
    const r = await (await handleRun(post({ mode: "sandbox", attempt: "Connect Slack read-only for the #ops channel" }), deps)).json();
    expect(r.reply).toMatchObject({ verdict: "DRAFTED", guard: "none · review_required=true" });
  });
});
