import { afterEach, describe, expect, it, vi } from "vitest";
import { breakVerdict, HERO_ATTACKS, HERO_SAMPLES, isLink, isStrongFit, PASTED_ROLE } from "@/lib/fit-check/copy";
import { HERO_BAD, HERO_FIT } from "@/lib/fit-check/fixtures";
import { rolePrefill } from "@/lib/fit-check/role-prefill";
import { stubBreak, stubFitCheck, type StubMode } from "@/lib/fit-check/stub";
import { FIT_TOOLS, FitEventSchema, type FitEvent, type FitRequest } from "@/lib/fit-check/types";

async function collect(req: FitRequest, mode: StubMode = null): Promise<FitEvent[]> {
  const out: FitEvent[] = [];
  for await (const ev of stubFitCheck(req, { mode, stepMs: 0 })) out.push(FitEventSchema.parse(ev));
  return out;
}
const finalSteps = (evs: FitEvent[]) =>
  evs.flatMap((e) => (e.type === "step" && e.status !== "running" ? [[e.tool, e.status, e.detail] as const] : []));

describe("stubFitCheck", () => {
  it("pasted text: all 7 steps in order, fetch_url skipped, HERO_FIT as the pasted role", async () => {
    const evs = await collect({ jd: "Some role we have never seen." });
    expect(finalSteps(evs).map(([t]) => t)).toEqual([...FIT_TOOLS]);
    expect(finalSteps(evs)[0]).toEqual(["fetch_url", "skipped", "skipped"]);
    expect(finalSteps(evs)[1]).toEqual(["jd.parse", "done", "6 requirements"]);
    expect(finalSteps(evs)[3]).toEqual(["evidence.map", "done", "4 matches · 2 gaps"]);
    const last = evs.at(-1);
    expect(last).toMatchObject({ type: "result", role: PASTED_ROLE, retries: 0, verdict: HERO_FIT.verdict });
  });

  it("each step starts as running before it ends", async () => {
    const evs = await collect({ jd: "x" });
    const steps = evs.filter((e) => e.type === "step");
    for (let i = 0; i < steps.length; i += 2) {
      expect(steps[i]).toMatchObject({ tool: FIT_TOOLS[i / 2], status: "running" });
      expect(steps[i + 1]).toMatchObject({ tool: FIT_TOOLS[i / 2] });
    }
  });

  it("a link takes the fetch_url branch", async () => {
    const evs = await collect({ jd: "  https://example.com/jobs/1" });
    expect(finalSteps(evs)[0]).toEqual(["fetch_url", "done", "fetched"]);
  });

  it("the bad-fit sample returns HERO_BAD with its role", async () => {
    const bad = HERO_SAMPLES.find((s) => s.bad)!;
    const evs = await collect({ jd: bad.jd });
    expect(finalSteps(evs)[3]).toEqual(["evidence.map", "done", "1 match · 4 gaps"]);
    expect(evs.at(-1)).toMatchObject({ type: "result", role: bad.role, verdict: HERO_BAD.verdict });
  });

  it("never fakes live numbers: no ms, run id, cost or model", async () => {
    const evs = await collect({ jd: HERO_SAMPLES[0].jd });
    for (const e of evs) {
      expect(e.type).not.toBe("start");
      if (e.type === "step") expect(e.ms).toBeUndefined();
      if (e.type === "result") expect(e.trace).toBeUndefined();
    }
  });

  it("error and limited modes end in a fallback", async () => {
    expect((await collect({ jd: "x" }, "error")).at(-1)).toEqual({ type: "fallback", reason: "error" });
    const limited = await collect({ jd: "x" }, "limited");
    expect(limited).toEqual([{ type: "fallback", reason: "limited" }]);
  });

  it("drills go straight to the fallback with the design's trace", async () => {
    const kb = await collect({ jd: "x", drill: "kb" });
    expect(kb).toHaveLength(1);
    expect(kb[0]).toMatchObject({ type: "fallback", reason: "error", drill: "kb" });
    const rate = await collect({ jd: "x", drill: "rate" });
    expect(rate[0]).toMatchObject({ type: "fallback", reason: "limited", drill: "rate" });
    if (rate[0].type === "fallback") expect(rate[0].trace?.[1].text).toBe("llm.call skipped · nothing billed");
  });

  it("stops when aborted", async () => {
    const ac = new AbortController();
    const it = stubFitCheck({ jd: "x" }, { signal: ac.signal, stepMs: 1000 });
    await it.next();
    ac.abort();
    await expect(it.next()).rejects.toBeDefined();
  });
});

describe("stubBreak", () => {
  it("answers the 4 design attacks, everything else falls through", async () => {
    const kinds = [];
    for (const a of HERO_ATTACKS) {
      const r = await stubBreak(a.text, null, 0);
      if (r.status === "ok") kinds.push(r.reply.kind);
    }
    expect(kinds).toEqual(["refuse", "none", "conflict", "clarify"]);
    const other = await stubBreak("What's the weather?", null, 0);
    expect(other).toMatchObject({ status: "ok", reply: { kind: "unknown" } });
  });
});

describe("copy rules", () => {
  it("maps Ask kinds to the hero's verdicts (SPEC §8)", () => {
    expect(breakVerdict("refuse")).toEqual(["REFUSED", "held"]);
    expect(breakVerdict("none")).toEqual(["STATED", "gap"]);
    expect(breakVerdict("conflict")).toEqual(["FLAGGED", "gap"]);
    expect(breakVerdict("clarify")).toEqual(["CLARIFIED", "neutral"]);
    for (const k of ["fit", "gap", "unknown"] as const) expect(breakVerdict(k)[0]).toBe("ANSWERED");
  });

  it("strong fit at m/n ≥ 0.5, as verdict.compose", () => {
    expect(isStrongFit(4, 2)).toBe(true);
    expect(isStrongFit(3, 3)).toBe(true);
    expect(isStrongFit(1, 4)).toBe(false);
    expect(isStrongFit(0, 0)).toBe(false);
  });

  it("only http(s) links are links", () => {
    expect(isLink("https://x.y")).toBe(true);
    expect(isLink(" HTTP://x.y")).toBe(true);
    expect(isLink("see https://x.y")).toBe(false);
  });
});

describe("rolePrefill", () => {
  it("delivers the role to subscribers until they unsubscribe", () => {
    const cb = vi.fn();
    const off = rolePrefill.subscribe(cb);
    rolePrefill.send("Senior PM");
    off();
    rolePrefill.send("Other");
    expect(cb).toHaveBeenCalledExactlyOnceWith("Senior PM");
  });
});

describe("client", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("without the stub (production) ends in the error fallback and no result", async () => {
    vi.stubEnv("NEXT_PUBLIC_FIT_STUB", "0");
    const { runFitCheck, breakAttempt } = await import("@/lib/fit-check/client");
    const evs = [];
    for await (const e of runFitCheck({ jd: HERO_SAMPLES[0].jd })) evs.push(e);
    expect(evs).toEqual([{ type: "fallback", reason: "error" }]);
    expect(await breakAttempt("Is he any good?")).toEqual({ status: "error" });
  });
});
