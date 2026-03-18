import { test, expect, type Page } from "@playwright/test";

async function expectMetadata(
  page: Page,
  title: string,
  description: string
) {
  await expect(page).toHaveTitle(title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    description
  );
}

test.describe("Critical Pages", () => {
  test("homepage loads", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=PageCraft").first()).toBeVisible();
    await expect(page.locator("text=Create Your Site")).toBeVisible();
    await expectMetadata(
      page,
      "Turn Notion Into Beautiful Websites | PageCraft",
      "Publish a polished site from Notion in minutes with templates, custom domains, analytics, and zero-code setup."
    );
  });

  test("create page loads", async ({ page }) => {
    const response = await page.goto("/create");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Create your site")).toBeVisible();
    await expect(page.locator("button:has-text('Generate')")).toBeVisible();
    await expectMetadata(
      page,
      "Create a Site | PageCraft",
      "Connect a Notion page, choose a template, and publish a PageCraft site in minutes."
    );
  });

  test("examples page loads", async ({ page }) => {
    const response = await page.goto("/examples");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Template Gallery")).toBeVisible();
    await expectMetadata(
      page,
      "Template Gallery | PageCraft",
      "Preview PageCraft templates for pages and databases before publishing your Notion content."
    );
  });

  test("dashboard loads", async ({ page }) => {
    const response = await page.goto("/dashboard");
    expect(response?.status()).toBe(200);
    
    // Dashboard should show either the unauthenticated sign-in state or the authenticated dashboard.
    await expect(
      page
        .getByRole("heading", { name: "Welcome to PageCraft" })
        .or(page.getByRole("heading", { name: "Quick Actions" }))
    ).toBeVisible();
  });

  test("domains page loads", async ({ page }) => {
    const response = await page.goto("/domains");
    expect(response?.status()).toBe(200);
    
    await expect(page.getByRole("heading", { name: "Upgrade to Pro" })).toBeVisible();
    await expectMetadata(
      page,
      "Upgrade to Pro | PageCraft",
      "Upgrade PageCraft to unlock custom domains, premium templates, analytics, and branding removal."
    );
  });

  test("payment success page loads", async ({ page }) => {
    const response = await page.goto("/payment/success?session_id=test");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Welcome to Pro").or(page.locator("text=Processing"))).toBeVisible();
  });

  test("payment cancel page loads", async ({ page }) => {
    const response = await page.goto("/payment/cancel");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Payment Cancelled")).toBeVisible();
  });
});

test.describe("API Endpoints", () => {
  test("debug API responds", async ({ request }) => {
    const response = await request.get("/api/debug?pageId=test");
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty("notionTokenSet");
  });

  test("domains API responds", async ({ request }) => {
    const response = await request.get("/api/domains?domain=test.com");
    // 应该返回 404（域名不存在）或 200
    expect([200, 404]).toContain(response.status());
  });
});
