import { expect, test } from "@playwright/test";

const toggle = (page: import("@playwright/test").Page) => page.getByRole("button", { name: /^X-ray/ });
const theme = (page: import("@playwright/test").Page) => page.locator("html").getAttribute("data-theme");

test("starts light, toggles to X-ray and updates aria-pressed", async ({ page }) => {
  await page.goto("/about");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  expect(await theme(page)).toBeNull();
  await toggle(page).click();
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  expect(await theme(page)).toBe("xray");
  await toggle(page).click();
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  expect(await theme(page)).toBeNull();
});

test("X-ray persists across navigation and reloads", async ({ page }) => {
  await page.goto("/");
  await toggle(page).click();
  await page.getByRole("link", { name: "Build log" }).click();
  await expect(page).toHaveURL(/\/log$/);
  expect(await theme(page)).toBe("xray");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  expect(await theme(page)).toBe("xray");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
});

test("?xray=1 turns X-ray on before first paint and sticks", async ({ page }) => {
  await page.goto("/about?xray=1");
  expect(await theme(page)).toBe("xray");
  await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
  await page.goto("/log");
  expect(await theme(page)).toBe("xray");
});

test("current page link is marked, including case studies", async ({ page }) => {
  await page.goto("/work/cloudeagle");
  const main = page.getByRole("navigation", { name: "Main" });
  await expect(main.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
  await expect(main.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current", "page");
});

test("unknown case study slug is a 404", async ({ page }) => {
  const res = await page.goto("/work/nope");
  expect(res?.status()).toBe(404);
});

test.describe("intro banner", () => {
  const banner = (page: import("@playwright/test").Page) => page.getByRole("region", { name: "About X-ray mode" });

  test("shows with a NEW pill on home only, and 'Got it' dismisses it for good", async ({ page }) => {
    await page.goto("/");
    await expect(banner(page)).toBeVisible();
    await expect(toggle(page)).toContainText("NEW");
    await page.goto("/about");
    await expect(banner(page)).toHaveCount(0);
    await expect(toggle(page)).not.toContainText("NEW");
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Got it" }).click();
    await expect(banner(page)).toHaveCount(0);
    await expect(toggle(page)).not.toContainText("NEW");
    await page.reload();
    await expect(page.locator("main")).toBeAttached();
    await expect(banner(page)).toHaveCount(0);
  });

  test("'Turn on X-ray' switches the theme and hides the banner", async ({ page }) => {
    await page.goto("/");
    await banner(page).getByRole("button", { name: "Turn on X-ray" }).click();
    expect(await theme(page)).toBe("xray");
    await expect(banner(page)).toHaveCount(0);
    // Turning X-ray off again does not bring the banner back (it was seen).
    await toggle(page).click();
    await expect(banner(page)).toHaveCount(0);
  });

  test("uses the phone copy at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(banner(page).getByText(/^It shows the sources, guardrails/)).toBeVisible();
    await expect(banner(page).getByText(/^One switch shows/)).toBeHidden();
  });

  test("uses the desktop copy at 1440px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(banner(page).getByText(/^One switch shows/)).toBeVisible();
    await expect(banner(page).getByText(/^It shows the sources, guardrails/)).toBeHidden();
  });
});

test("footer line is on every page", async ({ page }) => {
  for (const path of ["/", "/work", "/work/cloudeagle", "/log", "/about"]) {
    await page.goto(path);
    await expect(page.getByText("This site is an AI product. Turn on X-ray to see how it works.")).toBeVisible();
  }
});
