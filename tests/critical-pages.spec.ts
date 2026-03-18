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

  test("create page accepts a full Notion URL", async ({ page }) => {
    const expectedPageId = "1234567890abcdef1234567890abcdef";
    const notionUrl = `https://www.notion.so/Marshall-WU-${expectedPageId}?pvs=4`;

    await page.route("**/api/validate-page**", async (route) => {
      const requestUrl = new URL(route.request().url());
      expect(requestUrl.searchParams.get("pageId")).toBe(expectedPageId);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          type: "page",
          title: "Test Page",
          url: notionUrl,
        }),
      });
    });

    await page.goto("/create");
    await page.getByLabel("Notion page ID or URL").fill(notionUrl);
    await expect(page.getByText(`Detected page ID: ${expectedPageId}`)).toBeVisible();
    await page.getByRole("button", { name: /Generate Site/i }).click();

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("create page accepts a hyphenated Notion URL", async ({ page }) => {
    const hyphenatedPageId = "12345678-90ab-cdef-1234-567890abcdef";
    const normalizedPageId = "1234567890abcdef1234567890abcdef";
    const notionUrl = `https://www.notion.so/workspace/Test-Page-${hyphenatedPageId}?pvs=4`;

    await page.route("**/api/validate-page**", async (route) => {
      const requestUrl = new URL(route.request().url());
      expect(requestUrl.searchParams.get("pageId")).toBe(normalizedPageId);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          type: "page",
          title: "Test Page",
          url: notionUrl,
        }),
      });
    });

    await page.goto("/create");
    await page.getByLabel("Notion page ID or URL").fill(notionUrl);
    await expect(page.getByText(`Detected page ID: ${normalizedPageId}`)).toBeVisible();
    await page.getByRole("button", { name: /Generate Site/i }).click();

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
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
    const response = await request.get("/api/debug");
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty("notionTokenSet");
  });

  test("debug API flags invalid page IDs without calling Notion", async ({ request }) => {
    const response = await request.get("/api/debug?pageId=test");
    expect(response.status()).toBe(200);

    await expect(response.json()).resolves.toMatchObject({
      tests: {
        page: {
          success: false,
          error: "Invalid Notion page identifier",
        },
        database: {
          success: false,
          error: "Invalid Notion page identifier",
        },
      },
    });
  });

  test("domains API responds", async ({ request }) => {
    const response = await request.get("/api/domains?domain=test.com");
    // 应该返回 404（域名不存在）或 200
    expect([200, 404]).toContain(response.status());
  });

  test("verify payment rejects missing session ID", async ({ request }) => {
    const response = await request.post("/api/verify-payment", {
      data: {},
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Session ID required",
    });
  });

  test("verify payment rejects empty JSON bodies", async ({ request }) => {
    const response = await request.fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "A JSON body with sessionId is required",
    });
  });
});
