"use client";

import Link from "next/link";
import type { Ref } from "react";
import type { ResultEvent } from "@/lib/fit-check/types";

export type ResultMeta = {
  evalPassRate: string;
  evalLastRun: string;
  evalRedTeamHeld: string;
  evalCaseCount: string;
  evalSet: { href: string; todo: string };
};

const cardLink =
  "mt-auto self-start rounded-md bg-accent-tint px-[10px] py-[6px] font-mono text-[12px] text-accent no-underline";

/** Result and bad-fit states (Hero.dc.html `isResult`). */
export function Result({
  result,
  bad,
  linkBranch,
  xray,
  meta,
  onAskGap,
  onAsk,
  onTalk,
  headingRef,
}: {
  result: ResultEvent;
  bad: boolean;
  linkBranch: boolean;
  xray: boolean;
  meta: ResultMeta;
  onAskGap: (i: number) => void;
  onAsk: () => void;
  onTalk: () => void;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  const { trace } = result;
  const matchCount = result.matches.length;
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="m-0 font-serif text-[40px] font-normal leading-[1.1] tracking-[-0.01em] outline-none"
        >
          {result.verdict}
        </h2>
        <p className="m-0 text-[16px] text-muted">{result.note}</p>
      </div>

      <div className="flex flex-col gap-3">
        <p className="m-0 font-mono text-[12px] uppercase tracking-[0.06em] text-accent">Where I fit · {matchCount}</p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[14px]">
          {result.matches.map((m) => (
            <article key={m.req} className="flex flex-col gap-[10px] rounded-xl border border-rule bg-paper p-[18px]">
              <h3 className="m-0 text-[17px] font-semibold leading-[1.35]">{m.req}</h3>
              <p className="m-0 text-[15px] leading-[1.5] text-muted">{m.evidence}</p>
              <Link href={m.href} className={cardLink}>
                {m.source} →
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <p className="m-0 font-mono text-[12px] uppercase tracking-[0.06em] text-amber-text">
          Where I don&apos;t (yet) · {result.gaps.length}
        </p>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-[14px]">
          {result.gaps.map((g, i) => (
            <article
              key={g.req}
              className="flex flex-col gap-[10px] rounded-xl border-[1.5px] border-dashed border-amber-border bg-amber-bg p-[18px]"
            >
              <h3 className="m-0 text-[17px] font-semibold leading-[1.35]">{g.req}</h3>
              <p className="m-0 text-[15px] leading-[1.5]">
                <span className="font-mono text-[12px] text-amber-text">CLOSEST </span>
                {g.closest}
              </p>
              {g.close && (
                <p className="m-0 text-[15px] leading-[1.5]">
                  <span className="font-mono text-[12px] text-amber-text">HOW I&apos;D CLOSE IT </span>
                  {g.close}
                </p>
              )}
              <button
                type="button"
                onClick={() => onAskGap(i)}
                className="mt-auto min-h-10 cursor-pointer self-start rounded-lg border border-amber-border bg-transparent px-3 py-[6px] font-mono text-[12px] text-amber-text"
              >
                Ask about this gap →
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-[6px] border-y border-rule py-3 font-mono text-[12px] text-muted">
        <span>
          <span className="text-ink">offline eval</span> · pass rate {meta.evalPassRate} · last run {meta.evalLastRun}
        </span>
        <span>
          <span className="text-ink">this run</span> · cost {trace ? `$${trace.costUsd.toFixed(4)}` : "[logged]"} ·{" "}
          {trace ? (trace.ms / 1000).toFixed(1) : "[logged]"} s
        </span>
        <a href={meta.evalSet.href} className="text-accent">
          eval set on GitHub{meta.evalSet.todo} →
        </a>
      </div>

      {xray && (
        <div className="flex flex-col gap-[10px] rounded-[10px] border border-dashed border-rule px-4 py-[14px] font-mono text-[12px] text-muted">
          <div className="flex flex-wrap gap-x-5 gap-y-[6px]">
            <span className="text-ink">THIS RUN · LIVE USAGE</span>
            <span>trace {trace?.runId ?? "[run id]"}</span>
            <span>sources cited: {matchCount}</span>
            <span>guardrails: 2/2 passed</span>
            <span>branch: {linkBranch ? "link → fetch_url" : "text → fetch skipped"}</span>
            <span>retries: {result.retries} of 1</span>
            <span>model {trace?.model ?? "[provider · model]"}</span>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-[6px]">
            <span className="text-ink">OFFLINE EVAL</span>
            <span>pass rate {meta.evalPassRate}</span>
            <span>red-team cases held {meta.evalRedTeamHeld}</span>
            <span>eval set: {meta.evalCaseCount} cases, public on GitHub</span>
          </div>
          <p className="m-0">Eval numbers and live-usage numbers are labelled and never combined.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <a
          href="#contact"
          onClick={onTalk}
          className="inline-flex min-h-12 items-center rounded-[10px] bg-btn-bg px-[22px] py-3 text-[16px] font-semibold text-btn-ink no-underline"
        >
          {bad ? "Talk to Aswin anyway" : "Talk to Aswin about this role"}
        </a>
        <button
          type="button"
          onClick={onAsk}
          className="min-h-12 cursor-pointer rounded-[10px] border border-rule bg-paper px-[18px] py-3 font-sans text-[15px] text-ink"
        >
          Ask my work <span className="font-mono text-[12px] text-muted">⌘K</span>
        </button>
        <a href="/resume.pdf" className="inline-flex min-h-12 items-center px-[6px] py-0 text-[15px] text-ink">
          Download resume
        </a>
      </div>
    </div>
  );
}
