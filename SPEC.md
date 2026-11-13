# Portfolio Website — v1 Build Spec

Owner: Aswin (Senior Product Manager · platform, APIs, integrations; builds AI agents)
Scope: **v1 only.** No vector database, no embeddings.

> **The design in `/design` is the final, approved source of truth for what the site looks like, says and does.** This spec translates it into a build: routes, backend, data and limits. Where this spec is silent, the design decides. Where they seem to conflict, stop and ask Aswin (see CLAUDE.md).

---

## 1. The design files

`/design` holds the 10 finalised artboards exported from Claude Design ("Aswin — Portfolio Website Design & Prototype"). Each `.dc.html` is a self-contained prototype: markup with inline styles, `{{bindings}}`, `<sc-if>` / `<sc-for>` / `<dc-import>` and a `<script type="text/x-dc">` block holding state, sample data and interaction logic.

| Artboard | What it is | Becomes |
| --- | --- | --- |
| `Main.dc.html` | Home page, 1440 wide | `/` |
| `Hero.dc.html` | Fit-check hero component (all logic + copy) | `components/fit-check/*` |
| `HeroStates.dc.html` | The hero's 7 states side by side: empty, running, result, badfit, break, error, limited | Acceptance reference for the hero |
| `Nav.dc.html` | Header with Work / Build log / About, X-ray toggle, Ask my work ⌘K | `components/nav.tsx` |
| `Ask.dc.html` | "Ask my work" command bar (desktop modal; `sheet` prop = mobile bottom sheet) | `components/ask/*` |
| `Work.dc.html` | CloudEagle case study, the PRD template for all case studies | `/work/[slug]` |
| `BuildLog.dc.html` | Build log index with category filters | `/log` |
| `About.dc.html` | About: intro, resume card, career dependency graph, roles, certificates | `/about` |
| `Mobile.dc.html` | Home at 390 px (recruiter arriving from LinkedIn) | Responsive behaviour of `/` |
| `MobileAsk.dc.html` | Ask my work as a phone bottom sheet | Responsive behaviour of Ask |
| `canvas.json` | Artboard titles, sizes and order | Reference only |

How to read them:
- **Copy is final.** Every heading, label, button, helper line, empty state and error message is used word for word.
- **Visual values are final.** Colours, fonts, sizes, weights, spacing, radii, borders and breakpoints come from the inline styles. Don't round them or swap in framework defaults.
- **Interactions are final.** Every state, toggle, filter, hover/focus style and transition in the `<script>` blocks is required behaviour.
- **Prototype mocks become real.** The scripts fake the backend: `setInterval` step animation, regex classifiers (`heroClassify`, `askRoute`, `workClassify`), and hard-coded results (`HERO_FIT`, `HERO_BAD`, `ASK_ANSWERS`). In the build these come from the real AI pipeline (§6–8). The sample data shows the exact **shape and tone** the real output must have.
- **`[bracketed text]` is a placeholder for Aswin's real content** (e.g. `[N] years`, `[measured]`, `[link]`, `[date]`). It must come from `/content` files, never be invented, and never ship to production as a literal bracket (see §12).
- `support.js`, `DCLogic`, `x-dc` etc. are the prototype runtime. Don't import them; rebuild in React.

## 2. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React, TypeScript strict, Server Components by default |
| Package manager | pnpm |
| Styling | Tailwind CSS with the design tokens in §3 as the theme. No component library unless it can match the design exactly |
| Fonts | `next/font/google`: Newsreader (400, 500, 400 italic; opsz 6–72), IBM Plex Sans (400, 500, 600), IBM Plex Mono (400, 500) |
| Content | MDX + typed TS data files in `/content` |
| LLM | Anthropic Claude via Vercel AI SDK (`ai` + `@ai-sdk/anthropic`); model IDs from env |
| Validation | Zod |
| Rate limit + budget | Upstash Redis + `@upstash/ratelimit` |
| Bot protection | Cloudflare Turnstile (invisible) |
| Logging | Supabase Postgres (run metrics only, no visitor text) |
| Email (contact form) | Resend |
| Analytics | PostHog (cookieless) |
| Tests | Vitest, Playwright, Promptfoo |
| Hosting | Vercel + GitHub Actions |

Check the current docs for each library before using its API.

## 3. Design tokens (from the artboards, exact)

Two themes. **Light** is the default. **X-ray** is the dark theme that turns on with the X-ray toggle.

