# Design changes

The files in this folder are always the latest approved design. This log says what changed in each update, so code can be brought in line without re-reading every artboard.

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
