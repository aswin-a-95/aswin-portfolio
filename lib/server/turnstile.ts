import { isFake, isProduction, type ServerEnv } from "./env";

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult = { ok: true } | { ok: false; reason: "missing" | "invalid" | "unavailable" | "config" };

/**
 * Cloudflare Turnstile server check (SPEC §10), before any model call. Under AI_FAKE with no
 * secret configured it is skipped: no real model call can happen there.
 */
export async function verifyTurnstile(token: string, ip: string, env: ServerEnv, fetchImpl: typeof fetch = fetch): Promise<TurnstileResult> {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (isFake(env) && !isProduction(env)) return { ok: true };
    return { ok: false, reason: "config" };
  }
  if (!token) return { ok: false, reason: "missing" };
  try {
    const res = await fetchImpl(SITEVERIFY, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip === "unknown" ? undefined : ip }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, reason: "unavailable" };
    const data = (await res.json()) as { success?: boolean };
    return data.success === true ? { ok: true } : { ok: false, reason: "invalid" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
