import { ask } from "@/lib/ask/client";
import type { AskStepEvent } from "@/lib/ask/types";
import { postRun, readNdjson } from "@/lib/run-client";
import type { BreakResult, FitEvent, FitRequest } from "./types";

/**
 * Runs a fit check against `/api/run` (`mode: "fit"`) and yields its events as they stream in
 * (NDJSON, SPEC §7). The hero validates every event with FitEventSchema. Any transport failure
 * ends in the error state.
 */
export async function* runFitCheck(req: FitRequest, signal?: AbortSignal): AsyncGenerator<FitEvent> {
  const res = await postRun({ mode: "fit", jd: req.jd, ...(req.drill ? { drill: req.drill } : {}) }, signal);
  if (!res.ok || !res.body) {
    yield { type: "fallback", reason: "error" };
    return;
  }
  for await (const ev of readNdjson(res.body)) yield ev as FitEvent;
}

/**
 * One Break my AI attempt: `/api/run` with `mode: "ask"` (SPEC §8), reduced to the result the hero
 * shows. The run's real step events go to `onStep`, which drives the pending state (design update 4).
 */
export async function breakAttempt(text: string, onStep?: (ev: AskStepEvent) => void): Promise<BreakResult> {
  const r = await ask({ question: text, memory: null }, onStep);
  if (r.status !== "ok") return { status: r.status };
  const { kind, text: reply, guard, trace } = r.answer;
  return { status: "ok", reply: { kind, text: reply, guard, ...(trace ? { trace: { runId: trace.runId, ms: trace.ms } } : {}) } };
}
