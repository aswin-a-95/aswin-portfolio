import { expect, test } from "@playwright/test";
import { JD_LABEL } from "./fixtures";

const theme = async (page: import("@playwright/test").Page) =>
  (await page.locator("html").getAttribute("data-xray")) === null ? null : "xray";

test("home: live 'Under the hood' card turns X-ray on and jumps to the hero", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.locator("#uh-h").locator("xpath=../..").getByRole("link", { name: /^tools/ }).click();
  await expect(page).toHaveURL(/#top$/);
  expect(await theme(page)).toBe("xray");
});

test("home: Check fit is disabled until there is a job description", async ({ page }) => {
  await page.goto("/");
  const check = page.getByRole("button", { name: "Check fit" });
  await expect(check).toBeDisabled();
  await page.getByLabel(JD_LABEL).fill("Senior PM, APIs");
  await expect(check).toBeEnabled();
});

test("home: 'How I built this' has no toggle and shows only in X-ray, as an X-ray panel", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: /How I built this/ })).toHaveCount(0);
  await expect(page.getByText("Honest note:")).toBeHidden();
  await page.goto("/?xray=1");
  const h = page.getByRole("heading", { level: 3, name: "How I built this" });
  await expect(h).toBeVisible();
  await expect(h).toHaveCSS("font-size", "22px");
  await expect(h.locator("xpath=..")).toHaveCSS("background-color", "rgb(16, 18, 20)");
  await expect(h.locator("xpath=..")).toHaveCSS("display", "grid");
  await expect(page.getByText("Honest note:")).toBeVisible();
});

test("home: the hood header (update 3)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByText("ACROSS ALL MY WORK", { exact: true }).first()).toBeVisible();
  const h2 = page.locator("#uh-h");
  await expect(h2).toHaveText("How I build agentic products, with proof");
  await expect(h2).toHaveCSS("font-size", "36px");
  await expect(page.getByText("Each part links to where you can see it working: live on this site, in a case study, or on GitHub.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Under the hood" })).toHaveCount(0);
});

test("removed X-ray-only lines stay gone in X-ray; the page never re-themes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/log?xray=1");
  await expect(page.getByText("written by Aswin · AI used for editing only · cross-posted to LinkedIn")).toHaveCount(0);
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(246, 243, 236)");
  await page.goto("/about?xray=1");
  await expect(page.getByText(/^knowledge base: /)).toHaveCount(0);
});

test("log: filters show counts, filter posts and the empty state (TIL stays upper-case)", async ({ page }) => {
  await page.goto("/log");
  await expect(page.getByRole("button", { name: "All 3" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Essays 1" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Teardowns 0" }).click();
  await expect(page.getByText("No teardowns yet. The first one is in the works.")).toBeVisible();
  await page.getByRole("button", { name: "TIL 0" }).click();
  await expect(page.getByText("No TIL yet. The first one is in the works.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Read a case study →" })).toHaveAttribute("href", "/work");
});

test("about: picking a project updates the dependency panel", async ({ page }) => {
  await page.goto("/about");
  const status = page.getByRole("status");
  await expect(status).toContainText("AI INTEGRATION BUILDER DEPENDS ON");
  await page.getByRole("button", { name: /^Job-search agent/ }).click();
  await expect(page.getByRole("button", { name: /^Job-search agent/ })).toHaveAttribute("aria-pressed", "true");
  await expect(status).toContainText("JOB-SEARCH AGENT DEPENDS ON");
  await expect(status).toContainText("Platform stakeholder work: an approval gate before anything irreversible");
});

test("case study: before/after tabs and the X-ray link button", async ({ page }) => {
  await page.goto("/work/cloudeagle");
  const manual = page.getByRole("button", { name: "Manual", exact: true });
  await manual.click();
  await expect(manual).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Both" })).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "How I built this (X-ray)" }).click();
  expect(await theme(page)).toBe("xray");
  await expect(page.getByRole("button", { name: "Close How I built this" })).toBeVisible();
  const trace = page.getByText(/^LOGGED TRACE · run .+ · real run, never a simulation$/);
  await expect(trace).toBeVisible();
  await expect(trace.locator("xpath=..")).toHaveCSS("background-color", "rgb(16, 18, 20)");
  await expect(trace.locator("xpath=..").getByText("X-RAY", { exact: true })).toBeVisible();
  const evals = page.getByText(/^OFFLINE EVAL SET · .+ cases incl\. red-team$/);
  await expect(evals).toBeVisible();
  await expect(evals.locator("xpath=..").getByText("X-RAY", { exact: true })).toBeVisible();
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(246, 243, 236)");
});

test("case study: rail is sticky from 900px only", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/work/cloudeagle");
  const rail = page.getByRole("navigation", { name: "Case study sections" });
  await expect(rail).toHaveCSS("position", "sticky");
  await page.setViewportSize({ width: 800, height: 900 });
  await expect(rail).toHaveCSS("position", "static");
});

test("case study: only CloudEagle has 'Try to break it'", async ({ page }) => {
  await page.goto("/work/cloudeagle");
  await expect(page.getByRole("heading", { name: "Try to break it" })).toBeVisible();
  await page.goto("/work/job-search-agent");
  await expect(page.getByRole("heading", { name: "Try to break it" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Job-search agent", level: 1 })).toBeVisible();
});

test("phone home: compact Under the hood and Work lists", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Proof, one tap away." })).toBeVisible();
  const hood = page.locator("#m-hood");
  await expect(hood).toHaveText("How I build agentic products, with proof");
  await expect(hood).toHaveCSS("font-size", "28px");
  await expect(page.getByText("Each part links to where you can see it working.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proof, one click away." })).toBeHidden();
  await expect(page.getByRole("link", { name: /Platform & API work/ })).toBeHidden();
});

test("unknown post slug is a 404", async ({ page }) => {
  expect((await page.goto("/log/nope"))?.status()).toBe(404);
});
