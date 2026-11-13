import type { StubMode } from "./stub";
import type { BreakResult, FitEvent, FitRequest } from "./types";

/**
 * The mock runs everywhere except production builds (VERCEL_ENV=production, as in
 * lib/content.ts and the Ask stub). Inlined at build time by next.config.ts.
 */
export const FIT_STUB_ENABLED = process.env.NEXT_PUBLIC_FIT_STUB === "1";

function stubMode(): StubMode {
  try {
    const m = window.sessionStorage.getItem("fit-stub");
    return m === "error" || m === "limited" || m === "hold" ? m : null;
  } catch {
    return null;
  }
}

/**
 * Runs a fit check and yields its events (SPEC §7). Milestone 5 replaces the body with a
 * streamed call to `/api/run` (`mode: "fit"`). Until then production has no backend, so it
 * ends in the error state with the precomputed matches rather than a fake result.
 */
export async function* runFitCheck(req: FitRequest, signal?: AbortSignal): AsyncGenerator<FitEvent> {
  if (FIT_STUB_ENABLED) {
    // Dynamic import keeps the fixtures out of the production bundle.
    const { stubFitCheck } = await import("./stub");
    yield* stubFitCheck(req, { signal, mode: stubMode() });
    return;
  }
  yield { type: "fallback", reason: "error" };
}

/** One Break my AI attempt: `/api/run` with `mode: "ask"` in Milestone 5 (SPEC §8). */
export async function breakAttempt(text: string): Promise<BreakResult> {
  if (FIT_STUB_ENABLED) {
    const { stubBreak } = await import("./stub");
    return stubBreak(text, stubMode());
  }
  return { status: "error" };
}
