import { KB, type KbEntry, type KbScope } from "./snapshot";

/**
 * `kb.search` (SPEC §6–7): a deterministic server function, not the model. It scores entries by
 * keyword overlap with each requirement and returns the best entries from the requested scopes.
 * Same input, same output, every time. No embeddings.
 */

export const FIT_SCOPES = ["roles", "projects", "not_done"] as const satisfies readonly KbScope[];

const STOPWORDS = new Set(
  "a an and are as at be by for from has have in into is it its of on or our the their to with we you your will who what that this than then them they own ship work working years year plus preferred required experience strong clear".split(
    " ",
  ),
);

/** Words that mean the same thing for matching. Each maps to one canonical token. */
const SYNONYMS: Record<string, string> = {
  apis: "api",
  endpoint: "api",
  endpoints: "api",
  integration: "integrations",
  connector: "integrations",
  connectors: "integrations",
  partner: "integrations",
  partners: "integrations",
  webhooks: "integrations",
  agents: "agent",
  agentic: "agent",
  llm: "ai",
  llms: "ai",
  genai: "ai",
  model: "ai",
  guardrails: "safeguards",
  guardrail: "safeguards",
  safety: "safeguards",
  safe: "safeguards",
  hospital: "healthcare",
  health: "healthcare",
  clinical: "healthcare",
  stakeholders: "stakeholder",
  business: "stakeholder",
  adoption: "stakeholder",
  approval: "human",
  loop: "human",
  manufacturers: "manufacturing",
  manufacturer: "manufacturing",
  production: "production",
  launches: "launch",
  launched: "launch",
  roadmaps: "roadmap",
  platforms: "platform",
};

export function tokens(text: string): Set<string> {
  const out = new Set<string>();
  for (const raw of text.toLowerCase().split(/[^a-z0-9&+]+/)) {
    if (raw.length < 2 || STOPWORDS.has(raw)) continue;
    out.add(SYNONYMS[raw] ?? raw);
  }
  return out;
}

const ENTRY_TOKENS = new Map<string, Set<string>>();
function entryTokens(e: KbEntry): Set<string> {
  let t = ENTRY_TOKENS.get(e.id);
  if (!t) {
    t = tokens(`${e.text} ${e.tags.join(" ")}`);
    ENTRY_TOKENS.set(e.id, t);
  }
  return t;
}

export function score(requirement: string, e: KbEntry): number {
  const et = entryTokens(e);
  let n = 0;
  for (const t of tokens(requirement)) if (et.has(t)) n++;
  return n;
}

/** Per requirement: the top 2 evidence entries (roles, projects) and the top not-done entry. */
const PER_REQ = { evidence: 2, not_done: 1 };

export function kbSearch(
  requirements: readonly string[],
  scopes: readonly KbScope[] = FIT_SCOPES,
  kb: readonly KbEntry[] = KB,
): KbEntry[] {
  const pool = kb.filter((e) => scopes.includes(e.scope));
  const picked = new Map<string, KbEntry>();
  const rank = (req: string, list: KbEntry[]) =>
    list
      .map((e) => ({ e, s: score(req, e) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.e.id.localeCompare(b.e.id));

  for (const req of requirements) {
    for (const { e } of rank(req, pool.filter((e) => e.scope !== "not_done")).slice(0, PER_REQ.evidence)) picked.set(e.id, e);
    for (const { e } of rank(req, pool.filter((e) => e.scope === "not_done")).slice(0, PER_REQ.not_done)) picked.set(e.id, e);
  }
  // Stable output order: by scope as requested, then by id.
  return [...picked.values()].sort((a, b) => scopes.indexOf(a.scope) - scopes.indexOf(b.scope) || a.id.localeCompare(b.id));
}