| Token | Light | X-ray |
| --- | --- | --- |
| `bg` | `#F6F3EC` | `#101214` |
| `paper` | `#FFFDF8` | `#171A1D` |
| `ink` | `#1B1A17` | `#E9E6DF` |
| `muted` | `#5C574E` | `#A3A9B0` |
| `rule` | `#E2DCD0` | `#2B3036` |
| `accent` | `#1F4C86` | `#8DBBF2` |
| `accentTint` | `#E8EEF6` | `#17283D` |
| `amberText` | `#8A5510` | `#EDB65E` |
| `amberBorder` | `#C08A2E` | `#B8862F` |
| `amberBg` | `#FBF2E2` | `#241C10` |
| `btnBg` | `#1B1A17` | `#E9E6DF` |
| `btnInk` | `#FFFDF8` | `#101214` |

Also: focus ring `2px solid #4F7FC0`, offset 2px; Ask scrim `rgba(27,26,23,0.38)` light / `rgba(0,0,0,0.6)` X-ray; Ask shadow `0 24px 60px rgba(20,18,15,0.22)`.
Font roles: `serif` = Newsreader (headlines, ledes), `sans` = IBM Plex Sans (body, buttons), `mono` = IBM Plex Mono (labels, metadata, traces).
Implement as CSS variables switched by a `data-theme="xray"` attribute on `<html>`, so every component reads tokens and never hard-codes hex.

Global rules seen in every artboard: touch targets ≥ 44 px, `prefers-reduced-motion` disables transitions, smooth scroll on the case study, `a:hover{opacity:0.82}`.

## 4. Routes

| Route | Source | Notes |
| --- | --- | --- |
| `/` | `Main.dc.html` + `Hero.dc.html`, mobile per `Mobile.dc.html` | Sections in order: Nav, X-ray intro banner, fit-check hero, Under the hood, Before / after AI, Work, From the build log, Contact, footer, Ask overlay |
| `/work/[slug]` | `Work.dc.html` | Same PRD template for all case studies: `cloudeagle`, `job-search-agent`, `dhees-instagram-agent`, `platform-api-work` |
| `/work` | Not designed | **Gap:** default to the Work section of `Main.dc.html` (heading "Proof, one click away." + the 4 cards) as a standalone page with Nav and footer. Flag it to Aswin |
| `/log` | `BuildLog.dc.html` | Filters: All, Build notes, Teardowns, Essays, TIL, with counts |
| `/log/[slug]` | Not designed | **Gap:** simple article page in the build-log type styles (serif title, mono meta line, 880 px column). Flag it to Aswin |
| `/about` | `About.dc.html` | |
| `/api/run` | §6–8 | The single AI endpoint ("one endpoint, one knowledge base, two prompts") |
| `/api/contact` | §9 | |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/rss.xml` | §11 | |

## 5. Global behaviour

**X-ray mode** (`Nav.dc.html`, `Main.dc.html`)
- The toggle in Nav switches the whole site to the X-ray theme and reveals the X-ray-only blocks (traces, guardrail names, eval/cost details, logged trace panels) on every page.
- It persists across page navigation and reloads within the session (sessionStorage), and can be set by `?xray=1`.
- Intro banner on home: "New here? Try X-ray." with "Turn on X-ray" and "Got it". Shown until dismissed or X-ray is turned on; the Nav shows a "NEW" pill while the banner is showing. Remember dismissal in localStorage.
- "Under the hood" cards marked "live here" turn X-ray on and scroll to the hero (`#top`).
- Footer line on every page: "This site is an AI product. Turn on X-ray to see how it works."

**Ask my work** (`Ask.dc.html`, `MobileAsk.dc.html`)
- Opens from the Nav button, the hero's "Ask my work" button, gap cards, and the keyboard shortcut ⌘K / Ctrl+K. Esc closes it. Focus is trapped while open and returns to the trigger on close.
- Desktop: centred modal, max-width 680, top padding 10vh. ≤ 640 px: bottom sheet (`sheet` mode), radius 18 18 0 0.
- Suggested questions change by page (`ASK_BY_PAGE`: home, work, log, about). The question texts in `ASK_ANSWERS` are the exact suggested-question copy.
- "Break my AI" chips and "Jump to" links as designed.
- **Session memory:** after a fit check, its context (role, match count, gaps) is carried into Ask and shown in the "CONTINUING FROM YOUR FIT CHECK · SESSION MEMORY" box with "Forget this". It lives in sessionStorage only and is sent with Ask requests. Nothing is stored server-side.

