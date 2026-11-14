import { postRun } from "@/lib/run-client";
import { AskAnswerSchema, type AskRequest, type AskResult } from "./types";

/** Asks a question through `/api/run` (`mode: "ask"`, SPEC §8). Session memory rides along. */
export async function ask(req: AskRequest): Promise<AskResult> {
  try {
    const res = await postRun({ mode: "ask", question: req.question, memory: req.memory });
    if (!res.ok) return { status: "error" };
    const data = (await res.json()) as { status: string; answer?: unknown };
    if (data.status === "limited" || data.status === "budget") return { status: data.status };
    const answer = AskAnswerSchema.safeParse(data.answer);
    return data.status === "ok" && answer.success ? { status: "ok", answer: answer.data } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}
