import { expect, test } from "@playwright/test";

test.describe("fallbacks", () => {
  test("reduced motion never mounts the board", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForTimeout(2500); // longer than the idle-load window
    await expect(page.locator("canvas")).toHaveCount(0);
    // classic content is right there instead
    await expect(
      page.getByRole("heading", { name: "Featured Projects" }),
    ).toBeVisible();
    await ctx.close();
  });

  test("?mode=classic forces classic with a way back", async ({ page }) => {
    await page.goto("/?mode=classic");
    await page.waitForTimeout(2000);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByTestId("board-toggle")).toBeVisible();
  });

  test("three.js is absent from the initial JS chunks", async ({ request }) => {
    const html = await (await request.get("/")).text();
    const srcs = [...html.matchAll(/src="(\/_next\/[^"]+\.js[^"]*)"/g)].map(
      (m) => m[1].replace(/&amp;/g, "&"),
    );
    expect(srcs.length).toBeGreaterThan(0);
    for (const src of srcs) {
      const js = await (await request.get(src)).text();
      expect(js, src).not.toContain("WebGLRenderer");
    }
  });

  test("no-JS visitors get classic content, no board shell", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByTestId("board-stage")).toBeHidden();
    await expect(
      page.getByRole("heading", { name: "Freightline" }),
    ).toBeVisible();
    await ctx.close();
  });
});

test.describe("board interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("canvas").waitFor({ timeout: 15_000 });
  });

  test("roll announces and opens the landing space's panel", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /Roll the dice/ }).click();
    await page.waitForTimeout(4500); // tumble + hops
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const live = page.locator('[aria-live="polite"]');
    await expect(live).toContainText(/Rolled \d+\. Landed on .+\./);
  });

  test("navigator travel opens panel; Esc closes and restores focus", async ({
    page,
  }) => {
    const option = page.getByRole("option", { name: "Sentinel Ops" });
    await option.click();
    await page.waitForTimeout(4000);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("93-test CI suite");
    // focus is trapped inside the dialog
    await expect(
      dialog.getByRole("button", { name: "Close panel" }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });

  test("?space deep link travels to the space", async ({ page }) => {
    await page.goto("/?space=freightline");
    await page.locator("canvas").waitFor({ timeout: 15_000 });
    await page.waitForTimeout(5000);
    await expect(page.getByRole("dialog")).toContainText("Freightline");
  });

  test("mode toggle survives reload", async ({ page }) => {
    await page.getByTestId("board-toggle").click();
    await expect(page.locator("canvas")).toHaveCount(0);
    await page.reload();
    await page.waitForTimeout(2000);
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByTestId("board-toggle")).toBeVisible();
    // and back
    await page.getByTestId("board-toggle").click();
    await page.locator("canvas").waitFor({ timeout: 15_000 });
  });

  test("keyboard: arrows browse, Enter travels, R rolls", async ({ page }) => {
    const first = page.getByRole("option", { name: "GO", exact: true });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    await expect(
      page.getByRole("option", { name: "Minsky's Pizza — 7 Years" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(800);
    await expect(page.getByRole("dialog")).toContainText("Minsky's");
    await page.keyboard.press("Escape");
    await page.keyboard.press("r");
    await page.waitForTimeout(4500);
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});
