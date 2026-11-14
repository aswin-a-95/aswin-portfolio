import { describe, expect, it } from "vitest";
import { ASK_BY_PAGE, ASK_QUESTIONS, askPageFor } from "@/lib/ask/copy";
import { ASK_ANSWERS } from "@/lib/ask/fixtures";
import { AskAnswerSchema, SessionMemorySchema, type SessionMemory } from "@/lib/ask/types";

const MEMORY: SessionMemory = {
  role: "Senior Platform PM · APIs & integrations",
  matchCount: 4,
  gaps: [
    { req: "Running evals at team scale", closest: "Keeps an eval set.", close: "Would adopt the team's tooling." },
    { req: "Retail channel P&L", closest: "Not something Aswin has done.", close: "" },
  ],
};

describe("askPageFor", () => {
  it.each([
    ["/", "home"],
    ["/work", "work"],
    ["/work/cloudeagle", "work"],
    ["/log", "log"],
    ["/log/some-post", "log"],
    ["/about", "about"],
    ["/workshop", "home"],
  ])("%s → %s", (path, page) => expect(askPageFor(path)).toBe(page));
});

describe("SessionMemorySchema", () => {
  it("rejects malformed memory", () => {
    expect(SessionMemorySchema.safeParse({ role: "x", matchCount: -1, gaps: [] }).success).toBe(false);
    expect(SessionMemorySchema.safeParse({ role: "x", matchCount: 1 }).success).toBe(false);
    expect(SessionMemorySchema.safeParse(MEMORY).success).toBe(true);
  });
});

describe("ASK_ANSWERS (replayed by the AI_FAKE test model)", () => {
  it("covers every suggested question with a schema-valid answer", () => {
    for (const id of new Set(Object.values(ASK_BY_PAGE).flat())) {
      expect(ASK_QUESTIONS[id]).toBeTruthy();
      expect(AskAnswerSchema.safeParse({ ...ASK_ANSWERS[id], guard: ASK_ANSWERS[id].guard ?? "none" }).success).toBe(true);
    }
  });
});
