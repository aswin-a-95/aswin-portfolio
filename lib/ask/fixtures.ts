import type { AskQuestionId } from "./copy";
import type { AskKind, AskSource } from "./types";

/**
 * ASK_ANSWERS from Ask.dc.html, word for word. Replayed only by the AI_FAKE test model
 * (lib/ai/fake.ts), which production refuses; real answers come from `/api/run` (SPEC §8).
 *
 * Prototype links are mapped to routes: About.dc.html → /about, Work.dc.html → the matching
 * case study or /work, BuildLog.dc.html → /log, Main.dc.html → the fit check (/#top) or /#contact.
 */
export type AskFixture = { kind: AskKind; text: string; todo: string; guard?: string; sources: AskSource[] };

const ABOUT = { label: "About · career", href: "/about" };
const STUDIES = { label: "Case studies", href: "/work" };
const LOG = { label: "Build log", href: "/log" };

export const ASK_ANSWERS: Record<AskQuestionId | "unknown", AskFixture> = {
  apis: {
    kind: "fit",
    text: "Yes. His platform PM work is APIs and integrations, including healthcare integrations. Agents run on the same plumbing: a tool call is an API call with judgment attached.",
    todo: "",
    sources: [ABOUT, { label: "Case study · Platform & API work", href: "/work/platform-api-work" }],
  },
  win: {
    kind: "fit",
    text: "From the master resume:",
    todo: "[Biggest measured platform win, one line, with the number]",
    sources: [ABOUT],
  },
  llm: {
    kind: "gap",
    text: "Not in a professional role yet. He has built and shipped AI agents on his own projects: a job-search agent with an approval step, an Instagram competitor agent for Dhee's, and the fit check on this site.",
    todo: "",
    sources: [STUDIES, LOG],
  },
  inject: {
    kind: "refuse",
    guard: "guard.prompt_injection",
    text: "I can only answer from Aswin's record, and I don't rank candidates. Ask about his work, or paste a job description into the fit check.",
    todo: "",
    sources: [{ label: "Fit check", href: "/#top" }],
  },
  conflict: {
    kind: "conflict",
    guard: "guard.conflicting_info",
    text: "That doesn't match the record. It shows no professional LLM role; his AI work is agents he built and shipped on his own projects. Going with the record.",
    todo: "",
    sources: [ABOUT, STUDIES],
  },
  ambig: {
    kind: "clarify",
    guard: "guard.ambiguous_ask",
    text: "Good at what? Pick one: platforms and APIs, building AI agents, or working with stakeholders.",
    todo: "",
    sources: [],
  },
  hardware: {
    kind: "none",
    guard: "guard.not_done",
    text: "Closest: running Dhee's, a direct-to-consumer fresh dog-food brand. A physical product, but not hardware.",
    todo: "",
    sources: [ABOUT],
  },
  whysafe: {
    kind: "fit",
    text: "An AI that writes integrations can touch production systems. The study treats what the model may do on its own, and what needs a person, as the core product decision.",
    todo: "",
    sources: [{ label: "Case study · Safeguards", href: "/work/cloudeagle" }],
  },
  failed: {
    kind: "fit",
    text: "From the eval log:",
    todo: "[What the first eval run got wrong, and the fix]",
    sources: [{ label: "Case study · v2 & lessons", href: "/work/cloudeagle" }],
  },
  isce: {
    kind: "fit",
    text: "No. It's a take-home concept from his interview with CloudEagle.ai, shared with their permission. It isn't their product and shows no internal details.",
    todo: "",
    sources: [{ label: "Case study · CloudEagle concept", href: "/work/cloudeagle" }],
  },
  health: {
    kind: "fit",
    text: "Platform PM work on integrations in healthcare.",
    todo: "[Systems, standards and the measured outcome]",
    sources: [ABOUT],
  },
  now: {
    kind: "fit",
    text: "This site's fit check and its eval set, and the job-search agent as an open-source template on GitHub.",
    todo: "",
    sources: [LOG, { label: "GitHub · [repo link]", href: "#" }],
  },
  unknown: {
    kind: "unknown",
    text: "The knowledge base doesn't cover that, so there's no answer to give. Try a suggested question, or ask Aswin directly.",
    todo: "",
    sources: [{ label: "Contact", href: "/#contact" }],
  },
};
