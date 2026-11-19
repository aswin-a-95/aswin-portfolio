"use client";

import type { Ref } from "react";
import { HERO_SAMPLES, type HeroSample } from "@/lib/fit-check/copy";
import { JD_MAX_CHARS } from "@/lib/fit-check/types";

export const label = "font-mono text-[12px] uppercase tracking-[0.06em] text-muted";

/** Empty state (Hero.dc.html `isEmpty`): the JD input card and samples. */
export function FitInput({
  jd,
  onJd,
  onCheck,
  onSample,
  inputRef,
}: {
  jd: string;
  onJd: (jd: string) => void;
  onCheck: () => void;
  onSample: (s: HeroSample) => void;
  inputRef: Ref<HTMLTextAreaElement>;
}) {
  const noJd = jd.trim() === "";
  return (
    <div className="flex flex-col gap-[14px] rounded-[14px] border-[1.5px] border-accent bg-paper p-[22px] shadow-[0_0_0_4px_var(--accent-tint)]">
      <div className="flex flex-col gap-[10px]">
        <label htmlFor="jd-input" className="font-sans text-[21px] font-semibold leading-[1.35] text-ink">
          Paste a job description. This site will tell you honestly where I fit and where I don&apos;t.
        </label>
      </div>
      <textarea
        id="jd-input"
        ref={inputRef}
        rows={5}
        maxLength={JD_MAX_CHARS}
        value={jd}
        onChange={(e) => onJd(e.target.value)}
        placeholder="Paste the job description or a link to the JD (data not stored)"
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
  );
}
