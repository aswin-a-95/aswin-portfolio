/**
 * Cloudflare Turnstile, invisible (SPEC §2, §10). The widget is rendered once, off-screen, in
 * "execute" mode; each /api/run request runs it for a fresh single-use token. There is no UI.
 *
 * Without NEXT_PUBLIC_TURNSTILE_SITE_KEY (e2e under AI_FAKE) it returns an empty token, which the
 * server accepts only under AI_FAKE.
 */

type Turnstile = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: Turnstile;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TOKEN_TIMEOUT_MS = 15_000;

let loading: Promise<Turnstile> | null = null;
let widgetId: string | null = null;
let pending: { resolve: (t: string) => void; reject: (e: Error) => void } | null = null;
let queue: Promise<unknown> = Promise.resolve();

function load(): Promise<Turnstile> {
  loading ??= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve(window.turnstile);
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("turnstile missing")));
    s.onerror = () => {
      loading = null;
      reject(new Error("turnstile failed to load"));
    };
    document.head.appendChild(s);
  });
  return loading;
}

function container(): HTMLElement {
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = "position:fixed;width:0;height:0;overflow:hidden;left:-9999px;top:0";
  document.body.appendChild(el);
  return el;
}

async function token(): Promise<string> {
  const ts = await load();
  if (widgetId === null) {
    widgetId = ts.render(container(), {
      sitekey: SITE_KEY,
      execution: "execute",
      appearance: "interaction-only",
      callback: (t: string) => pending?.resolve(t),
      "error-callback": () => pending?.reject(new Error("turnstile error")),
      "expired-callback": () => widgetId !== null && ts.reset(widgetId),
    });
  } else {
    ts.reset(widgetId);
  }
  const id = widgetId;
  return new Promise<string>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("turnstile timeout")), TOKEN_TIMEOUT_MS);
    pending = {
      resolve: (v) => (clearTimeout(t), (pending = null), resolve(v)),
      reject: (e) => (clearTimeout(t), (pending = null), reject(e)),
    };
    ts.execute(id);
  });
}

/** A fresh token for one request. Calls are serialised: one widget, one challenge at a time. */
export function turnstileToken(): Promise<string> {
  if (!SITE_KEY) return Promise.resolve("");
  const next = queue.then(token, token);
  queue = next.catch(() => undefined);
  return next;
}
