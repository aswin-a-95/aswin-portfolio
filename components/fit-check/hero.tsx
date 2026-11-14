"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BreakPanel, resetButton, type BreakEntry } from "@/components/fit-check/break-panel";
import { Fallback } from "@/components/fit-check/fallback";
import { FitInput } from "@/components/fit-check/fit-input";
import { HowBuilt, type HowIBuiltMeta } from "@/components/fit-check/how-built";
import { Result, type ResultMeta } from "@/components/fit-check/result";
import { useSite } from "@/components/xray-provider";
import { ASK_BUDGET, ASK_ERROR, ASK_LIMITED } from "@/lib/ask/copy";
import { sessionMemory } from "@/lib/ask/session-memory";
import { breakAttempt, runFitCheck } from "@/lib/fit-check/client";
import {
  BREAK_LOG_MAX,
  breakVerdict,
  HERO_SAMPLES,
  isLink,
  isStrongFit,
  NUDGE,
  PASTED_ROLE,
  SKIPPED_FETCH,
  STEP_COPY,
} from "@/lib/fit-check/copy";
import { rolePrefill } from "@/lib/fit-check/role-prefill";
import { FitEventSchema, type Drill, type FallbackEvent, type ResultEvent, type StepEvent } from "@/lib/fit-check/types";

export type { HowIBuiltMeta };

type Phase = "empty" | "running" | "result" | "badfit" | "break" | "error" | "limited" | "budget";

const statusLabel = "m-0 font-mono text-[12px] uppercase tracking-[0.06em] text-muted";

/**
 * The fit-check hero (Hero.dc.html, all 7 states in HeroStates.dc.html). Every state change
 * comes from the run's event stream (SPEC §7): `step` rows while running, then `result` or
 * `fallback`. Nothing here is timed or scripted.
 */
