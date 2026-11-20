import { expect, test } from "@playwright/test";
import { JD_LABEL } from "./fixtures";

const theme = async (page: import("@playwright/test").Page) =>
  (await page.locator("html").getAttribute("data-xray")) === null ? null : "xray";

const hoodGrid = (page: import("@playwright/test").Page) => page.locator("#uh-h").locator("xpath=../..");

test("home: live 'How I build' card turns X-ray on and jumps to the hero", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await hoodGrid(page).getByRole("link", { name: /^tools/ }).click();
  await expect(page).toHaveURL(/#top$/);
  expect(await theme(page)).toBe("xray");
});

test("home: the production card turns X-ray on first, then scrolls to Break my AI (update 4)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("#break-my-ai")).toHaveCount(0);
  await hoodGrid(page).getByRole("link", { name: /^production/ }).click();
  await expect(page).toHaveURL(/#break-my-ai$/);
  expect(await theme(page)).toBe("xray");
  await expect(page.locator("#break-my-ai")).toBeInViewport();
});

test("home: 12 proof cards in the design's order, pills and CTAs (update 4)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const grid = hoodGrid(page).locator("div.grid");
  await expect(grid).toHaveCSS("grid-template-columns", /px/);
  await expect(grid).toHaveCSS("row-gap", "14px");
  const names = grid.locator(":scope > * > span:first-child > span:first-child");
  await expect(names).toHaveText(["agents", "skills", "tools", "orchestration", "memory", "production", "guardrails", "evals", "human in loop", "data privacy", "rag", "mcp server"]);
  await expect(grid.getByText("[25] test JDs and red-team cases, run before every change.")).toBeVisible();
  await expect(grid.getByRole("link", { name: /^agents/ })).toHaveAttribute("href", "/work/job-search-agent");
  await expect(grid.getByRole("link", { name: /^skills/ })).toHaveAttribute("href", "#");
  await expect(grid.getByRole("link", { name: /^evals/ })).toHaveAttribute("href", "#");
  await expect(grid.getByRole("link", { name: /^guardrails/ })).toHaveAttribute("href", "#break-my-ai");
  // The arrow is part of the CTA; the planned card is not a link and its CTA is muted.
  await expect(grid.getByText("Read the job-search study →", { exact: true })).toBeVisible();
  await expect(grid.getByRole("link", { name: /^mcp server/ })).toHaveCount(0);
  await expect(grid.getByText("Coming soon", { exact: true })).toHaveCSS("color", "rgb(92, 87, 78)");
  await expect(grid.getByText("View the skill →", { exact: true })).toHaveCSS("color", "rgb(31, 76, 134)");
  // shipped: ink border and text; prototype and planned: dashed rule border.
  const pill = (status: string) => grid.getByText(status, { exact: true }).first();
  await expect(pill("shipped")).toHaveCSS("border-top-color", "rgb(27, 26, 23)");
  await expect(pill("shipped")).toHaveCSS("color", "rgb(27, 26, 23)");
  await expect(pill("prototype")).toHaveCSS("border-top-style", "dashed");
  await expect(pill("planned")).toHaveCSS("border-top-style", "dashed");
  await expect(pill("GitHub")).toHaveCSS("border-top-style", "solid");
  await expect(pill("live here")).toHaveCSS("background-color", "rgb(232, 238, 246)");
});

test("home: Products I've built, with How it works and the human step in amber (update 4)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Before / after AI" })).toHaveCount(0);
  const h2 = page.locator("#work-h");
  await expect(h2).toHaveText("Products I've built");
  await expect(h2).toHaveCSS("font-size", "40px");
  const section = page.getByRole("region", { name: "Products I've built" });
  await expect(section.getByText("CASE STUDIES", { exact: true })).toBeVisible();
  await expect(section.getByText("Four AI products, each with a case study written like a PRD: the problem, the trade-offs, the safeguards and what's next.")).toBeVisible();
  const cards = section.getByRole("article");
  await expect(cards).toHaveCount(4);
  await expect(cards.getByRole("heading", { level: 3 })).toHaveText([
    "AI job search and apply agent",
    "Job-fit AI on this site",
    "AI integration builder for long-tail apps",
    "Instagram content intelligence agent",
  ]);
  const first = cards.first();
  await expect(first).toHaveCSS("border-radius", "16px");
  await expect(first).toHaveCSS("padding-top", "28px");
  // No status pill on the desktop cards.
  await expect(first.getByText("IN USE · RECORDED RUN")).toHaveCount(0);
  await expect(first.getByRole("listitem")).toHaveText([
    "1Search LinkedIn and save matches",
    "2Write the ideal resume for the JD",
    "3Tailor mine with a three-way map",
    "4Wait for my approval  · person decides",
    "5Apply",
  ]);
  await expect(first.getByText("Wait for my approval", { exact: false })).toHaveCSS("color", "rgb(138, 85, 16)");
  await expect(first.getByText("4", { exact: true })).toHaveCSS("border-top-style", "dashed");
  await expect(first.getByText("4", { exact: true })).toHaveCSS("background-color", "rgb(251, 242, 226)");
  await expect(first.getByRole("link", { name: "Watch the recorded run" })).toHaveAttribute("href", "/work/job-search-agent");
  await expect(first.getByRole("link", { name: "Watch the recorded run" })).toHaveCSS("background-color", "rgb(27, 26, 23)");
  await expect(cards.nth(1).getByRole("link", { name: "Try it above ↑" })).toHaveAttribute("href", "#fit-h");
  await expect(cards.nth(1).getByRole("link", { name: "Read the case study →" })).toHaveAttribute("href", "/work/fit-check");
  await expect(cards.nth(2).getByText("[e.g. the spec, Figma flows and the clickable prototype]")).toBeVisible();
  await expect(cards.nth(2).getByRole("link", { name: "Run it locally" })).toHaveAttribute("href", "#");
  await expect(cards.nth(2).getByRole("link", { name: "Read the case study →" })).toHaveAttribute("href", "/work/cloudeagle");
});

