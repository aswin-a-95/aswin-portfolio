import { createHash } from "node:crypto";
import type { ServerEnv } from "./env";

/** The visitor's IP as Vercel reports it. Used only to derive a hash; never stored or logged. */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

/** SPEC §10: rate limits key on a salted hash of the IP, so no raw IP reaches Redis or the logs. */
export function visitorId(ip: string, env: ServerEnv): string {
  const salt = env.IP_HASH_SALT ?? "dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
