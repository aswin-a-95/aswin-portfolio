"use client";

import { useState, type FormEvent } from "react";

type Attack = { type: string; text: string };

/**
 * "Try to break it" (Work.dc.html). The presets and free-text attempts run against
 * /api/run mode "sandbox" from Milestone 5; until then nothing is sent and no verdict is shown.
 */
export function Sandbox({ attacks, evalSet }: { attacks: Attack[]; evalSet: { href: string; label: string } }) {
  const [text, setText] = useState("");
  const attempts = 0;
  const stopped = 0;
  const onSubmit = (e: FormEvent) => e.preventDefault();

  return (
    <section id="s-break" aria-labelledby="h-break" className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 id="h-break" className="m-0 font-serif text-[34px] font-normal">
            Try to break it
          </h2>
          <p className="m-0 text-[16px] text-muted">The same attack types as Break my AI on the home page. Pick one or write your own.</p>
        </div>
        <div role="status" aria-live="polite" className="flex items-baseline gap-2 font-mono">
          <span className="text-[40px] text-accent">{stopped}</span>
          <span className="text-[14px] text-muted">stopped or questioned, of {attempts}</span>
        </div>
      </div>
      <div className="flex flex-col gap-[14px] rounded-[14px] border border-rule bg-paper p-5">
        <div className="flex flex-wrap gap-2">
          {attacks.map((k) => (
            <button
              key={k.text}
              type="button"
              className="flex min-h-11 cursor-pointer flex-col items-start gap-[2px] rounded-lg border border-rule bg-bg px-3 py-2 text-left font-mono text-[13px] text-ink"
            >
              <span className="text-[11px] text-muted">{k.type}</span>
              {k.text}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex flex-wrap gap-[10px]">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Your own attempt"
            placeholder="Or write your own instruction to the builder…"
            className="min-h-11 flex-[1_1_280px] rounded-lg border border-rule bg-bg px-3 py-2 font-mono text-[14px] text-ink"
          />
          <button
            type="submit"
            className="min-h-11 cursor-pointer rounded-lg border-0 bg-btn-bg px-[18px] py-2 font-sans text-[15px] font-semibold text-btn-ink"
          >
            Run
          </button>
        </form>
        <p className="m-0 border-t border-rule pt-[14px] pb-[2px] font-mono text-[13px] text-muted">No attempts yet.</p>
        <a
          href={evalSet.href}
          className="inline-flex min-h-10 items-center self-start border-t border-rule pt-[6px] font-mono text-[12px] text-accent"
        >
          {evalSet.label} →
        </a>
      </div>
    </section>
  );
}
