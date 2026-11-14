import { generateText, NoObjectGeneratedError, Output, type LanguageModelUsage } from "ai";
import type { z } from "zod";
import { NO_TOKENS, addTokens, tokensOf, type Tokens } from "@/lib/ai/cost";
import type { ResolvedModel } from "@/lib/ai/model";

/** SPEC §10: every model call has a 60 s ceiling. The route's own signal ends the run at 60 s too. */
export const CALL_TIMEOUT_MS = 60_000;

export type Effort = "low" | "medium" | "high";

export type LlmCall<S extends z.ZodType> = {
  model: ResolvedModel;
  system: string;
  /** Static context that is the same on every request (the KB for Ask): sent first and cached. */
  cachedContext?: string;
  prompt: string;
  schema: S;
  maxOutputTokens: number;
  effort: Effort;
  signal: AbortSignal;
};

/** Tokens spent by a call, success or failure, so the budget counts what was billed. */
export class LlmError extends Error {
  constructor(
    message: string,
    readonly tokens: Tokens,
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

function usageTokens(u: LanguageModelUsage | undefined): Tokens {
  return u ? tokensOf(u) : NO_TOKENS;
}

/**
 * One structured-output call. No SDK retries (maxRetries: 0): the pipeline owns its single retry
 * so `retries` in the result is the real count. No tools: the model can't do anything but answer.
 */
export async function callLlm<S extends z.ZodType>(c: LlmCall<S>): Promise<{ output: z.infer<S>; tokens: Tokens }> {
  try {
    const result = await generateText({
      model: c.model.model,
      // AI SDK v7: system text goes in `instructions`; the cached KB block carries cacheControl.
      instructions: [
        { role: "system", content: c.system },
        ...(c.cachedContext
          ? [{ role: "system" as const, content: c.cachedContext, providerOptions: { anthropic: { cacheControl: { type: "ephemeral" as const } } } }]
          : []),
      ],
      prompt: c.prompt,
      output: Output.object({ schema: c.schema }),
      maxOutputTokens: c.maxOutputTokens,
      maxRetries: 0,
      abortSignal: c.signal,
      timeout: CALL_TIMEOUT_MS,
      providerOptions: { anthropic: { effort: c.effort } },
    });
    return { output: result.output as z.infer<S>, tokens: usageTokens(result.usage) };
  } catch (e) {
    const tokens = NoObjectGeneratedError.isInstance(e) ? usageTokens(e.usage) : NO_TOKENS;
    throw new LlmError(e instanceof Error ? e.message : "model call failed", tokens, { cause: e });
  }
}

export { addTokens };
