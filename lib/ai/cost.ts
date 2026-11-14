import type { LanguageModelUsage } from "ai";

/**
 * USD per million tokens (Anthropic pricing, checked 2026-11-14). Cache writes use the 5-minute
 * TTL rate (1.25 × input). Add a row before switching FIT_CHECK_MODEL or CHAT_MODEL to another
 * model: an unpriced model is refused, so a run's cost is never guessed.
 */
export const PRICES: Record<string, { input: number; output: number; cacheRead: number; cacheWrite: number }> = {
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.1, cacheWrite: 2.5 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2, cacheWrite: 5 },
  /** AI_FAKE only: the fake model bills nothing. */
  fake: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
};

export function isPriced(model: string): boolean {
  return Object.hasOwn(PRICES, model);
}

export type Tokens = { input: number; output: number; cacheRead: number; cacheWrite: number };

export const NO_TOKENS: Tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };

/** Splits AI SDK usage into billable buckets. `input` is uncached input only. */
export function tokensOf(usage: LanguageModelUsage): Tokens {
  const cacheRead = usage.inputTokenDetails?.cacheReadTokens ?? 0;
  const cacheWrite = usage.inputTokenDetails?.cacheWriteTokens ?? 0;
  const input = usage.inputTokenDetails?.noCacheTokens ?? Math.max(0, (usage.inputTokens ?? 0) - cacheRead - cacheWrite);
  return { input, output: usage.outputTokens ?? 0, cacheRead, cacheWrite };
}

export function addTokens(a: Tokens, b: Tokens): Tokens {
  return { input: a.input + b.input, output: a.output + b.output, cacheRead: a.cacheRead + b.cacheRead, cacheWrite: a.cacheWrite + b.cacheWrite };
}

export function costUsd(model: string, t: Tokens): number {
  const p = PRICES[model];
  if (!p) throw new Error(`No price for model ${model}`);
  return (t.input * p.input + t.output * p.output + t.cacheRead * p.cacheRead + t.cacheWrite * p.cacheWrite) / 1_000_000;
}
