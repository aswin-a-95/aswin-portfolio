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
