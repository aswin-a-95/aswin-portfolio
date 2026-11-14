import { getModel, type ResolvedModel } from "@/lib/ai/model";
import { ASK_SYSTEM, SANDBOX_SYSTEM, askKbBlock, askPrompt, sandboxPrompt } from "@/lib/ai/prompts";
import { AskOutputSchema, SandboxOutputSchema, type AskRun, type FailStatus, type SandboxReply, type SandboxRun } from "@/lib/ai/schemas";
import type { AskAnswer, SessionMemory } from "@/lib/ask/types";
import { KB, formatEntries } from "@/lib/kb/snapshot";
import { budgetLeft } from "@/lib/server/budget";
import { checkLimit } from "@/lib/server/ratelimit";
import { addUsage, displayCost, runCost, type RunContext, type RunRecord } from "./context";
import { guardAsk, sandboxConsistent } from "./guards";
import { hook } from "./hooks";
import { LlmError, callLlm } from "./llm";

/**
 * Ask my work, Break my AI (mode "ask") and the case-study sandbox (mode "sandbox"), SPEC §8.
 * One prompt each over the same knowledge base; no tools. A failed or limited attempt isn't
 * logged or counted (rec.log = false).
 */

export type AskResponse = { status: "ok"; answer: AskAnswer } | { status: FailStatus };
export type SandboxResponse = { status: "ok"; reply: SandboxReply } | { status: FailStatus };

const LIMITS = {
  ask: { maxOutputTokens: 1500, effort: "low" as const },
  sandbox: { maxOutputTokens: 800, effort: "low" as const },
};

/** The whole KB, identical on every request so the cached prefix is reused. */
const KB_BLOCK = askKbBlock(formatEntries(KB));

function memoryBlock(m: SessionMemory): string {
  return [
    `role: ${m.role}`,
    `matches: ${m.matchCount}`,
    ...m.gaps.map((g) => `gap: ${g.req} | closest: ${g.closest}${g.close ? ` | close: ${g.close}` : ""}`),
  ].join("\n");
}

type ModelFor = (ctx: RunContext) => Promise<ResolvedModel>;
const chatModel: ModelFor = (ctx) => getModel("chat", ctx.env);

/** Shared gate: the Ask bucket (30/hour, also Break my AI and the sandbox), then the budget. */
async function gate(text: string, ctx: RunContext): Promise<FailStatus | null> {
  if (hook(ctx.env, text, "limited") || !(await checkLimit("ask", ctx.visitor, ctx.env))) return "limited";
  if (hook(ctx.env, text, "budget") || !(await budgetLeft(ctx.env))) return "budget";
  return null;
}

/** One model call with the run's single retry. */
async function withRetry<T>(rec: RunRecord, signal: AbortSignal, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof LlmError) addUsage(rec, e.tokens);
    if (signal.aborted) throw e;
    rec.retries = 1;
    try {
      return await fn();
    } catch (e2) {
      if (e2 instanceof LlmError) addUsage(rec, e2.tokens);
      throw e2;
    }
  }
}

export async function runAsk(req: AskRun, ctx: RunContext, rec: RunRecord, modelFor: ModelFor = chatModel): Promise<AskResponse> {
  rec.log = false;
  const blocked = await gate(req.question, ctx);
  if (blocked) return { status: blocked };
  try {
    const model = await modelFor(ctx);
    rec.model = model.id;
    const memory = req.memory ?? null;
    const out = await withRetry(rec, ctx.signal, async () => {
      const r = await callLlm({
        model,
        system: ASK_SYSTEM,
        cachedContext: KB_BLOCK,
        prompt: askPrompt(req.question, memory ? memoryBlock(memory) : null),
        schema: AskOutputSchema,
        signal: ctx.signal,
        ...LIMITS.ask,
      });
      addUsage(rec, r.tokens);
      return r.output;
    });
    const { fired, ...answer } = guardAsk(out, memory !== null);
    if (fired) rec.guardFired.push(fired);
    rec.log = true;
    return {
      status: "ok",
      answer: { ...answer, trace: { runId: rec.runId, costUsd: displayCost(runCost(rec)), ms: Math.round(ctx.now() - rec.startedAt) } },
    };
  } catch (e) {
    if (!ctx.signal.aborted) console.error("ask failed:", e instanceof Error ? e.message : e);
    return { status: "error" };
  }
}

export async function runSandbox(req: SandboxRun, ctx: RunContext, rec: RunRecord, modelFor: ModelFor = chatModel): Promise<SandboxResponse> {
  rec.log = false;
  const blocked = await gate(req.attempt, ctx);
  if (blocked) return { status: blocked };
  try {
    const model = await modelFor(ctx);
    rec.model = model.id;
    const out = await withRetry(rec, ctx.signal, async () => {
      const r = await callLlm({ model, system: SANDBOX_SYSTEM, prompt: sandboxPrompt(req.attempt), schema: SandboxOutputSchema, signal: ctx.signal, ...LIMITS.sandbox });
      addUsage(rec, r.tokens);
      return r.output;
    });
    if (!sandboxConsistent(out)) {
      rec.guardFired.push("sandbox.consistency");
      return { status: "error" };
    }
    rec.guardFired.push(out.guard);
    rec.log = true;
    return {
      status: "ok",
      reply: { ...out, trace: { runId: rec.runId, costUsd: displayCost(runCost(rec)), ms: Math.round(ctx.now() - rec.startedAt) } },
    };
  } catch (e) {
    if (!ctx.signal.aborted) console.error("sandbox failed:", e instanceof Error ? e.message : e);
    return { status: "error" };
  }
}
