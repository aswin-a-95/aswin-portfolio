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

/** Reads an NDJSON response body (SPEC §7–8) and yields each line, parsed, as it arrives. */
export async function* readNdjson(body: ReadableStream<Uint8Array<ArrayBuffer>>): AsyncGenerator<unknown> {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += value;
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) yield JSON.parse(line);
    }
  }
  if (buf.trim()) yield JSON.parse(buf);
}
