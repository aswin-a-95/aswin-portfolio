import { z } from "zod";

/** `kind` values from SPEC §8. */
export const ASK_KINDS = ["fit", "gap", "none", "refuse", "conflict", "clarify", "unknown"] as const;
export type AskKind = (typeof ASK_KINDS)[number];

export const AskSourceSchema = z.object({ label: z.string(), href: z.string() });
export type AskSource = z.infer<typeof AskSourceSchema>;

/**
 * One answer from Ask my work. The structured output of `/api/run` with `mode: "ask"` (SPEC §8);
 * the dev stub returns the same shape.
 */
export const AskAnswerSchema = z.object({
  kind: z.enum(ASK_KINDS),
  text: z.string(),
  sources: z.array(AskSourceSchema),
  /** Guard name shown in X-ray, or "none · answered from the knowledge base". */
  guard: z.string(),
  /** Content Aswin still has to supply, shown in the dotted box (Ask.dc.html `todo`). Empty when none. */
  todo: z.string().optional(),
  /** Live run metadata for the X-ray line. Only the real endpoint sets it; it is never faked. */
  trace: z.object({ runId: z.string(), costUsd: z.number(), ms: z.number() }).optional(),
});
export type AskAnswer = z.infer<typeof AskAnswerSchema>;

/** A fit check's context, carried into Ask for this session only (SPEC §5). */
export const SessionMemorySchema = z.object({
  role: z.string(),
  matchCount: z.number().int().nonnegative(),
  gaps: z.array(z.object({ req: z.string(), closest: z.string(), close: z.string() })),
});
export type SessionMemory = z.infer<typeof SessionMemorySchema>;

export type AskRequest = {
  /** The question as shown on the "›" line. ≤ 1,000 chars (SPEC §10). */
  question: string;
  memory: SessionMemory | null;
};

export type AskResult =
  | { status: "ok"; answer: AskAnswer }
  | { status: "error" }
  | { status: "limited" };

export const ASK_MAX_CHARS = 1000;
