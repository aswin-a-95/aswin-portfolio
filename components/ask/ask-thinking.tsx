import type { Ref } from "react";
import { ASK_STEP_COPY } from "@/lib/ask/copy";
import { ASK_TOOLS, type AskStepEvent } from "@/lib/ask/types";

/**
 * Ask.dc.html thinking state, between asking and the answer. Each line is a real step event
 * from the run (SPEC §8): finished steps get ✓ in accent, the running one › in ink with "…".
 */
export function AskThinking({ question, steps, focusRef }: { question: string; steps: AskStepEvent[]; focusRef: Ref<HTMLDivElement> }) {
  const progress = Math.round((steps.length / ASK_TOOLS.length) * 100);
  return (
    <div
      ref={focusRef}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className="flex flex-col gap-[10px] p-[18px] font-mono text-[13px] outline-none"
    >
      <p className="m-0 text-muted">› {question}</p>
      <span aria-hidden="true" className="block h-[3px] overflow-hidden rounded-full bg-accent-tint">
        <span data-progress className="block h-[3px] bg-accent" style={{ width: `${progress}%` }} />
      </span>
      {steps.map((st) => {
        const done = st.status === "done";
        return (
          <p key={st.tool} className={`m-0 ${done ? "text-accent" : "text-ink"}`}>
            {done ? "✓" : "›"} {st.tool} · {ASK_STEP_COPY[st.tool]}
            {done ? "" : "…"}
          </p>
        );
      })}
    </div>
  );
}
