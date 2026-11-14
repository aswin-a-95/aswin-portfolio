import { Redis } from "@upstash/redis";
import { isFake, type ServerEnv } from "./env";

export class StoreConfigError extends Error {}

/**
 * Upstash Redis for rate limits and the budget counter. Without Upstash env, a local (no
 * VERCEL_ENV) or AI_FAKE server uses an in-memory store instead; any Vercel deployment refuses.
 */
export function redisOrNull(env: ServerEnv): Redis | null {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
  }
  if (isFake(env) || !env.VERCEL_ENV) return null;
  throw new StoreConfigError("UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set");
}
