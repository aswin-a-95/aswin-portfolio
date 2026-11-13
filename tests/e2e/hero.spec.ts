import { expect as baseExpect, test, type Page } from "@playwright/test";

// A full run streams 7 steps (~4.5 s in the mock), so waits allow for a loaded machine.
const expect = baseExpect.configure({ timeout: 15_000 });

// Runs against the dev mock (lib/fit-check/stub.ts), which streams the same events as /api/run.
const hero = (page: Page) => page.locator("section").first();
const running = (page: Page) => hero(page).getByRole("status").filter({ hasText: "Agent · streaming from the live run" });

async function stubMode(page: Page, mode: "error" | "limited" | "hold") {
  await page.addInitScript((m) => window.sessionStorage.setItem("fit-stub", m), mode);
}

async function sample(page: Page, label: string) {
  await hero(page).getByRole("button", { name: label, exact: true }).click();
}

test.describe("fit check", () => {
  test("empty: Check fit is disabled until there is text; the input is capped at 12,000", async ({ page }) => {
    await page.goto("/");
    const input = page.getByLabel("Job description");
    await expect(input).toHaveAttribute("maxlength", "12000");
    await expect(page.getByRole("button", { name: "Check fit" })).toBeDisabled();
    await input.fill("Staff PM, payments platform.");
    await expect(page.getByRole("button", { name: "Check fit" })).toBeEnabled();
  });

  test("running: steps stream in order with tool names; pasted text skips fetch_url", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("Job description").fill("Staff PM, payments platform.");
    await page.getByRole("button", { name: "Check fit" }).click();
    await expect(hero(page).getByText("Checking against")).toBeVisible();
    await expect(hero(page).getByText("Your pasted role", { exact: true })).toBeVisible();
    await expect(running(page)).toBeVisible();
    await expect(running(page).getByText("fetch_url · skipped: text was pasted")).toBeVisible();
    await expect(running(page).getByText("jd.parse · Reading the job description")).toBeVisible();
    await expect(running(page).getByText("verdict.compose · Writing the verdict")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Strong on 4 of 6 requirements." })).toBeVisible();
  });

  test("running in X-ray: the full call and [ms] placeholders, never a fake number", async ({ page }) => {
    await stubMode(page, "hold");
    await page.goto("/?xray=1");
    await sample(page, "Senior Platform PM");
    await expect(running(page).getByText("trace [run id] · logged")).toBeVisible();
    await expect(running(page).getByText("branch: input is text → skip fetch_url")).toBeVisible();
    await expect(running(page).getByText("jd.parse(text) → requirements[]")).toBeVisible();
    await expect(running(page).getByText("6 requirements · [ms]")).toBeVisible();
    await expect(running(page).getByText("running…")).toHaveCount(1);
  });

  test("result: evidence cards, gap cards, eval/cost line and session memory for Ask", async ({ page }) => {
    await page.goto("/");
    await sample(page, "Senior Platform PM");
    await expect(page.getByRole("heading", { name: "Strong on 4 of 6 requirements." })).toBeVisible();
    await expect(hero(page).getByText("Where I fit · 4")).toBeVisible();
    await expect(hero(page).getByText("Where I don't (yet) · 2")).toBeVisible();
    await expect(hero(page).getByRole("link", { name: "Case study · CloudEagle concept →" })).toHaveAttribute("href", "/work/cloudeagle");
    await expect(hero(page).getByText("this run · cost [logged] · [logged] s")).toBeVisible();
    await expect(hero(page).getByText("See the trace, sources and cost behind this result.")).toBeVisible();
    await expect(hero(page).getByRole("link", { name: "Download resume" })).toHaveAttribute("href", "/resume.pdf");
    await expect(hero(page).getByText("THIS RUN · LIVE USAGE")).toHaveCount(0);

    const memory = await page.evaluate(() => JSON.parse(window.sessionStorage.getItem("fit-memory") ?? "null"));
    expect(memory).toMatchObject({ role: "Senior Platform PM · APIs & integrations", matchCount: 4 });
    expect(memory.gaps.map((g: { req: string }) => g.req)).toEqual(["3+ years shipping LLM features in production", "Running evals at team scale"]);

    await hero(page).getByRole("button", { name: /^Ask my work/ }).click();
    const dialog = page.getByRole("dialog", { name: "Ask my work" });
    await expect(dialog.getByText("Senior Platform PM · APIs & integrations")).toBeVisible();
  });

  test("result in X-ray: live-usage and offline-eval blocks, labelled apart", async ({ page }) => {
    await page.goto("/");
    await sample(page, "Senior Platform PM");
    await hero(page).getByRole("button", { name: "Turn on X-ray →" }).click();
    await expect(hero(page).getByText("THIS RUN · LIVE USAGE")).toBeVisible();
    await expect(hero(page).getByText("branch: text → fetch skipped")).toBeVisible();
    await expect(hero(page).getByText("retries: 0 of 1")).toBeVisible();
    await expect(hero(page).getByText("model [provider · model]")).toBeVisible();
    await expect(hero(page).getByText("Eval numbers and live-usage numbers are labelled and never combined.")).toBeVisible();
    await expect(hero(page).getByText("See the trace, sources and cost behind this result.")).toHaveCount(0);
  });

  test("a gap card opens Ask on that gap", async ({ page }) => {
    await page.goto("/");
    await sample(page, "Senior Platform PM");
    await hero(page).getByRole("button", { name: "Ask about this gap →" }).nth(1).click();
    const dialog = page.getByRole("dialog", { name: "Ask my work" });
    await expect(dialog.getByText("About the gap: Running evals at team scale")).toBeVisible();
  });

  test("bad fit: stated plainly, contact stays available and pre-fills the role", async ({ page }) => {
    await page.goto("/");
    await sample(page, "A bad fit, on purpose");
    await expect(page.getByRole("heading", { name: "Not a strong fit: 1 of 5 requirements." })).toBeVisible();
    await expect(hero(page).getByText("Not something Aswin has done.")).toHaveCount(3);
    await expect(hero(page).getByText("HOW I'D CLOSE IT")).toHaveCount(0);
    await hero(page).getByRole("link", { name: "Talk to Aswin anyway" }).click();
    await expect(page).toHaveURL(/#contact$/);
    await expect(page.getByLabel("Role")).toHaveValue("Head of Hardware Product · consumer electronics");
    await expect(page.getByText("pre-filled from your fit check")).toBeVisible();
    await page.getByLabel("Role").fill("Something else");
    await expect(page.getByText("pre-filled from your fit check")).toHaveCount(0);
  });

  test("a link takes the fetch_url branch", async ({ page }) => {
    await stubMode(page, "hold");
    await page.goto("/");
    await page.getByLabel("Job description").fill("https://example.com/jobs/1");
    await page.getByRole("button", { name: "Check fit" }).click();
    await expect(running(page).getByText("fetch_url · Fetching the job post")).toBeVisible();
    await expect(running(page).getByText("fetched")).toBeVisible();
  });

  test("Try another role resets to the empty state with the input focused", async ({ page }) => {
    await stubMode(page, "hold");
    await page.goto("/");
    await sample(page, "AI product PM (agents)");
    await expect(hero(page).getByText("Product Manager · AI agents")).toBeVisible();
    await hero(page).getByRole("button", { name: "Try another role" }).click();
    await expect(page.getByLabel("Job description")).toHaveValue("");
    await expect(page.getByLabel("Job description")).toBeFocused();
  });

  test("error: calm message, retry and precomputed matches", async ({ page }) => {
    await stubMode(page, "error");
    await page.goto("/");
    await sample(page, "Senior Platform PM");
    await expect(page.getByRole("heading", { name: "The fit check couldn't finish this time." })).toBeVisible();
    await expect(hero(page).getByText("Fit check · error")).toBeVisible();
    await expect(hero(page).getByRole("button", { name: "Try again" })).toBeVisible();
    await expect(hero(page).getByText("Precomputed matches · same knowledge base")).toBeVisible();
    await expect(hero(page).getByRole("heading", { level: 3, name: "Platform PM · APIs & integrations" })).toBeVisible();
    await hero(page).getByRole("link", { name: "Message Aswin about this role" }).click();
    await expect(page.getByLabel("Role")).toHaveValue("Senior Platform PM · APIs & integrations");
  });

  test("rate-limited: explains the cap, no retry", async ({ page }) => {
    await stubMode(page, "limited");
    await page.goto("/");
    await sample(page, "Senior Platform PM");
    await expect(page.getByRole("heading", { name: "That's today's limit for live checks." })).toBeVisible();
    await expect(hero(page).getByText("Fit check · daily limit reached")).toBeVisible();
    await expect(hero(page).getByRole("button", { name: "Try again" })).toHaveCount(0);
  });

  test("drills: knowledge base offline, with the fallback trace in X-ray", async ({ page }) => {
    await page.goto("/");
    await hero(page).getByRole("button", { name: "knowledge base offline" }).click();
    await expect(hero(page).getByText("Drill running against")).toBeVisible();
    await expect(running(page)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "The knowledge base didn't answer, so the AI won't guess." })).toBeVisible();
    await expect(hero(page).getByText("Failure drill · knowledge base offline")).toBeVisible();
    await expect(hero(page).getByRole("button", { name: "Try again" })).toHaveCount(0);
    await expect(hero(page).getByText("See the fallback path this drill just ran.")).toBeVisible();
    await hero(page).getByRole("button", { name: "Turn on X-ray →" }).click();
    await expect(hero(page).getByText("X-RAY · FALLBACK TRACE · drill run [run id]")).toBeVisible();
    await expect(hero(page).getByText("× retry 1 of 1: kb.search(...) → timeout · [ms]")).toBeVisible();
    await expect(hero(page).getByText("› guard.no_sources → stop instead of answering")).toBeVisible();
    await hero(page).getByRole("button", { name: "Back to the fit check" }).click();
    await expect(page.getByLabel("Job description")).toBeVisible();
  });

  test("drills: rate limit", async ({ page }) => {
    await page.goto("/?xray=1");
    await hero(page).getByRole("button", { name: "hit the rate limit" }).click();
    await expect(hero(page).getByText("Failure drill · rate limit")).toBeVisible();
    await expect(hero(page).getByText("› llm.call skipped · nothing billed")).toBeVisible();
  });
});