test("footer: build date on every page; the phone home footer is one line (update 4)", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const path of ["/", "/work/cloudeagle", "/log", "/about"]) {
    await page.goto(path);
    await expect(page.getByRole("contentinfo")).toContainText(/Updated \d{1,2} [A-Z][a-z]{2} \d{4} · © 2026 Aswin · \[domain\]/);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const footer = page.getByRole("contentinfo");
  await expect(footer).toHaveText(/^Updated \d{1,2} [A-Z][a-z]{2} \d{4} · © 2026 Aswin$/);
  await expect(footer).toHaveCSS("padding-top", "20px");
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

test("case study: CASE STUDIES breadcrumb, LAST UPDATED and the counter before and after an attempt (update 4)", async ({ page }) => {
  await page.goto("/work/cloudeagle");
  await expect(page.getByText("CASE STUDIES / 01 · CLOUDEAGLE.AI")).toBeVisible();
  await expect(page.getByRole("link", { name: "CASE STUDIES", exact: true })).toHaveAttribute("href", "/work");
  await expect(page.getByText("LAST UPDATED", { exact: true })).toBeVisible();
  const counter = page.locator("#s-break").getByRole("status");
  await expect(counter).toHaveText("No attempts yet");
  await expect(counter.getByText("No attempts yet")).toHaveCSS("font-size", "14px");
  expect((await page.goto("/work/fit-check"))?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Job-fit AI on this site", level: 1 })).toBeVisible();
});

test("phone home: compact hood list and Products I've built (update 4)", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const hood = page.locator("#m-hood");
  await expect(hood).toHaveText("How I build agentic products, with proof");
  await expect(hood).toHaveCSS("font-size", "28px");
  await expect(page.getByText("Each part links to where you can see it working.", { exact: true })).toBeVisible();
  const list = hood.locator("xpath=..");
  await expect(list.locator(":scope > a, :scope > div")).toHaveCount(12);
  await expect(list.getByRole("link", { name: /^production/ })).toHaveAttribute("href", "#break-my-ai");
  await expect(list.getByRole("link", { name: /^mcp server/ })).toHaveCount(0);
  // Phone pills are never dashed; shipped is ink.
  await expect(list.getByText("prototype", { exact: true })).toHaveCSS("border-top-style", "solid");
  await expect(list.getByText("shipped", { exact: true }).first()).toHaveCSS("color", "rgb(27, 26, 23)");

  const work = page.locator("#m-work").locator("xpath=..");
  await expect(page.locator("#m-work")).toHaveText("Products I've built");
  await expect(work.getByText("CASE STUDIES", { exact: true })).toBeVisible();
  await expect(work.getByRole("link")).toHaveCount(4);
  await expect(work.getByRole("link").nth(0)).toHaveText("IN USE · RECORDED RUNAI job search and apply agentsearch → tailor → wait for my approval → apply");
  await expect(work.getByText("wait for my approval", { exact: true })).toHaveCSS("color", "rgb(138, 85, 16)");
  await expect(work.getByRole("link").nth(1)).toHaveAttribute("href", "#fit-h");
  await expect(work.getByRole("link").nth(1)).toHaveText("LIVE HEREJob-fit AI on this siteTry it above ↑");
  await expect(work.getByText("CONCEPT", { exact: true })).toHaveCSS("color", "rgb(92, 87, 78)");
  await expect(work.getByRole("link").nth(3)).toHaveText("IN USE · RECORDED RUNInstagram content intelligence agent");
  await expect(page.locator("#work-h")).toBeHidden();
});

test("unknown post slug is a 404", async ({ page }) => {
  expect((await page.goto("/log/nope"))?.status()).toBe(404);
});
