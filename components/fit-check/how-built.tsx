"use client";

import Link from "next/link";
import { useState } from "react";

const PIPELINE = [
  ["input", false],
  ["link? fetch_url", true],
  ["jd.parse", false],
  ["kb.search", false],
  ["evidence.map", false],
  ["guardrails", false],
  ["compose + cite", false],
] as const;

export type HowIBuiltMeta = {
  evalCaseCount: string;
  evalPassRate: string;
  evalFailedFirst: string;
  costPerRun: string;
  liveResponseTime: string;
  whatBreaksFirstAtScale: string;
  next: string;
};

/** "+ How I built this" (Hero.dc.html). Opens automatically in X-ray (SPEC §7). */
export function HowBuilt({ meta, xray }: { meta: HowIBuiltMeta; xray: boolean }) {
  const [howOpen, setHowOpen] = useState(false);
  const showHow = howOpen || xray;
  return (
    <div className="flex flex-col gap-4 border-t border-rule pt-4">
      <button
        type="button"
        onClick={() => setHowOpen(!howOpen)}
        aria-expanded={showHow}
        aria-controls="how-built"
        className="min-h-11 cursor-pointer self-start border-0 bg-transparent px-0 py-2 font-mono text-[13px] text-accent"
      >
        {showHow ? "− How I built this" : "+ How I built this"}
      </button>
      {/* Always in the HTML (hidden when closed) so check:content sees its placeholders. */}
      <div
        id="how-built"
        hidden={!showHow}
        className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[18px] font-mono text-[13px] leading-[1.6] text-ink"
      >
        <p className="col-span-full m-0 rounded-lg border border-rule bg-paper px-[14px] py-3 font-sans text-[15px] leading-[1.55]">
          <b className="font-semibold">Honest note:</b> the fit check is a fixed pipeline with one branch (link or text) and
          one retry. The model doesn&apos;t choose its tools here. For model-chosen tool calls, see the{" "}
          <Link href="/work/job-search-agent" className="text-accent">
            job-search agent
          </Link>
          .
        </p>
        <div className="flex flex-col gap-2">
          <p className="m-0 text-muted">ARCHITECTURE</p>
          <div className="flex flex-wrap items-center gap-[6px]">
            {PIPELINE.map(([p, branch], i) => (
              <span key={p} className="contents">
                <span className={`rounded-md bg-paper px-2 py-1 ${branch ? "border border-dashed border-accent" : "border border-rule"}`}>
                  {p}
                </span>
                {i < PIPELINE.length - 1 && <span className="text-muted">›</span>}
              </span>
            ))}
          </div>
          <p className="m-0 text-muted">
            One endpoint, one knowledge base, two prompts (fit check and Ask my work). Dashed box: the only branch.
          </p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <p className="m-0 text-muted">GUARDRAILS</p>
          <p className="m-0">› answers only from the knowledge base</p>
          <p className="m-0">› every claim links to a source</p>
          <p className="m-0">› gaps stated, score never inflated</p>
          <p className="m-0">› off-topic and prompt injection refused</p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <p className="m-0 text-muted">EVALS · COST</p>
          <p className="m-0">› {meta.evalCaseCount} test JDs, bad-fit and red-team cases, public on GitHub</p>
          <p className="m-0">
            › offline eval: pass rate {meta.evalPassRate} · failed first: {meta.evalFailedFirst}
          </p>
          <p className="m-0">
            › live usage: {meta.costPerRun} · {meta.liveResponseTime}, logged
          </p>
          <p className="m-0">› the steps on screen stream from the real run, never a script</p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <p className="m-0 text-muted">MEMORY · PRODUCTION</p>
          <p className="m-0">› session memory: role and gaps carry into Ask my work</p>
          <p className="m-0">› held for this session only; pasted JDs aren&apos;t stored</p>
          <p className="m-0">› per-visitor rate limit · monthly budget cap</p>
          <p className="m-0">› precomputed fallback if the AI or knowledge base is down</p>
          <p className="m-0">› limits: {meta.whatBreaksFirstAtScale}</p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <p className="m-0 text-muted">TRADE-OFFS · NEXT</p>
          <p className="m-0">› evidence cards over a % dial: slower to skim, easier to trust</p>
          <p className="m-0">› fixed pipeline over open tool choice: predictable and testable</p>
          <p className="m-0">› next: {meta.next}</p>
        </div>
      </div>
    </div>
  );
}
