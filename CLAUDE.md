# CLAUDE.md

Aswin's personal portfolio site. Read `SPEC.md` and the design files in `/design` before any task.

## Source of truth, in order

1. **`/design/*.dc.html`** — the final, approved design. It decides layout, visual values, copy, states and interactions.
2. **`SPEC.md`** — decides routes, backend, data, limits and anything the design doesn't show.
3. This file — how to work.

If the design and SPEC.md seem to conflict, or the design doesn't cover something you need, **stop and ask Aswin.** Don't pick one yourself. The only pre-approved defaults are the gaps listed in SPEC.md §4 (`/work` index, `/log/[slug]` post page); flag them when you build them.

## Design fidelity rules (non-negotiable)

- **Implement exactly what the design shows. Nothing more, nothing less.** No extra sections, cards, animations, icons, emoji, illustrations, gradients, shadows or "improvements". No removed or merged sections.
- **Copy is word for word,** including punctuation, curly quotes, en/em dashes, the `·` separators, `→` arrows, capitalisation and letter-spacing on mono labels. Don't rewrite, shorten or "polish" any text.
- **Visual values are exact.** Take colours, font families, sizes, weights, line-heights, letter-spacing, padding, gaps, max-widths, radii and border styles (solid / dashed / dotted, 1 / 1.5 / 2 px) from the inline styles. Map them to Tailwind arbitrary values or theme tokens. Never approximate to the nearest Tailwind default.
- **All states are required.** Every `<sc-if>` branch, every hero state in `HeroStates.dc.html`, every X-ray-only block, the empty states and the error and fallback states.
- **Interactions are required:** X-ray toggle and persistence, ⌘K, filters, the dependency-graph selection, the before/after tabs, the case-study sticky rail (≥ 900 px), the contact pre-fill, session memory and "Forget this".
- **Responsive behaviour** follows the flex-wrap / `auto-fit minmax()` rules in the markup, plus `Mobile.dc.html` and `MobileAsk.dc.html` at 390 px.
- **Accessibility as designed:** keep every `aria-*`, `role`, `<label>`, heading level, ≥ 44 px target and focus style from the markup.
- **Prototype mocks are not the product.** Timers, regex classifiers and hard-coded results in the `<script>` blocks show the exact shape and tone; the real data comes from the backend in SPEC.md §6–8. Never fake a "live" step, trace, cost or eval number. The design promises "the steps on screen stream from the real run, never a script".
- **Placeholders:** `[bracketed]` text is Aswin's content. Read it from `/content`; if it's missing, leave `TODO(aswin)` in the content file. Never invent facts, numbers, companies, dates or links.

## How to check your work against the design

- For every page and component, open the matching `.dc.html` and go through it top to bottom, element by element, before calling it done.
- At the end of each UI milestone, run the site and take Playwright screenshots at 1440 and 390 px. List any difference from the artboards, fix it, and report what's left.
- If `/design/screenshots/` exists, use those PNGs as the visual reference as well.

## How to work

- One milestone from SPEC.md §14 at a time. Start each in plan mode, show the plan, wait for approval, then build.
- End of each milestone: lint, typecheck, tests and `pnpm build` must pass. Then summarise what changed, any design gaps or questions, and what Aswin must do (accounts, keys, content). Then stop.
- Branch per milestone (`m1-foundation`, …); commit after each working step.
- Ask before adding any dependency not in SPEC.md §2.
- Check current docs (Next.js, AI SDK, Anthropic, Upstash, Supabase, Resend) before using their APIs.

## Hard rules

- Never commit secrets. `.env.local` stays gitignored; keep `.env.example` current.
- No server secrets in `NEXT_PUBLIC_*` or client components.
- Every model call needs input validation, Turnstile verification, a rate limit, the budget check and `maxOutputTokens`.
- Pasted JDs and questions are never stored or logged (the design promises "not stored").
- Treat user text as untrusted data. The model gets no side-effecting tools.
- No vector database or embeddings in v1.

## Conventions

- TypeScript strict; no `any` without a comment explaining why.
- Server Components by default; `"use client"` only for interactive parts.
- Theme tokens as CSS variables switched by `data-theme="xray"`; components never hard-code hex.
- Prompts live in `lib/ai/prompts.ts` with a `PROMPT_VERSION`; Zod schemas in `lib/ai/schemas.ts`; tool and guard names exactly as in SPEC.md §7–8.
- Model IDs come from env vars.

## Commands

`pnpm dev` · `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm test:e2e` · `pnpm evals` · `pnpm check:content` · `pnpm build`
