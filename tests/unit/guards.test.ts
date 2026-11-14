import { describe, expect, it } from "vitest";
import { costUsd, tokensOf } from "@/lib/ai/cost";
import type { EvidenceCard } from "@/lib/ai/schemas";
import { KB, kbEntry } from "@/lib/kb/snapshot";
import { assertPublicUrl, htmlToText, isPrivateAddress } from "@/lib/run/fetch-url";
import { ASK_UNKNOWN_TEXT, NO_SOURCE_CLOSEST, guardAsk, guardCitations, guardHonesty, hasScore, sandboxConsistent } from "@/lib/run/guards";
import { composeVerdict } from "@/lib/run/verdict";

const notDone = KB.filter((e) => e.scope === "not_done");
const cloudeagle = kbEntry("cloudeagle")!;

describe("verdict.compose", () => {
  it("is strong at m/n ≥ 0.5 and not strong below", () => {
    expect(composeVerdict(3, 3).verdict).toBe("Strong on 3 of 6 requirements.");
    expect(composeVerdict(2, 3).verdict).toBe("Not a strong fit: 2 of 5 requirements.");
    expect(composeVerdict(0, 0).verdict).toBe("Not a strong fit: 0 of 0 requirements.");
  });
});

describe("guard.citations", () => {
  const reqs = ["Ship AI agent features", "Own a public API"];
  it("keeps a match citing a source kb.search returned", () => {
    const cards: EvidenceCard[] = [{ type: "match", req: reqs[0], evidence: "Designed it.", sourceId: "cloudeagle" }];
    const out = guardCitations(reqs.slice(0, 1), cards, [cloudeagle]);
    expect(out[0].type).toBe("match");
    expect(out.fired).toEqual([]);
  });
  it("turns a match with an unknown or unsearched source into a gap", () => {
    const cards: EvidenceCard[] = [
      { type: "match", req: reqs[0], evidence: "Made up.", sourceId: "nope" },
      { type: "match", req: reqs[1], evidence: "Not searched.", sourceId: "job-search-agent" },
    ];
    const out = guardCitations(reqs, cards, [cloudeagle]);
    expect(out.map((c) => c.type)).toEqual(["gap", "gap"]);
    expect(out[0]).toMatchObject({ closest: NO_SOURCE_CLOSEST });
    expect(out.fired).toHaveLength(2);
  });
  it("adds a gap for a requirement the model skipped", () => {
    expect(guardCitations(reqs, [], [cloudeagle]).map((c) => c.req)).toEqual(reqs);
  });
});

describe("guard.honesty", () => {
  it("never lets a not-done topic be a match", () => {
    const cards: EvidenceCard[] = [{ type: "match", req: "Consumer hardware launches at scale", evidence: "Runs Dhee's.", sourceId: "dhees" }];
    const out = guardHonesty(cards, notDone);
    expect(out.matches).toEqual([]);
    expect(out.gaps[0]).toEqual({ req: "Consumer hardware launches at scale", closest: "Not something Aswin has done.", close: "" });
  });
  it("uses the not-done entry's own closest line", () => {
    const cards: EvidenceCard[] = [{ type: "gap", req: "Retail channel P&L", closest: "x", close: "y", notDoneId: "retail-channel-pl" }];
    expect(guardHonesty(cards, notDone).gaps[0]).toEqual({ req: "Retail channel P&L", closest: "Runs Dhee's, a direct-to-consumer brand. Not retail, not hardware.", close: "" });
  });
  it("rejects percentages and scores", () => {
    expect(hasScore("a 92% match")).toBe(true);
    expect(hasScore("scored 8/10")).toBe(true);
    expect(hasScore("Built an integration builder")).toBe(false);
    const out = guardHonesty([{ type: "match", req: "Agents", evidence: "A 90% fit.", sourceId: "cloudeagle" }], notDone);
    expect(out.matches).toEqual([]);
  });
  it("maps a match to the KB label and href", () => {
    const out = guardHonesty([{ type: "match", req: "Agents", evidence: "Designed it.", sourceId: "cloudeagle" }], notDone);
    expect(out.matches[0]).toEqual({ req: "Agents", evidence: "Designed it.", source: "Case study · CloudEagle concept", href: "/work/cloudeagle" });
  });
});