export function Hero({ meta, resultMeta }: { meta: HowIBuiltMeta; resultMeta: ResultMeta }) {
  const { xray, setXray, openAsk } = useSite();

  const [phase, setPhase] = useState<Phase>("empty");
  const [jd, setJd] = useState("");
  const [role, setRole] = useState("");
  const [drill, setDrill] = useState<Drill | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [steps, setSteps] = useState<StepEvent[]>([]);
  const [result, setResult] = useState<ResultEvent | null>(null);
  const [fallback, setFallback] = useState<FallbackEvent | null>(null);
  const [log, setLog] = useState<BreakEntry[]>([]);
  const [pending, setPending] = useState(0);
  const [breakError, setBreakError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const entryId = useRef(0);
  useEffect(() => () => abortRef.current?.abort(), []);

  // Focus target of the current state. When the control that started a change unmounts
  // (a sample chip, "Try another role"), focus moves here instead of being lost.
  const focusRef = useRef<HTMLElement | null>(null);
  const setFocusTarget = useCallback((el: HTMLElement | null) => {
    focusRef.current = el;
  }, []);
  useEffect(() => {
    const active = document.activeElement;
    if (!active || active === document.body) focusRef.current?.focus({ preventScroll: true });
  }, [phase]);

  const run = useCallback(async (text: string, runRole: string, runDrill: Drill | null = null) => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setJd(text);
    setRole(runRole);
    setDrill(runDrill);
    setRunId(null);
    setSteps([]);
    setResult(null);
    setFallback(null);
    setPhase("running");

    const setFallbackState = (ev: FallbackEvent) => {
      setFallback(ev);
      setPhase(ev.reason);
    };
    const fail = () => setFallbackState({ type: "fallback", reason: "error" });
    try {
      for await (const raw of runFitCheck({ jd: text, drill: runDrill ?? undefined }, ac.signal)) {
        if (ac.signal.aborted) return;
        const parsed = FitEventSchema.safeParse(raw);
        if (!parsed.success) return fail();
        const ev = parsed.data;
        if (ev.type === "start") setRunId(ev.runId);
        else if (ev.type === "step") {
          setSteps((prev) => {
            const i = prev.findIndex((s) => s.tool === ev.tool);
            return i === -1 ? [...prev, ev] : prev.map((s, j) => (j === i ? ev : s));
          });
        } else if (ev.type === "result") {
          const finalRole = ev.role ?? runRole;
          setRole(finalRole);
          setResult(ev);
          setPhase(isStrongFit(ev.matches.length, ev.gaps.length) ? "result" : "badfit");
          // Session memory for Ask my work (SPEC §5): role, match count and gaps only.
          sessionMemory.set({
            role: finalRole,
            matchCount: ev.matches.length,
            gaps: ev.gaps.map(({ req, closest, close }) => ({ req, closest, close })),
          });
          return;
        } else {
          setFallbackState(ev);
          return;
        }
      }
      // The stream ended without a result or fallback.
      if (!ac.signal.aborted) fail();
    } catch {
      if (!ac.signal.aborted) fail();
    }
  }, []);

  const reset = () => {
    abortRef.current?.abort();
    setPhase("empty");
    setJd("");
    setDrill(null);
    setSteps([]);
  };

  const attack = async (text: string) => {
    abortRef.current?.abort();
    setPhase("break");
    setPending((n) => n + 1);
    setBreakError(null);
    const r = await breakAttempt(text);
    setPending((n) => n - 1);
    // A failed or rate-limited attempt isn't logged or counted; Ask's line says why (SPEC §8).
    if (r.status !== "ok") {
      setBreakError(r.status === "limited" ? ASK_LIMITED : r.status === "budget" ? ASK_BUDGET : ASK_ERROR);
      return;
    }
    const [verdict, tone] = breakVerdict(r.reply.kind);
    const entry: BreakEntry = {
      id: ++entryId.current,
      text,
      verdict,
      tone,
      reply: r.reply.text,
      guard: r.reply.guard,
      trace: r.reply.trace,
    };
    setLog((prev) => [entry, ...prev].slice(0, BREAK_LOG_MAX));
  };

  const talk = () => rolePrefill.send(role);
  const isResult = (phase === "result" || phase === "badfit") && result !== null;
  const showFallback = (phase === "error" || phase === "limited" || phase === "budget") && fallback !== null;
  const linkRun = isLink(jd);

  let nudge = "";
  if (isResult) nudge = NUDGE.result;
  else if (phase === "break" && log.length) nudge = NUDGE.break;
  else if (showFallback && drill) nudge = NUDGE.drill;

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

        {phase === "empty" && (
          <FitInput
            jd={jd}
            onJd={setJd}
            onCheck={() => {
              if (jd.trim()) run(jd, PASTED_ROLE);
            }}
            onSample={(s) => run(s.jd, s.role)}
            onAttack={attack}
            onDrill={(d) => run(HERO_SAMPLES[0].jd, HERO_SAMPLES[0].role, d)}
            inputRef={setFocusTarget}
          />
        )}

        {phase === "break" && (
          <BreakPanel
            log={log}
            pending={pending > 0}
            error={breakError}
            xray={xray}
            evalSet={resultMeta.evalSet}
            onAttack={attack}
            onReset={reset}
            headingRef={setFocusTarget}
          />
        )}

        {phase !== "empty" && phase !== "break" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-rule bg-paper px-[18px] py-[14px]">
            <p className="m-0 text-[15px]">
              <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-muted">
                {drill ? "Drill running against" : "Checking against"}{" "}
              </span>
              <b className="font-semibold">{role}</b>
            </p>
            <button type="button" onClick={reset} className={resetButton}>
              {drill ? "Back to the fit check" : "Try another role"}
            </button>
          </div>
        )}

        {phase === "running" && !drill && (
          <div
            ref={setFocusTarget}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            className="flex flex-col gap-3 rounded-[14px] border border-rule bg-paper px-[22px] py-5 outline-none"
          >
            <div className="flex flex-wrap justify-between gap-3">
              <p className={statusLabel}>Agent · streaming from the live run</p>
              {xray && <p className="m-0 font-mono text-[12px] text-muted">trace {runId ?? "[run id]"} · logged</p>}
            </div>
            {steps.map((st) => {
              const done = st.status !== "running";
              const skipped = st.status === "skipped";
              const copy = st.tool === "fetch_url" && !linkRun ? SKIPPED_FETCH : STEP_COPY[st.tool];
              const status = !done
                ? "running…"
                : xray && !skipped
                  ? `${st.detail ?? ""} · ${st.ms !== undefined ? `${st.ms} ms` : "[ms]"}`
                  : (st.detail ?? "");
              const statusColor = done && !skipped ? "text-accent" : "text-muted";
              return (
                <div key={st.tool} className="flex flex-wrap justify-between gap-4 font-mono text-[14px] leading-[1.5]">
                  <span className={skipped ? "text-muted" : "text-ink"}>
                    <span className={statusColor}>{skipped ? "–" : done ? "✓" : "›"} </span>
                    {xray ? copy.xr : `${st.tool} · ${copy.label}`}
                  </span>
                  <span className={statusColor}>{status}</span>
                </div>
              );
            })}
          </div>
        )}

        {isResult && (
          <Result
            result={result}
            bad={phase === "badfit"}
            linkBranch={linkRun}
            xray={xray}
            meta={resultMeta}
            onAskGap={(i) => openAsk(i)}
            onAsk={() => openAsk()}
            onTalk={talk}
            headingRef={setFocusTarget}
          />
        )}

        {showFallback && (
          <Fallback
            event={fallback}
            xray={xray}
            onRetry={() => run(jd, role)}
            onTalk={talk}
            headingRef={setFocusTarget}
          />
        )}

        {!xray && nudge && (
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-[10px] border border-dashed border-accent bg-accent-tint px-[14px] py-[10px]">
            <span className="text-[15px]">{nudge}</span>
            <button
              type="button"
              onClick={() => setXray(true)}
              className="min-h-10 cursor-pointer rounded-lg border border-accent bg-transparent px-3 py-[6px] font-mono text-[13px] text-accent"
            >
              Turn on X-ray →
            </button>
          </div>
        )}

        <HowBuilt meta={meta} xray={xray} />
      </div>
    </section>
  );
}
