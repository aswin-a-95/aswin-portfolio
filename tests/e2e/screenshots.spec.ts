import { test } from "@playwright/test";

// Not assertions: full-page captures for the side-by-side check against /design/screenshots.
const PAGES = ["/", "/work", "/work/cloudeagle", "/work/job-search-agent", "/log", "/log/integrations-experience-is-agent-experience", "/about"];
const SIZES = [
  ["1440", 1440, 900],
  ["390", 390, 844],
] as const;

for (const path of PAGES) {
  for (const [name, width, height] of SIZES) {
    for (const xray of [false, true]) {
      const file = `${path === "/" ? "home" : path.slice(1).replace(/\//g, "_")}-${name}${xray ? "-xray" : ""}`;
      test(`capture ${file}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(xray ? `${path}?xray=1` : path);
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: `test-results/screens/${file}.png`, fullPage: true });
      });
    }
  }
}

// Ask my work, for the side-by-side check against the Ask and MobileAsk artboards.
const ASK_STATES: [string, string | null][] = [
  ["start", null],
  ["answer", "Has he worked on APIs?"],
  ["todo", "What's his biggest platform win?"],
  ["refuse", "prompt injection"],
  ["none", "something he hasn't done"],
  ["clarify", "ambiguous ask"],
];
for (const [name, width, height] of SIZES) {
  for (const xray of [false, true]) {
    for (const [state, pick] of ASK_STATES) {
      const file = `ask-${state}-${name}${xray ? "-xray" : ""}`;
      test(`capture ${file}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(xray ? "/?xray=1" : "/");
        await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: /^Ask my work/ }).click();
        const dialog = page.getByRole("dialog", { name: "Ask my work" });
        if (pick) {
          await dialog.getByRole("button", { name: pick }).first().click();
          await dialog.getByRole("button", { name: "← Ask another" }).waitFor();
        }
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: `test-results/screens/${file}.png` });
      });
    }
  }
}

// Fit-check hero, for the side-by-side check against HeroStates and Mobile.
// [state, stub mode, action]: the mock streams the same events as /api/run.
const HERO_STATES: [string, string | null, string | null][] = [
  ["empty", null, null],
  ["running", "hold", "Senior Platform PM"],
  ["result", null, "Senior Platform PM"],
  ["badfit", null, "A bad fit, on purpose"],
  ["break", null, "conflicting info"],
  ["error", "error", "Senior Platform PM"],
  ["limited", "limited", "Senior Platform PM"],
  ["drill-kb", null, "knowledge base offline"],
];
for (const [name, width, height] of SIZES) {
  for (const xray of [false, true]) {
    for (const [state, mode, pick] of HERO_STATES) {
      const file = `hero-${state}-${name}${xray ? "-xray" : ""}`;
      test(`capture ${file}`, async ({ page }) => {
        if (mode) await page.addInitScript((m) => window.sessionStorage.setItem("fit-stub", m), mode);
        await page.setViewportSize({ width, height });
        await page.goto(xray ? "/?xray=1" : "/");
        const hero = page.locator("section").first();
        if (pick) {
          await hero.getByRole("button", { name: pick, exact: true }).click();
          if (state === "break") {
            await hero.getByText("FLAGGED", { exact: true }).waitFor();
            await hero.getByRole("button", { name: "prompt injection" }).click();
            await hero.getByText("held up of 2").waitFor();
          } else if (state === "running") {
            await hero.getByText("running…").waitFor();
            await hero.getByRole("status").getByText(/evidence\.map/).waitFor();
          } else {
            await hero.getByRole("heading", { level: 2 }).waitFor();
          }
        }
        await page.evaluate(() => document.fonts.ready);
        await hero.screenshot({ path: `test-results/screens/${file}.png` });
      });
    }
  }
}
