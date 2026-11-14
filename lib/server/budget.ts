import type { ServerEnv } from "./env";
import { redisOrNull } from "./redis";

/**
 * Monthly AI spend counter (SPEC §10). Every AI mode checks it before a run and adds the run's
 * real cost after. At MONTHLY_BUDGET_USD all modes stop. The check runs before the call, so the
 * last run can go over the cap by its own cost; the Anthropic workspace spend limit is the
 * hard backstop.
 */
export function budgetKey(now = new Date()): string {
  return `budget:${now.toISOString().slice(0, 7)}`;
}

const memory = new Map<string, number>();
export function resetMemoryBudget() {
  memory.clear();
}

export async function spentThisMonth(env: ServerEnv): Promise<number> {
  const redis = redisOrNull(env);
  if (!redis) return memory.get(budgetKey()) ?? 0;
  return Number((await redis.get<number | string>(budgetKey())) ?? 0);
}

export async function budgetLeft(env: ServerEnv): Promise<boolean> {
  return (await spentThisMonth(env)) < env.MONTHLY_BUDGET_USD;
}

export async function addSpend(usd: number, env: ServerEnv): Promise<void> {
  if (!(usd > 0)) return;
  const key = budgetKey();
  const redis = redisOrNull(env);
  if (!redis) {
    memory.set(key, (memory.get(key) ?? 0) + usd);
    return;
  }
  await redis.incrbyfloat(key, usd);
  await redis.expire(key, 60 * 60 * 24 * 40);
}
