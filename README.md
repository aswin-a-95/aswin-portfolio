# Aswin — portfolio

A product manager's portfolio that is itself an AI product. Paste a job description and the site checks it against a knowledge base of real roles and projects, then says plainly where Aswin fits and where not. Turn on **X-ray** to see how each answer was built: the steps, the sources, the guardrails and the cost.

Built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, the Vercel AI SDK and Anthropic Claude.

## What's on the site

| Feature | What it does |
| --- | --- |
| **Fit check** (home hero) | A fixed pipeline streams each step to the page as it runs: `fetch_url` → `jd.parse` → `kb.search` → `evidence.map` → `guard.citations` → `guard.honesty` → `verdict.compose`. It shows matches and gaps as tables, with no scores or percentages. Every match cites a source. |
| **Ask my work** (⌘K / Ctrl+K) | Questions answered from the same knowledge base, with source chips. Answers can carry on from a fit check through session memory, and "Forget this" clears it. |
| **X-ray mode** | Reveals inline panels on every page: the live run's trace, build details, "How I built this", and **Break my AI**, a red-team panel for trying prompt injections and failure drills against the real guardrails. |
| **Case studies** (`/work`) | Product write-ups in a PRD format, with before/after views and a "Try to break it" sandbox. |
| **Build log** (`/log`) | Build notes, teardowns, essays and TILs, with filters. |
| **About** (`/about`) | Résumé, a career dependency graph, roles and certificates. |

## How the AI is kept honest

- **One knowledge base, no vector database.** Everything the AI can say comes from typed files in [`content/kb/`](content/kb) (roles, projects, facts, and a list of things Aswin has *not* done). `kb.search` is a deterministic keyword and tag matcher, not a model.
- **Deterministic guards.** A claim without a real knowledge-base source becomes a gap. Verdict counts must match the cards. Topics from the not-done list are never shown as matches.
- **Real traces only.** The steps, timings, tokens and costs shown in X-ray come from the actual run. Nothing on screen is scripted.
- **Privacy.** Pasted job descriptions and questions are never stored or logged. Only run metrics (steps, tokens, cost, latency) go to Supabase.
- **Guardrails on every model call.** Input is validated with Zod, Cloudflare Turnstile is verified, each visitor is rate-limited, a monthly budget cap applies, and `maxOutputTokens` is set. User text is wrapped and treated as data, and the model has no tools that can change anything.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, Server Components), React 19, TypeScript strict |
| Styling | Tailwind CSS v4, design tokens as CSS variables |
| Content | MDX and typed TypeScript data in [`content/`](content) |
| AI | Vercel AI SDK with `@ai-sdk/anthropic`; model IDs come from env vars |
| Validation | Zod |
| Rate limits and budget | Upstash Redis and `@upstash/ratelimit` |
| Bot protection | Cloudflare Turnstile (invisible) |
| Run logging | Supabase Postgres (metrics only) |
| Tests | Vitest and Playwright |

## Getting started

Requires Node.js 20+ and pnpm.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open http://localhost:3000.

With no API keys set, use the fake model. It gives deterministic answers and needs no external services:

```bash
AI_FAKE=1 pnpm dev
```

To use the real model, fill in `.env.local`. [`.env.example`](.env.example) explains each variable:

- `ANTHROPIC_API_KEY`, `FIT_CHECK_MODEL`, `CHAT_MODEL`: the model calls
- `UPSTASH_REDIS_REST_URL` / `_TOKEN`: rate limits and the budget counter (without them, a local server falls back to an in-memory store)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`: bot protection (Cloudflare's test keys work locally)
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`: run logging (apply the migrations in [`supabase/migrations`](supabase/migrations))
- `FIT_DAILY_LIMIT`, `MONTHLY_BUDGET_USD`, `IP_HASH_SALT`: limits and visitor hashing

`AI_FAKE` is refused in production.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build, then a content check that fails if any placeholder would render |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit tests (guards, verdict, `kb.search`, rate limits, content) |
| `pnpm test:e2e` | Playwright end-to-end tests and screenshots at 1440 and 390 px |
| `pnpm check:content` | List every `TODO(aswin)` and `[placeholder]` still left in the content |

## Project layout

```
app/              Routes: /, /work, /work/[slug], /log, /log/[slug], /about, /api/run
components/       UI: nav, fit-check hero, Ask, X-ray panels, case study, home sections
content/          Everything the site and the AI say
  kb/             Knowledge base: roles, projects, not-done, facts, fallback
  case-studies/   Case studies (MDX)
  posts/          Build log posts (MDX)
lib/
  ai/             Prompts (with PROMPT_VERSION), Zod schemas, model and cost helpers, fake model
  kb/             Knowledge-base snapshot and kb.search
  run/            The /api/run pipelines (fit, ask, sandbox), guards and verdict
  fit-check/      Fit-check client, types and copy
  ask/            Ask my work client, session memory and copy
  server/         Rate limits, budget, Turnstile, run logging
design/           The approved design artboards (.dc.html) and CHANGES.md
supabase/         Database migrations
tests/            unit/ (Vitest) and e2e/ (Playwright)
SPEC.md           The build spec: routes, backend, data, limits
```

## How it's built

[`design/`](design) holds the approved design: interactive HTML prototypes for each page and state. [`SPEC.md`](SPEC.md) turns that design into a build plan, covering routes, the AI pipeline, limits and logging. Design changes are recorded in [`design/CHANGES.md`](design/CHANGES.md) and applied to the code and the spec together. [`CLAUDE.md`](CLAUDE.md) holds the working rules for the AI coding agent that helps build the site.

## Status

Done:
- Foundation
- Static pages
- Ask my work
- Fit-check hero
- Backend (`/api/run`, guards, limits, run logging)
- Design updates 1–4

Still to come:
- Contact form, analytics and SEO
- Promptfoo evals in CI
- Launch checks

Some content is still placeholder text, marked `TODO(aswin)` or `[bracketed]`. `pnpm check:content` lists it.
