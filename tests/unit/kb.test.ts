import { describe, expect, it } from "vitest";
import { KB, kbEntry } from "@/lib/kb/snapshot";
import { FIT_SCOPES, kbSearch, score, tokens } from "@/lib/kb/search";
import { notDone } from "@/content/kb/not-done";

describe("KB snapshot", () => {
  it("has unique ids, a label and an href on every entry", () => {
    expect(new Set(KB.map((e) => e.id)).size).toBe(KB.length);
    for (const e of KB) {
      expect(e.label).not.toBe("");
      expect(e.href).not.toBe("");
    }
  });

  it("always includes the whole not-done list", () => {
    for (const n of notDone) expect(kbEntry(n.id)?.scope).toBe("not_done");
  });

  it("is frozen", () => {
    expect(Object.isFrozen(KB)).toBe(true);
    expect(Object.isFrozen(KB[0])).toBe(true);
  });
});

describe("kb.search", () => {
  it("normalises synonyms and drops stopwords", () => {
    expect([...tokens("Own the public APIs and partner integrations")]).toEqual(["public", "api", "integrations"]);
  });

  it("is deterministic", () => {
    const reqs = ["Own a public API and partner integrations", "Hardware roadmaps from prototype to mass production"];
    expect(kbSearch(reqs).map((e) => e.id)).toEqual(kbSearch(reqs).map((e) => e.id));
  });

  it("finds the not-done entry for a hardware requirement", () => {
    const ids = kbSearch(["Hardware roadmaps from prototype to mass production"]).map((e) => e.id);
    expect(ids).toContain("hardware-roadmaps");
  });

  it("finds an agent project for an agent requirement", () => {
    const hits = kbSearch(["Ship AI agent features with clear guardrails"]);
    expect(hits.some((e) => e.scope === "projects")).toBe(true);
  });

  it("only returns the requested scopes and never facts for the fit check", () => {
    const hits = kbSearch(["platform APIs integrations agents healthcare"]);
    for (const e of hits) expect(FIT_SCOPES).toContain(e.scope);
    expect(kbSearch(["platform"], ["not_done"]).every((e) => e.scope === "not_done")).toBe(true);
  });

  it("returns nothing for text with no overlap", () => {
    expect(kbSearch(["zzzz qqqq"])).toEqual([]);
    expect(score("zzzz", KB[0])).toBe(0);
  });
});
