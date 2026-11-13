"use client";

import { useState } from "react";
import type { CaseStudy } from "@/lib/schemas/content";

type Mode = "manual" | "agent" | "both";
const TABS: [Mode, string][] = [
  ["manual", "Manual"],
  ["agent", "With AI"],
  ["both", "Both"],
];

export function BeforeAfterTabs({ data }: { data: NonNullable<CaseStudy["beforeAfter"]> }) {
  const [ba, setBa] = useState<Mode>("both");
  const cols = [
    { id: "manual" as const, title: "MANUAL WAY", steps: data.manual, total: data.manualTotal },
    { id: "agent" as const, title: data.agentTitle, steps: data.agent, total: data.agentTotal },
  ];
  return (
    <section id="s-ba" aria-labelledby="h-ba" className="flex flex-col gap-[18px]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="h-ba" className="m-0 font-serif text-[34px] font-normal">
          Before / after
        </h2>
        <div role="group" aria-label="Compare" className="inline-flex rounded-[10px] border border-rule bg-paper p-[3px]">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setBa(id)}
              aria-pressed={ba === id}
              className={`min-h-10 cursor-pointer rounded-lg border-0 px-[14px] py-[6px] font-sans text-[14px] ${
                ba === id ? "bg-btn-bg text-btn-ink" : "bg-transparent text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
        {cols.map((col) => (
          <div
            key={col.id}
            className={`flex flex-col rounded-[14px] border bg-paper p-5 ${ba === col.id ? "border-ink" : "border-rule"}`}
            style={{ opacity: ba === "both" || ba === col.id ? 1 : 0.35 }}
          >
            <p className={`m-0 mb-3 font-mono text-[12px] tracking-[0.06em] ${col.id === "agent" ? "text-accent" : "text-muted"}`}>
              {col.title}
            </p>
            {col.steps.map((st, i) => (
              <div key={i} className="flex justify-between gap-3 border-t border-rule py-[10px] text-[15px]">
                <span>
                  <span className="font-mono text-[12px] text-muted">{`0${i + 1}`} </span>
                  {st.text}
                </span>
                <span className="whitespace-nowrap font-mono text-[12px] text-muted">{st.time}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-2 border-t border-ink pt-3 font-mono text-[13px]">
              <span>
                total{" "}
                <span className="ml-[6px] rounded-full border border-rule px-[6px] py-px text-[11px] text-muted">
                  business impact
                </span>
              </span>
              <span>{col.total}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
