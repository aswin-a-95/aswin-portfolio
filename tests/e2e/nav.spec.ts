import { expect, test, type Page } from "./fixtures";

// Sticky nav: Aswin's request, not in the 13 Nov artboards.
const header = (page: Page) => page.locator("header").filter({ has: page.getByRole("navigation", { name: "Main" }) });

for (const width of [1440, 390]) {
  test.describe(`sticky nav at ${width}px`, () => {
    test.use({ viewport: { width, height: 800 } });

    for (const path of ["/", "/work", "/work/integration-builder", "/log", "/about"]) {
      test(`stays at the top while ${path} scrolls`, async ({ page }) => {
        await page.goto(path);
        const scrolls = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight);
        test.skip(!scrolls, `${path} is shorter than the viewport`);
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
        const box = await header(page).boundingBox();
        expect(box?.y).toBe(0);
      });
    }

    test("#contact lands below the nav, not under it", async ({ page }) => {
      await page.goto("/#contact");
      const navH = (await header(page).boundingBox())!.height;
      await expect
        .poll(async () => (await page.locator("#contact").boundingBox())!.y)
        .toBeGreaterThanOrEqual(navH - 1);
    });
  });
}

test.describe("case-study rail", () => {
  test.use({ viewport: { width: 1440, height: 800 } });

  test("rail links land below the nav; the rail sticks 24px under it", async ({ page }) => {
    await page.goto("/work/integration-builder");
    const rail = page.getByRole("navigation", { name: "Case study sections" });
    const last = rail.getByRole("link").last();
    const id = (await last.getAttribute("href"))!.slice(1);
    await last.click();
    const navH = (await header(page).boundingBox())!.height;
    await expect.poll(async () => (await page.locator(`[id="${id}"]`).boundingBox())!.y).toBeGreaterThanOrEqual(navH - 1);
    await expect.poll(async () => Math.round((await rail.boundingBox())!.y)).toBe(Math.round(navH + 24));
  });
});

test("Ask dialog's scrim covers the sticky nav, and the nav is inert", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.getByRole("navigation", { name: "Main" }).getByRole("button", { name: /^Ask my work/ }).click();
  await expect(page.getByRole("dialog", { name: "Ask my work" })).toBeVisible();
  const box = (await header(page).boundingBox())!;
  const top = await page.evaluate(
    ([x, y]) => document.elementFromPoint(x, y)?.closest("header") === null,
    [box.x + box.width - 20, box.y + box.height / 2],
  );
  expect(top).toBe(true);
  await expect(header(page)).toHaveJSProperty("inert", false); // header itself isn't flagged…
  expect(await header(page).evaluate((el) => el.closest("[inert]") !== null)).toBe(true); // …its page wrapper is.
});