describe("Ask guard", () => {
  it("drops an uncited factual answer to unknown", () => {
    const a = guardAsk({ kind: "fit", text: "Yes.", sourceIds: ["made-up"], guard: "none" }, false);
    expect(a).toMatchObject({ kind: "unknown", text: ASK_UNKNOWN_TEXT, sources: [{ label: "Contact", href: "/#contact" }] });
  });
  it("derives the guard from the kind", () => {
    expect(guardAsk({ kind: "none", text: "Not something Aswin has done.", sourceIds: ["hardware-roadmaps"], guard: "none" }, false).guard).toBe("guard.not_done");
    expect(guardAsk({ kind: "refuse", text: "I only answer from the record.", sourceIds: [], guard: "none" }, false).guard).toBe("guard.prompt_injection");
  });
  it("cites the visitor's fit check only when memory was sent", () => {
    expect(guardAsk({ kind: "fit", text: "Ask about X.", sourceIds: ["memory"], guard: "none" }, true).sources).toEqual([{ label: "Your fit check", href: "/#top" }]);
    expect(guardAsk({ kind: "fit", text: "Ask about X.", sourceIds: ["memory"], guard: "none" }, false).kind).toBe("unknown");
  });
});

describe("sandbox guard", () => {
  it("requires the verdict and guard to agree", () => {
    expect(sandboxConsistent({ verdict: "BLOCKED", reason: "No.", guard: "guard.secrets" })).toBe(true);
    expect(sandboxConsistent({ verdict: "DRAFTED", reason: "Ok.", guard: "guard.secrets" })).toBe(false);
  });
});

describe("cost", () => {
  it("prices uncached input, output and cache reads separately", () => {
    const t = tokensOf({
      inputTokens: 1_100_000,
      inputTokenDetails: { noCacheTokens: 1_000_000, cacheReadTokens: 100_000, cacheWriteTokens: 0 },
      outputTokens: 100_000,
      outputTokenDetails: { textTokens: 100_000, reasoningTokens: 0 },
      totalTokens: 1_200_000,
    });
    expect(costUsd("claude-sonnet-5-5", t)).toBeCloseTo(2 + 1 + 0.01, 6);
  });
  it("refuses an unpriced model", () => {
    expect(() => costUsd("claude-unknown", { input: 1, output: 1, cacheRead: 0, cacheWrite: 0 })).toThrow();
  });
});

describe("fetch_url safety", () => {
  it("classifies private addresses", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"])
      expect(isPrivateAddress(ip), ip).toBe(true);
    for (const ip of ["8.8.8.8", "1.1.1.1", "2606:4700::1111"]) expect(isPrivateAddress(ip), ip).toBe(false);
  });
  it("refuses other schemes, ports, credentials and private hosts", async () => {
    const resolve = async (h: string) => (h === "internal.example" ? ["10.0.0.5"] : ["93.184.216.34"]);
    await expect(assertPublicUrl("file:///etc/passwd", resolve)).rejects.toThrow();
    await expect(assertPublicUrl("http://example.com:8080/", resolve)).rejects.toThrow();
    await expect(assertPublicUrl("http://user:pw@example.com/", resolve)).rejects.toThrow();
    await expect(assertPublicUrl("http://internal.example/", resolve)).rejects.toThrow();
    await expect(assertPublicUrl("http://[::1]/", resolve)).rejects.toThrow();
    await expect(assertPublicUrl("https://example.com/jobs/1", resolve)).resolves.toBeInstanceOf(URL);
  });
  it("turns HTML into text", () => {
    const html = "<html><head><title>x</title><style>p{}</style></head><body><h1>Senior PM</h1><script>evil()</script><ul><li>Own the API</li><li>Ship agents &amp; evals</li></ul></body></html>";
    expect(htmlToText(html)).toBe("Senior PM\n\n- Own the API\n- Ship agents & evals");
  });
});
