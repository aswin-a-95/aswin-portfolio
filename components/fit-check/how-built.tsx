import Link from "next/link";
import { XrayPanel } from "@/components/xray-panel";

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

/**
 * "How I built this" (Hero.dc.html `showHow`, design update 3): no toggle, X-ray only, as an
 * X-ray panel. Always in the HTML (`.xray-only`) so check:content sees its placeholders and a
 * reload in X-ray shows it without a flash. The design's `minmax(300px, 1fr)` is capped at the
 * panel's width (`min(300px, 100%)`): inside the panel's 20px padding a 390px phone has < 300px.
 */
export function HowBuilt({ meta }: { meta: HowIBuiltMeta }) {
  return (
    // .xray-only reverts to display: block, so it sits on the wrapper and the panel keeps its grid.
    <div className="xray-only">
      <XrayPanel
        id="how-built"
        className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-[18px] rounded-[14px] p-5 font-mono text-[13px] leading-[1.6]"
      >
        <h3 className="col-span-full m-0 font-sans text-[22px] font-semibold leading-[1.3] text-xr-ink">How I built this</h3>
        <p className="col-span-full m-0 rounded-lg border border-xr-rule bg-xr-paper px-[14px] py-3 font-sans text-[15px] leading-[1.55]">
          <b className="font-semibold">Honest note:</b> the fit check is a fixed pipeline with one branch (link or text) and
          one retry. The model doesn&apos;t choose its tools here. For model-chosen tool calls, see the{" "}
          <Link href="/work/job-search-agent" className="text-xr-accent">
            job-search agent
          </Link>
          .
        </p>
        <div className="flex flex-col gap-2">
          <p className="m-0 text-xr-muted">ARCHITECTURE</p>
          <div className="flex flex-wrap items-center gap-[6px]">
            {PIPELINE.map(([p, branch], i) => (
              <span key={p} className="contents">
                <span className={`rounded-md bg-xr-paper px-2 py-1 ${branch ? "border border-dashed border-xr-accent" : "border border-xr-rule"}`}>
                  {p}
                </span>
                {i < PIPELINE.length - 1 && <span className="text-xr-muted">›</span>}
              </span>
            ))}
          </div>
          <p className="m-0 text-xr-muted">
            One endpoint, one knowledge base, two prompts (fit check and Ask my work). Dashed box: the only branch.
          </p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <p className="m-0 text-xr-muted">GUARDRAILS</p>
          <p className="m-0">› answers only from the knowledge base</p>
          <p className="m-0">› every claim links to a source</p>
          <p className="m-0">› gaps stated, score never inflated</p>
          <p className="m-0">› off-topic and prompt injection refused</p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <p className="m-0 text-xr-muted">EVALS · COST</p>
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
          <p className="m-0 text-xr-muted">MEMORY · PRODUCTION</p>
          <p className="m-0">› session memory: role and gaps carry into Ask my work</p>
          <p className="m-0">› held for this session only; pasted JDs aren&apos;t stored</p>
          <p className="m-0">› per-visitor rate limit · monthly budget cap</p>
          <p className="m-0">› precomputed fallback if the AI or knowledge base is down</p>
          <p className="m-0">› limits: {meta.whatBreaksFirstAtScale}</p>
        </div>
        <div className="flex flex-col gap-[6px]">
          <p className="m-0 text-xr-muted">TRADE-OFFS · NEXT</p>
          <p className="m-0">› evidence cards over a % dial: slower to skim, easier to trust</p>
          <p className="m-0">› fixed pipeline over open tool choice: predictable and testable</p>
          <p className="m-0">› next: {meta.next}</p>
        </div>
      </XrayPanel>
    </div>
  );
}
