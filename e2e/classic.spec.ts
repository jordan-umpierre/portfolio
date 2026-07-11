import { expect, test } from "@playwright/test";
import { projects } from "../src/content/projects";

test.describe("no-JS crawler view", () => {
  test.use({ javaScriptEnabled: false });

  test("home serves full content as raw HTML", async ({ page }) => {
    await page.goto("/");
    // Flagship evidence must be in the static HTML, never JS-gated.
    await expect(
      page.getByRole("heading", { name: "Freightline" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Sentinel Ops" }),
    ).toBeVisible();
    await expect(page.getByText("93-test CI suite")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Minsky's Pizza — 7 Years" }),
    ).toBeVisible();
    // Reveal elements must be fully visible without JS.
    const first = page.locator("[data-reveal]").first();
    await expect(first).toBeVisible();
    const opacity = await first.evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe("1");
  });
});

test("all 7 project pages return 200 with content", async ({ request }) => {
  expect(projects).toHaveLength(7);
  for (const p of projects) {
    const res = await request.get(`/project/${p.slug}`);
    expect(res.status(), p.slug).toBe(200);
    expect(await res.text()).toContain(p.name);
  }
});

test("OG title-deed images render as PNG", async ({ request }) => {
  for (const p of projects) {
    const res = await request.get(`/project/${p.slug}/opengraph-image`);
    expect(res.status(), p.slug).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
});

test("resume, PDF, sitemap, robots all resolve", async ({ request }) => {
  for (const path of [
    "/resume",
    "/resume.pdf",
    "/sitemap.xml",
    "/robots.txt",
  ]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
});

test("home has JSON-LD Person and per-section anchors", async ({ page }) => {
  await page.goto("/");
  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .first()
    .textContent();
  expect(JSON.parse(jsonLd!)["@type"]).toBe("Person");
  for (const id of [
    "featured-projects",
    "client-work",
    "skills",
    "experience",
    "education",
    "contact",
  ]) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
});
