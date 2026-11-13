import type { AskRequest, AskResult } from "./types";

/**
 * The stub runs everywhere except production builds (VERCEL_ENV=production, as in
 * lib/content.ts). Inlined at build time by next.config.ts.
 */
export const ASK_STUB_ENABLED = process.env.NEXT_PUBLIC_ASK_STUB === "1";

/**
 * Asks a question. Milestone 5 replaces the body with a call to `/api/run` (`mode: "ask"`).
 * Until then production has no backend, so it returns the error state rather than a fake answer.
 */
export async function ask(req: AskRequest): Promise<AskResult> {
  if (ASK_STUB_ENABLED) {
    // Dynamic import keeps the fixtures out of the production bundle.
    const { stubAsk } = await import("./stub");
    return stubAsk(req);
  }
  return { status: "error" };
}
