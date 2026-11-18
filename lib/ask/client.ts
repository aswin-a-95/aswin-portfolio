import { readNdjson, postRun } from "@/lib/run-client";
import { AskEventSchema, type AskRequest, type AskResult, type AskStepEvent } from "./types";

/**
 * Asks a question through `/api/run` (`mode: "ask"`, SPEC §8). Session memory rides along.
 * The run streams its real steps; each one goes to `onStep` as it happens, then the result returns.
 * Any transport or validation failure is an error.
 */
export async function ask(req: AskRequest, onStep?: (ev: AskStepEvent) => void, signal?: AbortSignal): Promise<AskResult> {
  try {
    const res = await postRun({ mode: "ask", question: req.question, memory: req.memory }, signal);
    if (!res.ok || !res.body) return { status: "error" };
    for await (const raw of readNdjson(res.body)) {
      const parsed = AskEventSchema.safeParse(raw);
      if (!parsed.success) return { status: "error" };
      const ev = parsed.data;
      if (ev.type === "step") onStep?.(ev);
      else return ev.status === "ok" ? { status: "ok", answer: ev.answer } : { status: ev.status };
    }
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}