**Contact pre-fill:** "Talk to Aswin about this role" in the hero scrolls to `#contact` and pre-fills the Role field, showing "pre-filled from your fit check".

## 6. Knowledge base (no vector DB)

Everything the AI may say comes from typed content in `/content/kb/`:

```
/content/kb/
  roles.ts          # { id, title, company, years, summary, href }[]
  projects.ts       # { id, title, status, summary, evidence[], href }[]
  not-done.ts       # { id, topic, closest?, note }[]  ← things Aswin has NOT done
  facts.ts          # canonical bio facts used in answers
  fallback.ts       # the 3 precomputed role-type matches (HERO_FALLBACK shape)
```

- Each entry has a stable `id`, a human `label` for source chips (e.g. "Case study · CloudEagle concept", "Role · About") and an `href`.
- **`kb.search`** is a deterministic server function, not the model: it scores entries by keyword/tag overlap with the requirements and returns the top entries from the scopes `roles`, `projects`, `not_done`. No embeddings.
- `kb.search` reads from a build-time JSON snapshot. Keep a last-good copy for the fallback drill.

## 7. Fit check — `/api/run` with `mode: "fit"`

The design's honest note is a requirement: **"the fit check is a fixed pipeline with one branch (link or text) and one retry. The model doesn't choose its tools here."**

**Pipeline (stream every step to the UI as it happens, in this order and with these exact tool names):**

| # | Tool | What runs | UI label (normal / X-ray) |
| --- | --- | --- | --- |
| 1 | `fetch_url` | Only if the input starts with `http(s)://`: server-side fetch with timeout, HTML → text. Otherwise skipped | "Fetching the job post" / "skipped: text was pasted" · X-ray: `fetch_url(url) → page text` / `branch: input is text → skip fetch_url` |
| 2 | `jd.parse` | LLM (`FIT_CHECK_MODEL`), structured output: `requirements: string[]` (≤ 8) | "Reading the job description" · `jd.parse(text) → requirements[]` |
| 3 | `kb.search` | Deterministic search (§6) | "Searching roles, projects and the not-done list" · `kb.search(scope=["roles","projects","not_done"])` |
| 4 | `evidence.map` | LLM, structured output: for each requirement either a match `{req, evidence, sourceId}` or a gap `{req, closest, close}` | "Matching each requirement to evidence" · `evidence.map(requirements, sources)` |
| 5 | `guard.citations` | Deterministic: every match cites a KB `sourceId` that exists; otherwise it becomes a gap | "Every claim cites a source" · `guard.citations(cards)` |
| 6 | `guard.honesty` | Deterministic: verdict counts match the cards, no percentages or scores, not-done topics never appear as matches | "Gaps stated, score not inflated" · `guard.honesty(verdict, gaps)` |
| 7 | `verdict.compose` | Deterministic template: "Strong on {m} of {n} requirements." when m/n ≥ 0.5, else "Not a strong fit: {m} of {n} requirements." Note line as in the design | "Writing the verdict" · `verdict.compose(cards)` |

- **Transport:** NDJSON or SSE events: an optional `{type:"start", runId}`, then `{type:"step", tool, status, detail, ms}` (`status`: `running` | `done` | `skipped`), then exactly one terminal event: `{type:"result", …}` or `{type:"fallback", reason, drill?, runId?, trace?}`. `reason` is `error` (the error state) or `limited` (the rate-limited state). `trace` is the X-ray fallback trace (`HERO_DRILL_TRACE` shape: `[{mark, text, bad, timed, ms?}]`). The running state in the design ("Agent · streaming from the live run") must reflect these real events, never a timer. Zod schemas: `lib/fit-check/types.ts`.
- **Retry:** one retry on a failed LLM or `kb.search` call. If `kb.search` still fails, `guard.no_sources` stops the run and the UI shows the fallback state ("The knowledge base didn't answer, so the AI won't guess.").
- **Result shape** = `HERO_FIT` / `HERO_BAD` in `Hero.dc.html`: `verdict`, `note`, `matches[{req, evidence, source, href}]`, `gaps[{req, closest, close}]`, plus `role` (a short role title that `jd.parse` extracts; the hero shows it, stores it in session memory and pre-fills Contact with it), `retries` (0 or 1) and `trace {runId, costUsd, ms, model}`. Not-done gaps use "Not something Aswin has done." and leave `close` empty.
- **Samples:** the 4 sample chips (3 fits + "A bad fit, on purpose") send their JD text from the design through the real pipeline.
- **Result footer:** offline eval line (pass rate + last run date from the latest eval results, §10), this run's cost and seconds, eval set link. **X-ray block:** trace/run id, sources cited, guardrails passed, branch, retries used, model name. Eval numbers and live-usage numbers are always labelled separately and never combined.
- **States:** implement all 7 from `HeroStates.dc.html`: empty, running, result, badfit, break, error, limited, with the exact copy.
- **Failure drills** ("knowledge base offline", "hit the rate limit"): real requests with a `drill` flag that force that failure on the server, so the real fallback path runs and its trace is shown in X-ray (`HERO_DRILL_TRACE` is the expected trace). Drills don't call the LLM for the failed step and don't count against the visitor's limit.
- **"+ How I built this"** collapsible panel: content exactly as in the design. It opens automatically in X-ray mode. Its `[placeholders]` come from `/content/site-meta.ts`.

