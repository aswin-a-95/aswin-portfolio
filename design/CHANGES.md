# Design changes

The files in this folder are always the latest approved design. This log says what changed in each update, so code can be brought in line without re-reading every artboard.

## 2026-11-19 (update 3) — X-ray becomes inline dark panels; fit-check results as tables; Break my AI moves into X-ray

Changed artboards: `Hero.dc.html`, `Main.dc.html`, `Nav.dc.html`, `Ask.dc.html`, `Work.dc.html`, `About.dc.html`, `BuildLog.dc.html`, `Mobile.dc.html`, `HeroStates.dc.html`. Only `MobileAsk.dc.html` is unchanged.
All screenshots in `screenshots/` are now out of date; the `.dc.html` files win.
This update **overrides parts of SPEC.md** (see "Spec impact" at the end). Where SPEC.md and this entry disagree, this entry wins.

### 0. The big change: what X-ray does
- **Before:** turning X-ray on switched the *whole site* to the dark theme.
- **Now:** pages **always render in the light theme**. Turning X-ray on reveals **inline X-ray panels** that use the dark token set; nothing else changes colour.
- **X-ray panel pattern** (used everywhere below):
  - `position: relative`; background X-ray `bg` `#101214` (or X-ray `paper` `#171A1D` for the Break my AI panel); `border: 1px solid` X-ray `rule` `#2B3036`; text X-ray `ink` / `muted`; `border-radius` 14px (10px for the drill trace; 8px for Ask's one-line panel).
  - An **`X-RAY` pill** pinned top-right: `position: absolute; top: 10px; right: 12px; padding: 2px 8px; border-radius: 999px; border: 1px solid #8DBBF2; color: #8DBBF2`; IBM Plex Mono 10px, `letter-spacing: 0.1em`.
- **Removed X-ray-only extras** (no longer in the design): the per-card X-ray line on home Work cards (`c.xr`), the "written by Aswin · AI used for editing only…" line on Build log posts, and the "knowledge base: [N] roles…" line on the About resume card.
- The Ask scrim still darkens in X-ray (`rgba(0,0,0,0.6)` vs `rgba(27,26,23,0.38)`), as before.

### 1. Nav.dc.html — the toggle shows the state
- The Nav itself always uses light tokens.
- X-ray toggle button **when on**: `background #101214`, text `#E9E6DF`, `border 1px solid #101214`; track `#8DBBF2`, knob light `bg` `#F6F3EC`, at `left: 14px`. **When off**: `background` paper, text ink, border rule; track rule, knob paper, at `left: 2px`. The label stays "X-ray".

### 2. Hero.dc.html (fit check) — major rework
**2a. Panel header:** `answers from my real record · gaps shown, not hidden` moved from the right side into the left column, as the third line under the H2 "Will I fit your role?". (The header row keeps its bottom border.)

**2b. JD input card (empty state):**
- Removed the `text or a link · not stored` line under the label.
- Textarea placeholder: `Paste the role, or a link to it…` → `Paste the job description or a link to the JD (data not stored)`.
- **Removed** the "Break my AI" and "Failure drills" chip rows under the card (they moved into X-ray, see 2h).

**2c. States:** "break" is **no longer a hero state** that replaces the fit check. The compact "Checking/Checked against" bar now shows in every non-empty state.

**2d. Steps list:** shown while running **and after the result** (it used to disappear).
- Header: `Agent · streaming from the live run` while running → `Agent · done · 7 steps from the live run` once finished.
- Step lines always use the plain form `{tool} · {label}` with a status of `{detail}` or `running…`. X-ray no longer swaps them to the raw call form or adds `· [ms]`.
- The `trace [run id] · logged` X-ray line in this box is removed.

**2e. New X-ray panel "This run"** (only when X-ray is on **and** there's a result), placed right after the steps list:
- H3 `This run` (sans 18px 600), with the sub-line `From the logged trace of the check you just ran.` (14px, muted).
- A grid (`repeat(auto-fit, minmax(190px, 1fr))`, gap 16px 24px). Each item has a mono 11px uppercase muted label above a 15px value:
  `Run ID` [run id] · `Time` [timestamp] · `Input` "Link · fetch_url called" / "Text · fetch_url skipped" · `Retries` "0 of 1 used" · `Requirements found` "{n} in the JD" · `Sources` "[N] retrieved · {m} cited" · `Result` "{m} matches · {g} gaps" · `Guardrails` "citations ✓ · honesty ✓" (in accent `#8DBBF2`) · `Fallback` "Not needed" · `Response time` "[logged] s total" · `Tokens` "[in] in · [out] out" · `Cost` "[logged]".
- Then a top-bordered sub-section, H4 `Build details` (15px 600), in the same grid:
  `Build` [version · date] · `Model` [provider · model] · `Prompt` [fit-check prompt version] · `Knowledge base` "Synced from master resume [date]" · `Offline eval` "[passed]/[total] cases · [date]" · `Red-team cases` "[held]/[total] held" · `Eval set` "View on GitHub [link] →" (a link, in accent).
- In the build, every value comes from the real run log, build metadata and `eval-results.json`. Never fake them.

**2f. Result header:** a new `RESULT` pill above the verdict (outline `1.5px solid ink`, `padding 3px 10px`, radius 999px, mono 11px weight 500, `letter-spacing 0.1em`). The result column gap is now 28px (was 24px).

**2g. Matches and gaps are now tables** (not card grids):
- **Breakpoint:** a table at viewport ≥ 640px; stacked rows below 640px.
- **"Where I fit · {n}"**: a container with paper background, `1px solid rule`, radius 12px, `overflow: hidden`.
  - Table (`table-layout: fixed`). Column headers are mono 11px uppercase, weight 500, padding 12px 20px: `The JD asks for` (32%, muted) · `✓ My relevant experience` (44%, accent) · `Proof` (24%, muted).
  - Rows: the requirement is a `<th scope="row">` (16px 600); evidence is 15px with line-height 1.55; proof is a mono 12px accent link `{source} →`. Cells have padding 18px 20px and `border-top: 1px solid rule`.
  - Below 640px, each match is a block (padding 16px 18px, bottom border) with labels `The JD asks for` / `✓ My relevant experience` and a link `Proof: {source} →`.
- **"Where I don't (yet) · {n}"**: a container with `amberBg`, `1.5px dashed amberBorder`, radius 12px.
  - Table headers, all in `amberText`: `The JD asks for` (32%) · `Where I stand` (34%) · `How I'd close it` (34%).
  - Row borders: `1px solid amberBorder`.
  - The last cell shows the close text, or `—` in muted when it's empty, then the button `Ask about this gap →` (min-height 36px, padding 4px 10px).
  - Below 640px: stacked blocks with those three labels (the "How I'd close it" pair is hidden when empty), dashed bottom borders, and the button (min-height 40px).
- The old `CLOSEST` / `HOW I'D CLOSE IT` inline labels are gone.

**2h. Removed from results:** the always-visible line `offline eval · pass rate… · this run · cost… · eval set on GitHub` and the old dashed X-ray block. That information now lives in the "This run" panel (2e).

**2i. Break my AI is now an X-ray panel** shown whenever X-ray is on, in every state, below the fit-check content. The fit check stays usable above it.
- Panel uses the X-ray `paper` background, `padding: 38px 22px 22px`, and the X-RAY pill.
- Copy: `Break my AI · red-team mode` / `Try to make it overclaim.` / `Pick an attack or write your own. Every reply says which guardrail held. The fit check above keeps working as normal.` and the counter `{held} held up of {attempts}`.
- Contents: the attack chips, the own-attempt input and `Run` button, and the log. The `guardrail fired: … · trace [run id] · [ms]` line now **always** shows (it's already inside X-ray).
- **Failure drills moved here**: a top-bordered section with the label `Failure drills · runs the real fallback in the fit check above` and the two dashed chips. Running a drill puts the fit check above into its error or limited fallback state.
- Footer link: `These cases ship with the public eval set · GitHub [link] →`.
- Verdict pill colours use the X-ray tokens.

**2j. Fallback drill trace** is now an X-ray panel (radius 10px, padding 14px 16px) headed `FALLBACK TRACE · drill run [run id]`. Failed lines are in X-ray `amberText`.

**2k. Nudge** (`Turn on X-ray →`) now shows only after a result, or after a drill's fallback. The break-state nudge is gone.

**2l. "How I built this":** the `+ / − How I built this` toggle button is **removed**. The panel shows **only when X-ray is on**, as an X-ray panel (padding 20px, radius 14px) with an H3 `How I built this` (sans 22px 600) above the honest note. The content is otherwise unchanged.

**2m. Script:** the dark token set `d` is used for every X-ray panel; `t` (light) for everything else.

### 3. HeroStates.dc.html
- State 05 is renamed `X-ray on: Break my AI`. Its note now reads: `With X-ray on, a red-team panel appears below the fit check, which stays usable. Attack chips, your own attempts and failure drills, each reply labelled with the guardrail that held.` It renders the empty fit check with X-ray on and two sample attempts.

### 4. Main.dc.html (home)
- Intro banner copy: `New here? Try X-ray. It shows how the AI works in the fit check, Ask my work and the case studies: the sources, guardrails, live traces, cost and eval results behind each answer.`
- The "Under the hood" section header becomes a column (gap 10px):
  - eyebrow `ACROSS ALL MY WORK` (mono 12px, letter-spacing 0.08em, muted)
  - H2 `How I build agentic products, with proof` (serif 36px, line-height 1.15)
  - `Each part links to where you can see it working: live on this site, in a case study, or on GitHub.` (16px, muted)
  - The old title "Under the hood" and its side note are removed. The 8 cards are unchanged.
- Work cards: the X-ray line is removed.
- The page always uses light tokens.

### 5. Mobile.dc.html
- Intro banner: `New here? Try X-ray. It shows how the AI works in the fit check, Ask my work and the case studies.`
- The hood section gets the eyebrow `ACROSS ALL MY WORK` (mono 11px), the H2 `How I build agentic products, with proof` (serif 28px, line-height 1.2) and `Each part links to where you can see it working.` (15px, muted, margin-bottom 4px).
- Always light tokens.

### 6. Ask.dc.html
- **Break my AI chips now show only in X-ray**, inside an X-ray panel (padding 12px 14px, radius 10px, with the X-RAY pill).
- The answer's X-ray line (`kb.search → … · live usage: cost … ms`) is now an X-ray panel: radius 8px, `padding: 10px 76px 10px 12px` (leaving room for the pill), with the X-RAY pill.
- The dialog itself always uses light tokens. Only the scrim darkens in X-ray.

### 7. Work.dc.html (case study)
- Architecture: the logged trace is an X-ray panel. Its header line is now `LOGGED TRACE · run [run id] · real run, never a simulation`, and its rows use X-ray rule, accent and muted.
- Try to break it: the X-ray guard line is now a small dark chip (`align-self: flex-start; margin-top: 4px; padding: 3px 8px; border-radius: 6px; background #101214; color #A3A9B0`).
- Performance: the offline eval table is an X-ray panel with the X-RAY pill. The header text drops "X-RAY ·" and now reads `OFFLINE EVAL SET · [N] cases incl. red-team`.
- Always light tokens.

### 8. About.dc.html, BuildLog.dc.html
- Always light tokens. The X-ray-only lines listed in section 0 are removed.

### Spec impact (update SPEC.md to match)
- **§3 Design tokens:** light is the only page theme. The dark column becomes **"X-ray panel tokens"**, used only inside X-ray panels and the active X-ray toggle. Drop the `data-theme="xray"` whole-page switch. Instead, provide an `XrayPanel` component (dark tokens + X-RAY pill) and an `xray` flag in context.
- **§5 X-ray mode:** X-ray reveals panels and does not re-theme the page. The list of X-ray-only content is now: the "This run" and "Build details" panels, the Break my AI panel (hero) and its chips (Ask), "How I built this" (hero), drill traces, the Ask answer trace, the case-study trace, the eval table, and the guard chips.
- **§7 Fit check:**
  - States are empty, running, result, badfit, error and limited ("break" is not a state).
  - Steps persist after the result.
  - The result footer line is replaced by the X-ray "This run" + "Build details" panels, which are fed by the run log, build metadata and `eval-results.json`.
  - Failure drills now live in the X-ray Break my AI panel.
  - Matches and gaps render as tables at ≥ 640px.
  - The "How I built this" toggle is removed; the panel is X-ray only.
- **§10:** the run log must provide every "This run" field: run id, timestamp, branch, retries, requirement count, sources retrieved and cited, guard results, fallback used, latency, tokens in/out, cost.

### What to update in code
- Theme system: remove the whole-page dark switch; add the `XrayPanel` pattern and the new Nav toggle styling.
- Hero: everything in section 2, including the 640px table/stack breakpoint and the "This run" / "Build details" panel wired to real run data.
- Home, Mobile, Ask, Work, About, Build log copy and X-ray changes per sections 3–8.
- Update SPEC.md per "Spec impact".
- Update tests and e2e selectors: no break state; new copy; tables; X-ray panels.
- Check at 1440 and 390 px with X-ray off and on.

## 2026-11-18 (update 2) — Fit check gets its own panel, running progress, Ask "thinking" state

Changed artboards: `Hero.dc.html`, `Ask.dc.html`. The other 8 artboards are unchanged.
This update **supersedes part of update 1**: the `TRY IT · LIVE AI` pill inside the JD card is gone (see 1c).
The screenshots in `screenshots/` predate both updates; for the hero, nav and Ask, the `.dc.html` files win.

### Hero.dc.html

**1. Hero layout: smaller intro, fit check in its own panel**
- a. H1 "Platform PM who builds for agents." (text unchanged) is smaller: `font-size: clamp(42px, 6vw, 72px)` → `clamp(32px, 4vw, 46px)`; `line-height` 1.02 → 1.1; `letter-spacing` -0.02em → -0.015em.
- b. Subheading (text unchanged from update 1): `max-width` 760px → 720px; `font-size` 24px → 20px; `line-height` 1.4 → 1.45.
- c. **New panel** wrapping everything below the intro: every hero state, the nudge and the "How I built this" toggle/panel. It's a `<section aria-labelledby="fit-h">` with:
  - `margin-top: 8px; border: 1px solid rule; border-radius: 20px; background: panel; padding: clamp(18px, 3vw, 32px); display: flex; flex-direction: column; gap: 22px`
  - **Panel header**, first child: a row with `justify-content: space-between; align-items: flex-end; gap: 8px 20px; flex-wrap: wrap; padding-bottom: 18px; border-bottom: 1px solid rule`.
    - Left column (`gap: 8px`): the pill `FIT CHECK · LIVE AI` (same pill style as update 1: accent background, paper text, mono 11px, letter-spacing 0.08em, padding 3px 9px, radius 999px), then `<h2 id="fit-h">` "Will I fit your role?" in IBM Plex Sans, `font-size: clamp(24px, 3vw, 30px)`, weight 600, line-height 1.2, letter-spacing -0.01em.
    - Right: `answers from my real record · gaps shown, not hidden` in mono 12px, muted.
  - The `TRY IT · LIVE AI` pill **inside** the JD input card (added in update 1) is **removed**. The card keeps its accent border, halo, large label and "text or a link · not stored" line.
- d. **New token `panel`**: light `#EFEAE0`, X-ray `#14171A`. Add it to the theme (SPEC.md §3 token table) for both themes.

**2. Compact "Checking against" bar** (shown in every state except empty and break):
- Label is now state-aware: `Checking against` while running, `Checked against` after (result, badfit, error, limited); `Drill running against` during a drill (unchanged).
- Role text: the paragraph gets `flex: 1 1 320px; min-width: 0; line-height: 1.45`; the role `<b>` gets `overflow-wrap: anywhere`.
- **While running**, the "Try another role" button is replaced by a progress block (`role="status" aria-live="polite"`, column, `gap: 6px`, `min-width: 180px`):
  - `Checking… step {n} of 7` in mono 13px, accent colour
  - a progress bar: track 4px tall, radius 999px, background `accentTint`; fill in `accent` at width = n / 7.
  - n = the step currently running (1-based, capped at 7). In the real build, drive it from the streamed step events, not a timer.
- When not running, the reset button shows as before.

**3. Role shown for a pasted JD** (new `heroSummary` in the script). Instead of the fixed text "Your pasted role", the bar shows a summary of the input:
- Pasted **link**: the first token with `http(s)://` and `www.` stripped, cut to 64 characters with `…`.
- Pasted **text**: the first line or first sentence (split on a newline or `. `), trimmed, cut to 72 characters with `…`.
- In the real build, prefer the role title that `jd.parse` extracts if it has one; fall back to this summary rule. This role string is also what pre-fills the contact form and session memory.

### Ask.dc.html — new "thinking" state between asking and the answer
- When a question is asked (typed, suggested, session-memory or Break-my-AI chip), the panel shows a **thinking state** instead of jumping straight to the answer:
  - The input is disabled with `aria-busy`, at opacity 0.5, and its placeholder becomes `Answering from the knowledge base…`. The submit button is disabled at opacity 0.5 and its label becomes `Thinking…` (otherwise `Ask`).
  - Thinking block (`role="status" aria-live="polite"`, padding 18px, column, gap 10px, mono 13px):
    1. `› {the question}` in muted
    2. progress bar: 3px tall, radius 999px, track `accentTint`, fill `accent`; width = (current step + 1) / 3
    3. step lines that appear one at a time: `kb.search · searching the knowledge base`, `guardrails · checking the answer cites a source`, `compose · writing the answer`. Finished steps show `✓` in accent; the current step shows `›` in ink, with `…` at the end of its text.
  - The suggestions view and the answer card are hidden while thinking. Typing a new question while thinking does nothing.
  - Reopening the panel resets the thinking state.
- In the real build, these three steps must reflect the real request (stream step events from `/api/run` in `mode: "ask"`). The prototype's 450 ms timer is a mock.

### What to update in code
- Add the `panel` token (both themes).
- Hero: smaller H1 and subheading; wrap the fit-check states in the new panel with its header; remove the pill from the JD card.
- Compact bar: state-aware label, running progress block driven by real step events, wrapping role text, `heroSummary` fallback.
- Ask: the thinking state, driven by real step events from the ask stream; disabled input and button while thinking.
- Update tests, snapshots and e2e selectors for the new copy ("Will I fit your role?", "Checked against", "Thinking…").
- Check both themes, and check 390 px: the panel header wraps, and the progress block drops under the role text.

## 2026-11-18 — Hero copy + JD input emphasis, Nav subtitle

Changed artboards: `Hero.dc.html`, `Nav.dc.html`. The other 8 artboards are unchanged.
The screenshots in `screenshots/` predate this update; for the hero and nav, the `.dc.html` files win.

### Nav.dc.html
- Wordmark subtitle text: `platform pm · builds for agents` → `pm · builds for agents`. Styles unchanged.

### Hero.dc.html
1. **Subheading under the H1** ("Platform PM who builds for agents." is unchanged):
   - Text: `Paste a job description. This site will tell you honestly where I fit and where I don't.` → `I build platforms, AI-powered products, and systems that turn emerging technology into real-world capability.`
   - `max-width`: 640px → 760px
   - `font-size`: 22px → 24px (still serif, line-height 1.4, muted)

2. **JD input card (empty state)** is now visually emphasised:
   - Card border: `1px solid rule` → `1.5px solid accent`
   - New `box-shadow: 0 0 0 4px accentTint` (a soft accent halo, not a drop shadow)
   - Padding: 20px → 22px
   - Card header was one row (mono uppercase label "Job description" on the left, "text or a link · not stored" on the right). It's now a column with `gap: 10px`, in this order:
     1. Pill `TRY IT · LIVE AI`: `align-self: flex-start`, padding 3px 9px, radius 999px, background `accent`, text `paper`, IBM Plex Mono 11px, letter-spacing 0.08em
     2. The `<label for="jd-input">` now reads `Paste a job description. This site will tell you honestly where I fit and where I don't.` in IBM Plex Sans, 21px, weight 600, line-height 1.35, colour `ink` (it was mono 12px uppercase muted "Job description")
     3. `text or a link · not stored`: IBM Plex Mono 12px, muted (same style, now on its own line under the label)
   - The textarea, sample chips, "Check fit" button, Break my AI and Failure drills rows are unchanged.

### What to update in code
- Nav subtitle string.
- Hero subheading text and size.
- The JD input card's border, halo, padding and the new header block (pill + large label + helper line). Keep the label wired to the textarea for accessibility.
- Any tests, snapshots or content files that contain the old strings.
- Check both themes (light and X-ray): the pill and halo use the `accent`, `accentTint` and `paper` tokens.
- Check at 390 px: the pill stays on its own line, and the label wraps without overflowing.
