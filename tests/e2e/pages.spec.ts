import { expect, test } from "@playwright/test";
import { JD_LABEL } from "./fixtures";

const theme = (page: import("@playwright/test").Page) => page.locator("html").getAttribute("data-theme");

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

test("home: '+ How I built this' toggles, and opens itself in X-ray", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: /How I built this/ });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Honest note:")).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveText("− How I built this");
  await expect(page.getByText("Honest note:")).toBeVisible();
  await page.goto("/?xray=1");
  await expect(page.getByRole("button", { name: /How I built this/ })).toHaveAttribute("aria-expanded", "true");
});

test("X-ray-only blocks show only in X-ray", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/log");
  const line = page.getByText("written by Aswin · AI used for editing only · cross-posted to LinkedIn").first();
  await expect(line).toBeHidden();
  await page.getByRole("button", { name: /^X-ray/ }).click();
  await expect(line).toBeVisible();
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
  await expect(page.getByText(/X-RAY · LOGGED TRACE/)).toBeVisible();
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
  await expect(page.getByRole("heading", { name: "Proof, one click away." })).toBeHidden();
  await expect(page.getByRole("link", { name: /Platform & API work/ })).toBeHidden();
});

test("unknown post slug is a 404", async ({ page }) => {
  expect((await page.goto("/log/nope"))?.status()).toBe(404);
});
