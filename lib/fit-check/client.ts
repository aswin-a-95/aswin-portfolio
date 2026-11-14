import { AskAnswerSchema } from "@/lib/ask/types";
import { postRun } from "@/lib/run-client";
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
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) yield JSON.parse(line) as FitEvent;
    }
  }
  if (buf.trim()) yield JSON.parse(buf) as FitEvent;
}

/** One Break my AI attempt: `/api/run` with `mode: "ask"` (SPEC §8), reduced to what the hero shows. */
export async function breakAttempt(text: string): Promise<BreakResult> {
  try {
    const res = await postRun({ mode: "ask", question: text, memory: null });
    if (!res.ok) return { status: "error" };
    const data = (await res.json()) as { status: string; answer?: unknown };
    if (data.status === "limited" || data.status === "budget") return { status: data.status };
    const answer = AskAnswerSchema.safeParse(data.answer);
    if (data.status !== "ok" || !answer.success) return { status: "error" };
    const { kind, text: reply, guard, trace } = answer.data;
    return { status: "ok", reply: { kind, text: reply, guard, ...(trace ? { trace: { runId: trace.runId, ms: trace.ms } } : {}) } };
  } catch {
    return { status: "error" };
  }
}
