import { ASK_QUESTIONS, CTX_QUESTION, gapQuestion, type AskQuestionId } from "./copy";
import { ASK_ANSWERS, type AskFixture } from "./fixtures";
import type { AskAnswer, AskRequest, AskResult, SessionMemory } from "./types";

/**
 * Dev stub for Ask my work, replaced by `/api/run` in Milestone 5. It only knows the design's
 * fixed questions (suggestions, Break my AI chips, session-memory questions). Any other text
 * returns `unknown`: there is deliberately no keyword router, so nothing pretends to understand.
 */

/** Test hook: sessionStorage["ask-stub"] = "error" | "limited" forces that outcome. */
export const STUB_MODE_KEY = "ask-stub";
const STUB_DELAY_MS = 300;

const DEFAULT_GUARD = "none · answered from the knowledge base";

function fromFixture(f: AskFixture): AskAnswer {
  return {
    kind: f.kind,
    text: f.text,
    todo: f.todo,
    sources: f.sources,
    // Ask.dc.html: answers without a guard show gap_stated for gaps, else the default line.
    guard: f.guard ?? (f.kind === "gap" ? "guard.gap_stated" : DEFAULT_GUARD),
  };
}

/** The design's `ctxAnswer` template for questions about the visitor's fit check. */
function fromMemory(question: string, memory: SessionMemory): AskAnswer | null {
  if (question === CTX_QUESTION) {
    return {
      kind: "fit",
      guard: "none · answered from session memory + knowledge base",
      text:
        "Ask how he would ramp up on: " +
        memory.gaps.map((g) => g.req).join("; ") +
        ". Each case study also ends with questions to ask him.",
      todo: "",
      sources: [{ label: "Case studies", href: "/work" }],
    };
  }
  const g = memory.gaps.find((gap) => gapQuestion(gap.req) === question);
  if (!g) return null;
  const none = /^Not something Aswin has done/.test(g.closest);
  return {
    kind: none ? "none" : "gap",
    guard: "guard.gap_stated",
    text: g.closest + (g.close ? " " + g.close : ""),
    todo: "",
    sources: [
      { label: "Your fit check", href: "/#top" },
      { label: "About · career", href: "/about" },
    ],
  };
}

export function stubAnswer({ question, memory }: AskRequest): AskAnswer {
  if (memory) {
    const ctx = fromMemory(question, memory);
    if (ctx) return ctx;
  }
  const id = (Object.keys(ASK_QUESTIONS) as AskQuestionId[]).find((k) => ASK_QUESTIONS[k] === question);
  return fromFixture(ASK_ANSWERS[id ?? "unknown"]);
}

function forcedMode(): string | null {
  try {
    return window.sessionStorage.getItem(STUB_MODE_KEY);
  } catch {
    return null;
  }
}

export async function stubAsk(req: AskRequest): Promise<AskResult> {
  await new Promise((r) => setTimeout(r, STUB_DELAY_MS));
  const mode = forcedMode();
  if (mode === "error") return { status: "error" };
  if (mode === "limited") return { status: "limited" };
  return { status: "ok", answer: stubAnswer(req) };
}
