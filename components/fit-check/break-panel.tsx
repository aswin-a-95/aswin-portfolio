"use client";

import { useState, type Ref } from "react";
import { HERO_ATTACKS, type BreakTone, type BreakVerdict } from "@/lib/fit-check/copy";

export type BreakEntry = {
  id: number;
  text: string;
  verdict: BreakVerdict;
  tone: BreakTone;
  reply: string;
  guard: string;
  trace?: { runId: string; ms: number };
};

const PILL: Record<BreakTone, string> = {
  held: "border border-accent bg-accent-tint text-accent",
  gap: "border-[1.5px] border-dashed border-amber-border bg-amber-bg text-amber-text",
  neutral: "border border-rule bg-transparent text-ink",
};

export const resetButton =
  "min-h-11 cursor-pointer rounded-lg border border-rule bg-transparent px-[14px] py-2 font-sans text-[14px] text-ink";

/** Break my AI · red-team mode (Hero.dc.html `isBreak`). */
export function BreakPanel({
  log,
  pending,
  xray,
  evalSet,
  onAttack,
  onReset,
  headingRef,
}: {
  log: BreakEntry[];
  pending: boolean;
  xray: boolean;
  evalSet: { href: string; todo: string };
  onAttack: (text: string) => void;
  onReset: () => void;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const [text, setText] = useState("");
  const held = log.filter((l) => l.verdict !== "ANSWERED").length;
  return (
    <div className="flex flex-col gap-4 rounded-[14px] border border-rule bg-paper p-[22px]" aria-busy={pending}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-[6px]">
          <p className="m-0 font-mono text-[12px] uppercase tracking-[0.06em] text-muted">Break my AI · red-team mode</p>
          <h2 ref={headingRef} tabIndex={-1} className="m-0 font-serif text-[32px] font-normal leading-[1.15] outline-none">
            Try to make it overclaim.
          </h2>
          <p className="m-0 text-[15px] leading-[1.5] text-muted">
            Pick an attack or write your own. Every reply says which guardrail held.
          </p>
        </div>
        <p role="status" aria-live="polite" className="m-0 flex items-baseline gap-2 font-mono">
          <span className="text-[36px] text-accent">{held}</span>
          <span className="text-[13px] text-muted">held up of {log.length}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {HERO_ATTACKS.map((a) => (
          <button
            key={a.chip}
            type="button"
            onClick={() => onAttack(a.text)}
            className="min-h-10 cursor-pointer rounded-lg border border-rule bg-bg px-3 py-[6px] font-mono text-[13px] text-ink"
          >
            {a.chip}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = text.trim();
          if (!t) return;
          setText("");
          onAttack(t);
        }}
        className="flex flex-wrap gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="Your own attempt"
          placeholder="Or write your own attempt…"
          maxLength={1000}
          className="min-h-11 flex-[1_1_260px] rounded-lg border border-rule bg-bg px-3 py-2 font-mono text-[14px] text-ink"
        />
        <button
          type="submit"
          className="min-h-11 cursor-pointer rounded-lg border-0 bg-btn-bg px-[18px] py-2 font-sans text-[15px] font-semibold text-btn-ink"
        >
          Run
        </button>
      </form>
      {log.map((l) => (
        <div key={l.id} className="flex flex-col gap-[6px] border-t border-rule pt-3">
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className={`rounded-md px-2 py-[2px] font-mono text-[12px] ${PILL[l.tone]}`}>{l.verdict}</span>
            <span className="font-mono text-[13px]">“{l.text}”</span>
          </div>
          <p className="m-0 text-[15px] leading-[1.5]">{l.reply}</p>
          {xray && (
            <p className="m-0 font-mono text-[12px] text-muted">
              guardrail fired: {l.guard} · trace {l.trace?.runId ?? "[run id]"} · {l.trace ? `${l.trace.ms} ms` : "[ms]"}
            </p>
          )}
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-3">
        <a href={evalSet.href} className="inline-flex min-h-11 items-center font-mono text-[12px] text-accent">
          These cases ship with the public eval set · GitHub{evalSet.todo} →
        </a>
        <button type="button" onClick={onReset} className={resetButton}>
          Back to the fit check
        </button>
      </div>
    </div>
  );
}
