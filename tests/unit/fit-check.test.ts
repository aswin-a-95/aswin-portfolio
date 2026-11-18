import { afterEach, describe, expect, it, vi } from "vitest";
import { breakVerdict, HERO_SAMPLES, heroSummary, isLink, isStrongFit } from "@/lib/fit-check/copy";
import { rolePrefill } from "@/lib/fit-check/role-prefill";
import { FitEventSchema } from "@/lib/fit-check/types";

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

describe("heroSummary (Hero.dc.html, update 2)", () => {
  it("a link: first token, no scheme or www., cut to 64 with …", () => {
    expect(heroSummary("https://www.example.com/jobs/123 apply now")).toBe("example.com/jobs/123");
    expect(heroSummary(" http://jobs.example.com/x")).toBe("jobs.example.com/x");
    const long = heroSummary(`https://example.com/${"a".repeat(100)}`);
    expect(long).toHaveLength(64);
    expect(long.endsWith("…")).toBe(true);
  });

  it("text: first line or first sentence, trimmed, cut to 72 with …", () => {
    expect(heroSummary("  Senior PM, Payments\nWe are hiring.")).toBe("Senior PM, Payments");
    expect(heroSummary("Lead platform PM. You will own APIs.")).toBe("Lead platform PM");
    const long = heroSummary("x".repeat(100));
    expect(long).toHaveLength(72);
    expect(long.endsWith("…")).toBe(true);
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
    vi.unstubAllGlobals();
  });

  function streamOf(chunks: string[]): Response {
    const enc = new TextEncoder();
    return new Response(new ReadableStream({ start(c) { chunks.forEach((x) => c.enqueue(enc.encode(x))); c.close(); } }), { status: 200 });
  }

  it("reads NDJSON events split across chunks and posts mode fit", async () => {
    const fetchMock = vi.fn(async () =>
      streamOf(['{"type":"start","runId":"run_1"}\n{"type":"st', 'ep","tool":"jd.parse","status":"running"}\n', '{"type":"fallback","reason":"limited"}']),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { runFitCheck } = await import("@/lib/fit-check/client");
    const evs = [];
    for await (const e of runFitCheck({ jd: HERO_SAMPLES[0].jd })) evs.push(FitEventSchema.parse(e));
    expect(evs.map((e) => e.type)).toEqual(["start", "step", "fallback"]);
    const body = JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body).toMatchObject({ mode: "fit", jd: HERO_SAMPLES[0].jd, turnstileToken: "" });
  });

  it("a failed request ends in the error fallback; Break my AI reports error, limited and budget", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 403 })));
    const { runFitCheck, breakAttempt } = await import("@/lib/fit-check/client");
    const evs = [];
    for await (const e of runFitCheck({ jd: "x" })) evs.push(e);
    expect(evs).toEqual([{ type: "fallback", reason: "error" }]);
    expect(await breakAttempt("Is he any good?")).toEqual({ status: "error" });
    vi.stubGlobal("fetch", vi.fn(async () => streamOf(['{"type":"result","status":"budget"}\n'])));
    expect(await breakAttempt("Is he any good?")).toEqual({ status: "budget" });
  });

  it("Ask reads its NDJSON stream: each step goes to onStep, then the result returns", async () => {
    const answer = { kind: "fit", text: "Yes.", sources: [{ label: "About", href: "/about" }], guard: "none · answered from the knowledge base" };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        streamOf([
          '{"type":"step","tool":"kb.search","status":"running"}\n{"type":"step","tool":"kb.search","status":"done","ms":1}\n',
          '{"type":"step","tool":"compose","status":"running"}\n',
          `{"type":"result","status":"ok","answer":${JSON.stringify(answer)}}\n`,
        ]),
      ),
    );
    const { ask } = await import("@/lib/ask/client");
    const steps: string[] = [];
    const r = await ask({ question: "Has he worked on APIs?", memory: null }, (ev) => steps.push(`${ev.tool}:${ev.status}`));
    expect(steps).toEqual(["kb.search:running", "kb.search:done", "compose:running"]);
    expect(r).toEqual({ status: "ok", answer });
    // A malformed event or a stream without a result is an error.
    vi.stubGlobal("fetch", vi.fn(async () => streamOf(['{"type":"step","tool":"nope","status":"running"}\n'])));
    expect(await ask({ question: "x", memory: null })).toEqual({ status: "error" });
    vi.stubGlobal("fetch", vi.fn(async () => streamOf(['{"type":"step","tool":"compose","status":"running"}\n'])));
    expect(await ask({ question: "x", memory: null })).toEqual({ status: "error" });
  });
});
