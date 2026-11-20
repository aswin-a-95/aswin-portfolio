import { todo } from "@/lib/content";
import type { CaseStudy } from "@/lib/schemas/content";

type CardFields = Pick<
  CaseStudy,
  "slug" | "num" | "status" | "cardTitle" | "built"
>;

/**
 * The PRD template fields SPEC §12 asks for, all TODO(aswin), for the studies the design doesn't
 * spell out. Architecture, "Try to break it", Performance and Questions stay off until
 * Aswin adds them.
 */
export function skeleton(card: CardFields): CaseStudy {
  return {
    ...card,
    breadcrumb: `${card.num} · ${card.cardTitle.toUpperCase()}`,
    title: card.cardTitle,
    lede: todo("[One-line lede]"), // TODO(aswin)
    facts: [
      { label: "CONTEXT", value: todo("[context]") }, // TODO(aswin)
      { label: "BUILT WITH", value: todo("[tools]") }, // TODO(aswin)
      { label: "FOCUS", value: todo("[focus]") }, // TODO(aswin)
      { label: "TIME SPENT", value: todo("[hours]") }, // TODO(aswin)
      { label: "LAST UPDATED", value: todo("[date]") }, // TODO(aswin)
    ],
    demo: todo("[walkthrough video or recorded run]"), // TODO(aswin)
    problem: {
      who: todo("[Primary user, in one line]"), // TODO(aswin)
      problem: todo("[What is slow or risky today, in two sentences]"), // TODO(aswin)
      whyAi: todo("[What AI changes here, and what it must not be trusted with]"), // TODO(aswin)
    },
    decisions: [1, 2, 3].map(() => ({
      topic: todo("[Decision]"), // TODO(aswin)
      chose: todo("[option]"),
      over: todo("[alternative]"),
      because: todo("[the cost you accepted]"),
    })),
    builtMyself: todo("[What you built yourself]"), // TODO(aswin)
    usedOrReused: todo("[Tools, models and parts you didn't build yourself]"), // TODO(aswin)
    safeguards: [1, 2, 3, 4].map(() => ({
      title: todo("[Safeguard]"), // TODO(aswin)
      stops: todo("[the failure it prevents]"),
      userSees: todo("[the UI when it fires]"),
    })),
    metrics: [
      { kind: "NORTH STAR", hint: todo("[North-star metric]") }, // TODO(aswin)
      { kind: "GUARDRAIL", hint: todo("[Guardrail metric]") },
      { kind: "ADOPTION", hint: todo("[Adoption metric]") },
    ],
    beforeAfter: {
      agentTitle: "WITH THE AGENT",
      manual: [{ text: todo("[Manual step]"), time: todo("[time]") }], // TODO(aswin)
      agent: [{ text: todo("[Agent step]"), time: todo("[time]") }], // TODO(aswin)
      manualTotal: todo("[measured]"),
      agentTotal: todo("[measured]"),
    },
    v2: todo("[What you'd build next, and why it waited]"), // TODO(aswin)
    learned: todo("[One thing that surprised you, in your words]"), // TODO(aswin)
    repo: todo("[repo link]"), // TODO(aswin)
  };
}
