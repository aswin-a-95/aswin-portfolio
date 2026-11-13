"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AskAnswerView } from "@/components/ask/ask-answer";
import { AskStart } from "@/components/ask/ask-start";
import { ask } from "@/lib/ask/client";
import { askPageFor, CTX_QUESTION, gapQuestion } from "@/lib/ask/copy";
import { sessionMemory } from "@/lib/ask/session-memory";
import { ASK_MAX_CHARS, type AskResult } from "@/lib/ask/types";

/** Which session-memory question to open on: a gap index, or "q" for "What should I ask him…". */
export type AskFocus = number | "q";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

type Asked = { question: string; result: AskResult | null };

/** "Ask my work" command bar (Ask.dc.html); a bottom sheet at ≤ 640 px (MobileAsk.dc.html), via the [@media(max-width:640px)] classes. */
export function AskDialog({ focus, onClose }: { focus?: AskFocus; onClose: () => void }) {
  const page = askPageFor(usePathname());
  const memory = useSyncExternalStore(sessionMemory.subscribe, sessionMemory.get, () => null);
  const [query, setQuery] = useState("");
  const [asked, setAsked] = useState<Asked | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  const submitQuestion = useCallback((question: string) => {
    const id = ++requestId.current;
    setAsked({ question, result: null });
    setQuery("");
    inputRef.current?.focus();
    ask({ question, memory: sessionMemory.get() })
      .catch((): AskResult => ({ status: "error" }))
      .then((result) => {
        // Ignore answers to a question that was replaced, or a dialog that closed.
        if (id === requestId.current) setAsked({ question, result });
      });
  }, []);

  // Modal: the rest of the page is inert and doesn't scroll; focus returns to the trigger on close.
  useEffect(() => {
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const root = dialogRef.current?.closest("[data-ask-root]");
    const made: Element[] = [];
    for (const el of Array.from(document.body.children)) {
      if (el !== root && !el.hasAttribute("inert")) {
        el.setAttribute("inert", "");
        made.push(el);
      }
    }
    const html = document.documentElement;
    const overflow = html.style.overflow;
    html.style.overflow = "hidden";
    inputRef.current?.focus();
    const ids = requestId;
    return () => {
      ids.current++;
      made.forEach((el) => el.removeAttribute("inert"));
      html.style.overflow = overflow;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  // Opened on a session-memory question (the hero's gap cards, Milestone 4).
  useEffect(() => {
    if (focus === undefined) return;
    const m = sessionMemory.get();
    if (!m) return;
    const q = focus === "q" ? CTX_QUESTION : m.gaps[focus] && gapQuestion(m.gaps[focus].req);
    // Starts a request, which sets state when it resolves; runs once on open.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (q) submitQuestion(q);
  }, [focus, submitQuestion]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q || (asked && !asked.result)) return;
    submitQuestion(q);
  };

  const again = () => {
    requestId.current++;
    setAsked(null);
    inputRef.current?.focus();
  };

  const forget = () => {
    sessionMemory.clear();
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const waiting = asked !== null && asked.result === null;

  return createPortal(
    <div
      data-ask-root=""
      onKeyDown={onKeyDown}
      // The scrim doesn't close the dialog (only Esc and ✕ do); keep focus where it was.
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      className={"fixed inset-0 z-50 box-border flex items-start justify-center overflow-y-auto bg-scrim px-5 pt-[10vh] pb-5 font-sans text-ink [@media(max-width:640px)]:px-0 [@media(max-width:640px)]:pt-0 [@media(max-width:640px)]:pb-0"}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Ask my work"
        className={"box-border flex w-full max-w-[680px] flex-col overflow-hidden rounded-[14px] border border-rule bg-paper shadow-ask [@media(max-width:640px)]:mt-auto [@media(max-width:640px)]:max-w-full [@media(max-width:640px)]:rounded-[18px_18px_0_0]"}
      >
        <form onSubmit={onSubmit} className="flex items-center gap-[10px] border-b border-rule px-[14px] py-3">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-muted"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={ASK_MAX_CHARS}
            aria-label="Ask a question about Aswin's work"
            placeholder="Ask about Aswin's work, or jump to a page…"
            className="min-h-11 min-w-0 flex-1 border-0 bg-transparent font-sans text-[17px] text-ink outline-none"
          />
          <button
            type="submit"
            disabled={waiting}
            className="min-h-10 cursor-pointer rounded-[8px] border-0 bg-btn-bg px-[14px] py-[6px] font-sans text-[14px] font-semibold text-btn-ink disabled:cursor-default"
          >
            Ask
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent text-muted"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </form>
        {asked ? (
          <AskAnswerView question={asked.question} result={asked.result} onAgain={again} onNavigate={onClose} />
        ) : (
          <AskStart page={page} memory={memory} onAsk={submitQuestion} onForget={forget} onNavigate={onClose} />
        )}
      </div>
    </div>,
    document.body,
  );
}
