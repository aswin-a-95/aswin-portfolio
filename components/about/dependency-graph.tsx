"use client";

import { useState } from "react";
import type { Dep, GraphProject } from "@/content/career-graph";

export function DependencyGraph({ deps, projects }: { deps: Dep[]; projects: GraphProject[] }) {
  const [sel, setSel] = useState(projects[0].id);
  const proj = projects.find((p) => p.id === sel) ?? projects[0];
  const used = proj.edges.map((e) => e[0]);
  const depLabel = (id: string) => deps.find((d) => d.id === id)?.label;

  return (
    <>
      <div className="flex flex-wrap items-stretch gap-x-10 gap-y-5">
        <div className="flex flex-[1_1_320px] flex-col gap-[10px]">
          <p className="m-0 font-mono text-[11px] tracking-[0.06em] text-muted">BEFORE AI · DEPENDENCIES</p>
          {deps.map((d) => {
            const on = used.includes(d.id);
            return (
              <div
                key={d.id}
                className={`flex flex-col gap-1 rounded-[10px] border px-4 py-[14px] ${on ? "border-accent bg-accent-tint" : "border-rule bg-paper"}`}
                style={{ opacity: on ? 1 : 0.55 }}
              >
                <span className="text-[16px] font-semibold">{d.label}</span>
                <span className="font-mono text-[12px] text-muted">{d.meta}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-[0_1_120px] flex-col items-center justify-center gap-2 font-mono text-[12px] text-muted">
          <span aria-hidden="true" className="text-[28px] text-accent">
            →
          </span>
          <span>feeds into</span>
        </div>
        <div className="flex flex-[1_1_320px] flex-col gap-[10px]">
          <p className="m-0 font-mono text-[11px] tracking-[0.06em] text-muted">AGENT PROJECTS</p>
          {projects.map((p) => {
            const on = p.id === sel;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSel(p.id)}
                aria-pressed={on}
                className={`flex cursor-pointer flex-col items-start gap-1 rounded-[10px] px-4 py-[14px] text-left font-sans text-ink ${
                  on ? "border-[1.5px] border-ink bg-paper" : "border border-rule bg-transparent"
                }`}
              >
                <span className="text-[16px] font-semibold">{p.label}</span>
                <span className="font-mono text-[12px] text-muted">{p.meta}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div role="status" aria-live="polite" className="flex flex-col gap-2 rounded-xl border border-dashed border-rule bg-paper px-5 py-[18px]">
        <p className="m-0 font-mono text-[12px] text-accent">{proj.label.toUpperCase()} DEPENDS ON</p>
        {proj.edges.map(([from, why]) => (
          <p key={from} className="m-0 font-mono text-[13px] leading-[1.6]">
            <span className="text-muted">← {depLabel(from)}: </span>
            {why}
          </p>
        ))}
      </div>
    </>
  );
}
