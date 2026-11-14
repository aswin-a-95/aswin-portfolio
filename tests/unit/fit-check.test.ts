import { afterEach, describe, expect, it, vi } from "vitest";
import { breakVerdict, HERO_SAMPLES, isLink, isStrongFit } from "@/lib/fit-check/copy";
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
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ status: "budget" })));
    expect(await breakAttempt("Is he any good?")).toEqual({ status: "budget" });
  });
});
