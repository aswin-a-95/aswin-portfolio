"use client";

import type { Ref } from "react";
import { HERO_ATTACKS, HERO_DRILLS, HERO_SAMPLES, type HeroSample } from "@/lib/fit-check/copy";
import { JD_MAX_CHARS, type Drill } from "@/lib/fit-check/types";

export const label = "font-mono text-[12px] uppercase tracking-[0.06em] text-muted";

/** Empty state (Hero.dc.html `isEmpty`): JD input, samples, Break my AI and failure drills. */
export function FitInput({
  jd,
  onJd,
  onCheck,
  onSample,
  onAttack,
  onDrill,
  inputRef,
}: {
  jd: string;
  onJd: (jd: string) => void;
  onCheck: () => void;
  onSample: (s: HeroSample) => void;
  onAttack: (text: string) => void;
  onDrill: (d: Drill) => void;
  inputRef: Ref<HTMLTextAreaElement>;
}) {
  const noJd = jd.trim() === "";
  return (
    <>
      <div className="flex flex-col gap-[14px] rounded-[14px] border border-rule bg-paper p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <label htmlFor="jd-input" className={label}>
            Job description
          </label>
          <span className="font-mono text-[12px] text-muted">text or a link · not stored</span>
        </div>
        <textarea
          id="jd-input"
          ref={inputRef}
          rows={5}
          maxLength={JD_MAX_CHARS}
          value={jd}
          onChange={(e) => onJd(e.target.value)}
          placeholder="Paste the role, or a link to it…"
          className="box-border w-full resize-y border-0 bg-transparent font-sans text-[17px] leading-[1.5] text-ink outline-none"
        />
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-[14px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[14px] text-muted">No JD handy?</span>
            {HERO_SAMPLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSample(s)}
                className={`min-h-11 cursor-pointer rounded-full bg-transparent px-[14px] py-2 font-sans text-[14px] ${
                  s.bad ? "border-[1.5px] border-dashed border-amber-border text-amber-text" : "border border-rule text-ink"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={onCheck}
            disabled={noJd}
            className="min-h-12 cursor-pointer rounded-[10px] border-0 bg-btn-bg px-[22px] py-3 font-sans text-[16px] font-semibold text-btn-ink"
            style={{ opacity: noJd ? 0.45 : 1 }}
          >
            Check fit
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-[10px]">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`min-w-[150px] ${label}`}>Break my AI</span>
          {HERO_ATTACKS.map((a) => (
            <button
              key={a.chip}
              type="button"
              onClick={() => onAttack(a.text)}
              className="min-h-10 cursor-pointer rounded-lg border border-rule bg-transparent px-3 py-[6px] font-mono text-[13px] text-ink"
            >
              {a.chip}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`min-w-[150px] ${label}`}>Failure drills</span>
          {HERO_DRILLS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onDrill(d.id)}
              className="min-h-10 cursor-pointer rounded-lg border border-dashed border-rule bg-transparent px-3 py-[6px] font-mono text-[13px] text-ink"
            >
              {d.chip}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
