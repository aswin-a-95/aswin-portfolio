# Design changes

The files in this folder are always the latest approved design. This log says what changed in each update, so code can be brought in line without re-reading every artboard.

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