## 8. Ask my work and Break my AI — `/api/run` with `mode: "ask"`

- One prompt over the same knowledge base (whole KB in context with prompt caching; it's small) plus session memory if present.
- Structured output: `{ kind: "fit"|"gap"|"none"|"refuse"|"conflict"|"clarify"|"unknown", text, sources: [{label, href}], guard }`.
- `kind` → label and colour exactly as `ASK_LABELS`: gap "PARTIAL · STATED PLAINLY" (amber), none "NOT SOMETHING ASWIN HAS DONE" (amber), refuse "REFUSED · PROMPT INJECTION" (accent), conflict "CONFLICT FLAGGED · GOING WITH THE RECORD" (amber), clarify "NEEDS CLARIFYING" (muted). `unknown` → "The knowledge base doesn't cover that, so there's no answer to give. Try a suggested question, or ask Aswin directly." with a Contact chip.
- Guard names shown in X-ray: `guard.prompt_injection`, `guard.not_done`, `guard.conflicting_info`, `guard.ambiguous_ask`, `guard.gap_stated`, or "none · answered from the knowledge base".
- Every factual answer cites ≥ 1 KB source; a server check drops uncited claims to `unknown`.
- **Break my AI on the hero** uses the same mode. The UI shows the verdicts from the design: REFUSED / STATED / FLAGGED / CLARIFIED / ANSWERED (mapping: refuse→REFUSED, none→STATED, conflict→FLAGGED, clarify→CLARIFIED, others→ANSWERED), the "{held} held up of {attempts}" counter (session only, last 6 attempts) and the X-ray guard line. A failed or rate-limited attempt isn't logged or counted; it shows Ask's error or limit line below the input.
- **Case study "Try to break it"** (`Work.dc.html`) uses `mode: "sandbox"` with a prompt that plays the CloudEagle integration builder and returns `{verdict: BLOCKED|FLAGGED|CLARIFIED|DRAFTED, reason, guard}`. The six preset attacks and their expected verdicts are `WORK_ATTACKS`; they are also eval cases.

## 9. Contact form — `/api/contact`

Fields exactly as designed: Name, Work email, Role, Message; button "Send to Aswin". Validate with Zod, verify Turnstile, rate-limit 3/hour per visitor, send via Resend to `CONTACT_TO_EMAIL` with reply-to set to the sender. Success state exactly as designed ("✓ SENT", "Thanks. Your note is with Aswin.", response-time line from content). On failure, show an inline error and a mailto link.

## 10. Limits, cost, logging, evals

- **Rate limits (Upstash, hashed IP):** fit checks per visitor per day = `FIT_DAILY_LIMIT` (default 10); Ask = 30/hour. Over the limit → the hero's "limited" state, no LLM call ("llm.call skipped · nothing billed").
- **Budget cap:** monthly spend counter in Upstash; at `MONTHLY_BUDGET_USD`, all AI modes return the limited/fallback state. Plus a spend limit on the Anthropic workspace.
- **Every model call:** Zod-validated input (JD ≤ 12,000 chars, Ask ≤ 1,000), Turnstile, `maxOutputTokens`, 60 s timeout. User text wrapped in tags and treated as data.
- **Privacy, as the design promises:** pasted JDs and questions are **not stored**. Log only run metrics.

```sql
create table runs (
  id text primary key,            -- the trace/run id shown in X-ray
  created_at timestamptz default now(),
  mode text,                      -- fit | ask | sandbox
  drill text,                     -- null | kb | rate
  branch text,                    -- link | text
  steps jsonb,                    -- [{tool, status, ms}]
  guard_fired text,
  retries int,
  model text,
  input_tokens int, output_tokens int, cached_tokens int,
  cost_usd numeric(10,5),
  latency_ms int,
  prompt_version text
);
create table ai_crawls (id bigserial primary key, created_at timestamptz default now(), bot text, path text);
```
RLS on; server-only writes; no raw IPs.

- **Evals (Promptfoo, public in `/evals`):** the 4 sample JDs, ≥ 6 more real JDs (`TODO(aswin)`), every Break-my-AI attack in `HERO_ATTACKS` and `ASK_ANSWERS`, and the 7 case-study eval cases in `Work.dc.html`. Assertions: valid schema, no uncited match, bad fits never "Strong", not-done topics never matched, injections refused, no percentages. CI writes `content/eval-results.json` (pass rate, red-team held, last run date, case count), which the site displays as the offline eval numbers.

## 11. SEO + GEO (invisible, required)

Metadata and OG images per page; JSON-LD `Person` + `ProfilePage` (home, about), `Article` (posts), `CreativeWork` (case studies); `robots.ts` allowing OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, GPTBot, ClaudeBot, Google-Extended and disallowing `/api/`; `/llms.txt` + `/llms-full.txt` built from `/content`; all content server-rendered; middleware logs AI-crawler user agents to `ai_crawls`; RSS for the build log.

## 12. Content Aswin must supply (placeholders in the design)

Create these files with `TODO(aswin)` values and a clear comment, and build a `pnpm check:content` script that fails the production build while any `TODO(aswin)` or `[` placeholder text would render:

- `content/kb/*` (roles, projects, not-done list, facts, fallback)
- `content/case-studies/*.mdx` (PRD template fields for all 4 studies: what I built, time spent, users/problem, 3 decisions, 4 safeguards, success metrics, before/after steps and times, v2, lessons, links, video)
- `content/before-after.ts` (3 tasks with measured manual vs agent times)
- `content/site-meta.ts` (years of experience, eval set link, GitHub, LinkedIn, domain, response time, posting cadence, "what breaks first at scale", "next", cost per run, 90-day plan line)
- `content/posts/*.mdx` (3 designed posts)
- `content/certificates.ts`, `public/resume.pdf`

Under the hood rule from the design: "Anything without proof yet is left out." A card or case study whose proof isn't filled in is hidden, not shown with placeholders.

## 13. Environment variables

```
ANTHROPIC_API_KEY=
FIT_CHECK_MODEL=claude-sonnet-5-5
CHAT_MODEL=claude-haiku-5-5
FIT_DAILY_LIMIT=10
MONTHLY_BUDGET_USD=20
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
CONTACT_TO_EMAIL=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
IP_HASH_SALT=
```
Provide `.env.example`. Verify model IDs against Anthropic's current model list before shipping.

## 14. Milestones (one at a time; stop for review after each)

1. **Foundation:** scaffold, tokens + both themes, fonts, Nav (with X-ray toggle + persistence), footer, intro banner, content file skeletons with `TODO(aswin)`.
2. **Static pages, pixel-faithful:** `/` (all sections except the live hero, which shows its empty state), `/work/[slug]` PRD template, `/log`, `/about` with the dependency graph, mobile layouts. Compare side by side with each artboard.
3. **Ask my work UI:** modal + bottom sheet, ⌘K, per-page suggestions, session memory box, answer card states (wired to a stub first).
4. **Fit-check hero UI:** all 7 states driven by a typed event stream from a local mock that matches §7, so the UI is done before the backend.
5. **Backend:** knowledge base + `kb.search`, `/api/run` (fit, ask, sandbox), streaming, retry, guards, drills, fallbacks, rate limits, budget cap, Turnstile, run logging. Swap the mocks for the real endpoint.
6. **Contact form + analytics + SEO/GEO.**
7. **Quality:** Vitest (guards, verdict template, kb.search, rate-limit helpers), Playwright (each hero state, X-ray toggle, Ask, contact; plus screenshot comparison against the artboards at 1440 and 390), Promptfoo evals + CI writing `eval-results.json`, `check:content`.
8. **Launch checks:** Lighthouse 95+ mobile, accessibility pass (keyboard, focus trap, `aria-live` on streamed output, contrast AA in both themes, reduced motion), README.

## 15. Out of scope for v1

Vector DB / embeddings, user accounts, CMS, tailored resume generation, booking widget (the design uses the contact form), chat thumbs up/down, any page or feature not in `/design`.