test.describe("Break my AI", () => {
  test("attacks get a verdict and a held-up counter; X-ray names the guardrail", async ({ page }) => {
    await page.goto("/");
    await hero(page).getByRole("button", { name: "conflicting info" }).click();
    await expect(page.getByRole("heading", { name: "Try to make it overclaim." })).toBeVisible();
    await expect(hero(page).getByText("FLAGGED", { exact: true })).toBeVisible();
    await hero(page).getByRole("button", { name: "prompt injection" }).click();
    await expect(hero(page).getByText("REFUSED", { exact: true })).toBeVisible();
    await expect(hero(page).getByText("held up of 2")).toBeVisible();

    await page.getByLabel("Your own attempt").fill("What's the weather?");
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(hero(page).getByText("ANSWERED", { exact: true })).toBeVisible();
    await expect(hero(page).getByText("held up of 3")).toBeVisible();
    await expect(hero(page).getByRole("status").filter({ hasText: "held up of" })).toContainText("2");

    await expect(hero(page).getByText("guardrail fired:")).toHaveCount(0);
    await hero(page).getByRole("button", { name: "Turn on X-ray →" }).click();
    await expect(hero(page).getByText("guardrail fired: guard.prompt_injection · trace [run id] · [ms]")).toBeVisible();

    await hero(page).getByRole("button", { name: "Back to the fit check" }).click();
    await expect(page.getByLabel("Job description")).toBeVisible();
  });

  test("a failed attempt shows Ask's error line and isn't counted", async ({ page }) => {
    await stubMode(page, "error");
    await page.goto("/");
    await hero(page).getByRole("button", { name: "prompt injection" }).click();
    await expect(hero(page).getByRole("alert")).toHaveText("Ask my work couldn't answer this time. Try again, or ask Aswin directly.");
    await expect(hero(page).getByText("held up of 0")).toBeVisible();
  });

  test("a rate-limited attempt shows Ask's limit line", async ({ page }) => {
    await stubMode(page, "limited");
    await page.goto("/");
    await hero(page).getByRole("button", { name: "ambiguous ask" }).click();
    await expect(hero(page).getByRole("alert")).toHaveText("That's the limit for questions this hour. Aswin is one message away.");
  });

  test("keeps the last 6 attempts", async ({ page }) => {
    await page.goto("/");
    for (let i = 0; i < 7; i++) {
      await hero(page).getByRole("button", { name: "ambiguous ask" }).click();
      await expect(hero(page).getByText(`held up of ${Math.min(i + 1, 6)}`)).toBeVisible();
    }
    await expect(hero(page).getByText("CLARIFIED", { exact: true })).toHaveCount(6);
  });
});
