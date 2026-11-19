"use client";

import { useState } from "react";
import { XrayPanel } from "@/components/xray-panel";
import { HERO_ATTACKS, HERO_DRILLS, type BreakTone, type BreakVerdict } from "@/lib/fit-check/copy";
import type { Drill } from "@/lib/fit-check/types";

export type BreakEntry = {
  id: number;
  text: string;
  verdict: BreakVerdict;
  tone: BreakTone;
  reply: string;
  guard: string;
  trace?: { runId: string; ms: number };
};

/** Verdict pills in the X-ray panel tokens (design update 3). */
const PILL: Record<BreakTone, string> = {
  held: "border border-xr-accent bg-xr-accent-tint text-xr-accent",
  gap: "border-[1.5px] border-dashed border-xr-amber-border bg-xr-amber-bg text-xr-amber-text",
  neutral: "border border-xr-rule bg-transparent text-xr-ink",
};

export const resetButton =
  "min-h-11 cursor-pointer rounded-lg border border-rule bg-transparent px-[14px] py-2 font-sans text-[14px] text-ink";

/**
 * Break my AI · red-team mode (Hero.dc.html `showBreak`, design update 3): an X-ray panel below
 * the fit check, in every state. The fit check above keeps working; the failure drills here run
 * the real fallback in it.
 */
export function BreakPanel({
  log,
  pending,
  error,
  evalSet,
  onAttack,
  onDrill,
}: {
  log: BreakEntry[];
  pending: boolean;
  /** Ask's error or limit line when the last attempt failed. */
  error: string | null;
  evalSet: { href: string; todo: string };
  onAttack: (text: string) => void;
  onDrill: (d: Drill) => void;
}) {
  const [text, setText] = useState("");
  const held = log.filter((l) => l.verdict !== "ANSWERED").length;
  return (
    <XrayPanel paper className="flex flex-col gap-4 rounded-[14px] px-[22px] pt-[38px] pb-[22px]" aria-busy={pending}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-[6px]">
          <p className="m-0 font-mono text-[12px] uppercase tracking-[0.06em] text-xr-muted">Break my AI · red-team mode</p>
          <h2 className="m-0 font-serif text-[32px] font-normal leading-[1.15]">Try to make it overclaim.</h2>
          <p className="m-0 text-[15px] leading-[1.5] text-xr-muted">
            Pick an attack or write your own. Every reply says which guardrail held. The fit check above keeps working as
            normal.
          </p>
        </div>
        <p role="status" aria-live="polite" className="m-0 flex items-baseline gap-2 font-mono">
          <span className="text-[36px] text-xr-accent">{held}</span>
          <span className="text-[13px] text-xr-muted">held up of {log.length}</span>
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {HERO_ATTACKS.map((a) => (
          <button
            key={a.chip}
            type="button"
            onClick={() => onAttack(a.text)}
            className="min-h-10 cursor-pointer rounded-lg border border-xr-rule bg-xr-bg px-3 py-[6px] font-mono text-[13px] text-xr-ink"
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
          className="min-h-11 flex-[1_1_260px] rounded-lg border border-xr-rule bg-xr-bg px-3 py-2 font-mono text-[14px] text-xr-ink placeholder:text-xr-muted"
        />
        <button
          type="submit"
          className="min-h-11 cursor-pointer rounded-lg border-0 bg-xr-btn-bg px-[18px] py-2 font-sans text-[15px] font-semibold text-xr-btn-ink"
        >
          Run
        </button>
      </form>
      {error && (
        <p role="alert" className="m-0 text-[15px] leading-[1.5] text-xr-muted">
          {error}
        </p>
      )}
      {log.map((l) => (
        <div key={l.id} className="flex flex-col gap-[6px] border-t border-xr-rule pt-3">
          <div className="flex flex-wrap items-center gap-[10px]">
            <span className={`rounded-md px-2 py-[2px] font-mono text-[12px] ${PILL[l.tone]}`}>{l.verdict}</span>
            <span className="font-mono text-[13px]">“{l.text}”</span>
          </div>
          <p className="m-0 text-[15px] leading-[1.5]">{l.reply}</p>
          <p className="m-0 font-mono text-[12px] text-xr-muted">
            guardrail fired: {l.guard} · trace {l.trace?.runId ?? "[run id]"} · {l.trace ? `${l.trace.ms} ms` : "[ms]"}
          </p>
        </div>
      ))}
      <div className="flex flex-col gap-[10px] border-t border-xr-rule pt-[14px]">
        <p className="m-0 font-mono text-[12px] uppercase tracking-[0.06em] text-xr-muted">
          Failure drills · runs the real fallback in the fit check above
        </p>
        <div className="flex flex-wrap gap-2">
          {HERO_DRILLS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onDrill(d.id)}
              className="min-h-10 cursor-pointer rounded-lg border border-dashed border-xr-rule bg-xr-bg px-3 py-[6px] font-mono text-[13px] text-xr-ink"
            >
              {d.chip}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-xr-rule pt-3">
        <a href={evalSet.href} className="inline-flex min-h-11 items-center font-mono text-[12px] text-xr-accent">
          These cases ship with the public eval set · GitHub{evalSet.todo} →
        </a>
      </div>
    </XrayPanel>
  );
}
