import { HERO_SAMPLES, isLink, PASTED_ROLE } from "./copy";
import { BREAK_OTHER, BREAK_REPLIES, DRILL_TRACE, HERO_BAD, HERO_FIT } from "./fixtures";
import type { BreakResult, FitEvent, FitRequest, FitTool } from "./types";

/**
 * Dev mock of `/api/run` with `mode: "fit"`, replaced by the real endpoint in Milestone 5.
 * It emits the same event stream as SPEC §7, one step about every 650 ms (the prototype's
 * pace). It never sets `ms`, cost, model or a run id, so the UI keeps the design's
 * "[ms]" / "[logged]" / "[run id]" placeholders: nothing live is faked.
 *
 * The bad-fit sample returns HERO_BAD; any other text returns HERO_FIT (no keyword router).
 */

/** Test hook: sessionStorage["fit-stub"] = "error" | "limited" | "hold" (pause on step 4). */
export const FIT_STUB_MODE_KEY = "fit-stub";
export type StubMode = "error" | "limited" | "hold" | null;

export const STUB_STEP_MS = 650;

type Options = { signal?: AbortSignal; mode?: StubMode; stepMs?: number };

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const t = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

export async function* stubFitCheck(req: FitRequest, { signal, mode = null, stepMs = STUB_STEP_MS }: Options = {}): AsyncGenerator<FitEvent> {
  if (req.drill) {
    await sleep(stepMs * 2, signal);
    yield { type: "fallback", reason: req.drill === "kb" ? "error" : "limited", drill: req.drill, trace: DRILL_TRACE[req.drill] };
    return;
  }
  // Over the limit: no LLM call, straight to the fallback (SPEC §10).
  if (mode === "limited") {
    await sleep(stepMs, signal);
    yield { type: "fallback", reason: "limited" };
    return;
  }

  const sample = HERO_SAMPLES.find((s) => s.jd === req.jd.trim());
  const body = sample?.bad ? HERO_BAD : HERO_FIT;
  const link = isLink(req.jd);
  const details: Record<FitTool, string> = {
    fetch_url: link ? "fetched" : "skipped",
    "jd.parse": `${body.matches.length + body.gaps.length} requirements`,
    "kb.search": "sources found",
    "evidence.map": `${body.matches.length} ${body.matches.length === 1 ? "match" : "matches"} · ${body.gaps.length} gaps`,
    "guard.citations": "pass",
    "guard.honesty": "pass",
    "verdict.compose": "done",
  };

  const tools = Object.keys(details) as FitTool[];
  for (const [i, tool] of tools.entries()) {
    yield { type: "step", tool, status: "running" };
    if (mode === "hold" && i === 3) {
      await sleep(2 ** 31 - 1, signal); // setTimeout's maximum: waits until aborted
    }
    await sleep(stepMs, signal);
    if (mode === "error" && i === 1) {
      yield { type: "fallback", reason: "error" };
      return;
    }
    const skipped = tool === "fetch_url" && !link;
    yield { type: "step", tool, status: skipped ? "skipped" : "done", detail: details[tool] };
  }
  yield { type: "result", role: sample?.role ?? PASTED_ROLE, retries: 0, ...body };
}

/** Break my AI on the hero: the 4 design attacks get their replies; any other text, the fall-through. */
export async function stubBreak(text: string, mode: StubMode = null, delayMs = 300): Promise<BreakResult> {
  await sleep(delayMs);
  if (mode === "error") return { status: "error" };
  if (mode === "limited") return { status: "limited" };
  return { status: "ok", reply: BREAK_REPLIES[text.trim()] ?? BREAK_OTHER };
}
