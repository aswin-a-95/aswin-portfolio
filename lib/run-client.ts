import { turnstileToken } from "@/lib/turnstile/client";

/** POSTs one /api/run request with a fresh Turnstile token (SPEC §6–8). */
export async function postRun(body: Record<string, unknown>, signal?: AbortSignal): Promise<Response> {
  const token = await turnstileToken();
  return fetch("/api/run", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...body, turnstileToken: token }),
    signal,
  });
}
