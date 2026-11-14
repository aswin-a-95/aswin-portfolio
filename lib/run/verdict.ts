import { isStrongFit } from "@/lib/fit-check/copy";

/**
 * SPEC §7 `verdict.compose`: a deterministic template, never the model. The hero picks the
 * result or bad-fit look with the same isStrongFit rule, so the two can't disagree.
 * Note lines are HERO_FIT.note and HERO_BAD.note from Hero.dc.html.
 */
export const NOTE_STRONG = "Each match links to the role or project behind it. Gaps are listed, not hidden.";
export const NOTE_WEAK = "Better you hear it from this site than in round two.";

export function composeVerdict(matches: number, gaps: number): { verdict: string; note: string } {
  const n = matches + gaps;
  return isStrongFit(matches, gaps)
    ? { verdict: `Strong on ${matches} of ${n} requirements.`, note: NOTE_STRONG }
    : { verdict: `Not a strong fit: ${matches} of ${n} requirements.`, note: NOTE_WEAK };
}
