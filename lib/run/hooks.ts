import { isFake, type ServerEnv } from "@/lib/server/env";

/**
 * Test hooks for the route, honoured only under AI_FAKE (refused in production). They let e2e
 * reach states that depend on Redis or timing without waiting for them:
 *   [[fake:limited]] → the visitor is over the rate limit
 *   [[fake:budget]]  → the monthly budget is spent
 *   [[fake:hold]]    → the fit check pauses before evidence.map until the request is aborted
 * Model-level markers ([[fake:error]], [[fake:fail-once]]) live in lib/ai/fake.ts.
 */
export type Hook = "limited" | "budget" | "hold";

export function hook(env: ServerEnv, text: string, h: Hook): boolean {
  return isFake(env) && text.includes(`[[fake:${h}]]`);
}

export function untilAborted(signal: AbortSignal): Promise<never> {
  return new Promise((_, reject) => {
    if (signal.aborted) return reject(signal.reason);
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}
