"use client";

import Link from "next/link";
import { useState } from "react";
import { useSite } from "@/components/xray-provider";

/** Labels from HERO_SAMPLES, HERO_ATTACKS and HERO_DRILLS in Hero.dc.html. */
const SAMPLES = [
  { label: "Senior Platform PM", bad: false },
  { label: "AI product PM (agents)", bad: false },
  { label: "Healthcare integrations PM", bad: false },
  { label: "A bad fit, on purpose", bad: true },
];
const ATTACKS = ["prompt injection", "something he hasn't done", "conflicting info", "ambiguous ask"];
const DRILLS = ["knowledge base offline", "hit the rate limit"];
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

const label = "font-mono text-[12px] uppercase tracking-[0.06em] text-muted";

/**
 * Fit-check hero, empty state only (Milestone 2). The run, result, break, error and limited
 * states and the sample / attack / drill actions arrive in Milestone 4.
 */
export function Hero({ meta }: { meta: HowIBuiltMeta }) {
  const { xray } = useSite();
  const [jd, setJd] = useState("");
  const [howOpen, setHowOpen] = useState(false);
  const noJd = jd.trim() === "";
  const showHow = howOpen || xray;

  return (
    <section className="box-border w-full bg-bg px-6 pt-[72px] pb-16 font-sans text-ink">
      <div className="mx-auto flex max-w-[1040px] flex-col gap-7">
        <div className="flex flex-col gap-[18px]">
          <p className="m-0 font-mono text-[12px] uppercase tracking-[0.08em] text-muted">Aswin · Senior Product Manager</p>
          <h1 className="m-0 font-serif text-[clamp(42px,6vw,72px)] font-normal leading-[1.02] tracking-[-0.02em]">
            Platform PM who builds for agents.
          </h1>
          <p className="m-0 max-w-[640px] font-serif text-[22px] leading-[1.4] text-muted">
            Paste a job description. This site will tell you honestly where I fit and where I don&apos;t.
          </p>
        </div>

        <div className="flex flex-col gap-[14px] rounded-[14px] border border-rule bg-paper p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <label htmlFor="jd-input" className={label}>
              Job description
            </label>
            <span className="font-mono text-[12px] text-muted">text or a link · not stored</span>
          </div>
          <textarea
            id="jd-input"
            rows={5}
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the role, or a link to it…"
            className="box-border w-full resize-y border-0 bg-transparent font-sans text-[17px] leading-[1.5] text-ink outline-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-[14px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[14px] text-muted">No JD handy?</span>
              {SAMPLES.map((s) => (
                <button
                  key={s.label}
                  type="button"
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
            {ATTACKS.map((a) => (
              <button
                key={a}
                type="button"
                className="min-h-10 cursor-pointer rounded-lg border border-rule bg-transparent px-3 py-[6px] font-mono text-[13px] text-ink"
              >
                {a}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`min-w-[150px] ${label}`}>Failure drills</span>
            {DRILLS.map((d) => (
              <button
                key={d}
                type="button"
                className="min-h-10 cursor-pointer rounded-lg border border-dashed border-rule bg-transparent px-3 py-[6px] font-mono text-[13px] text-ink"
              >
                {d}
              </button>
            ))}
          </div>
        </div>

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
      </div>
    </section>
  );
}
