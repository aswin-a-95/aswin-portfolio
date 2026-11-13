import { test } from "@playwright/test";

// Not assertions: captures for the side-by-side check against /design/screenshots.
for (const [name, width, height] of [["1440", 1440, 900], ["390", 390, 844]] as const) {
  for (const xray of [false, true]) {
    test(`capture home ${name}${xray ? " xray" : ""}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(xray ? "/?xray=1" : "/");
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: `test-results/screens/home-${name}${xray ? "-xray" : ""}.png`, fullPage: true });
    });
  }
}
